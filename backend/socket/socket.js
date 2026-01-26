import { Server } from "socket.io";

const socketManager = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  const rooms = new Map();
  let matchmakingQueue = []; // { socketId, user, matchType }

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("start_matchmaking", async ({ user, matchType }) => {
      console.log(`${user.username} started matchmaking for ${matchType}`);

      // 1. Remove user if already in queue (prevents duplicates)
      matchmakingQueue = matchmakingQueue.filter(p => String(p.user._id) !== String(user._id));

      // 2. Check for a compatible opponent
      const opponent = matchmakingQueue.find(p => p.matchType === matchType && String(p.user._id) !== String(user._id));

      if (opponent) {
        // MATCH FOUND!
        matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== opponent.socketId);

        try {
          // 3. Create a shared battle in the database
          const { IndividualBattle } = await import("../models/IndividualBattle.model.js");
          const { Problem } = await import("../models/problem.model.js");

          const problems = await Problem.find({});
          if (!problems.length) {
            socket.emit("match_error", "No problems available for battle");
            return;
          }
          const randomProblem = problems[Math.floor(Math.random() * problems.length)];

          const now = new Date();
          const durationMinutes = 20;
          const end = new Date(now.getTime() + durationMinutes * 60 * 1000);

          const battle = await IndividualBattle.create({
            battleType: matchType,
            player1: { userId: opponent.user._id, problemId: randomProblem._id },
            player2: { userId: user._id, problemId: randomProblem._id },
            problemIds: [randomProblem._id],
            startTime: now,
            endTime: end,
            status: "active",
          });

          // 4. Notify both players
          io.to(socket.id).emit("match_found", { battle, opponent: opponent.user });
          io.to(opponent.socketId).emit("match_found", { battle, opponent: user });

          console.log(`Match found: ${opponent.user.username} vs ${user.username}`);
        } catch (err) {
          console.error("Matchmaking error:", err);
          socket.emit("match_error", "Failed to create battle");
        }
      } else {
        // 5. Add to queue
        matchmakingQueue.push({ socketId: socket.id, user, matchType });
        console.log(`User ${user.username} added to queue. Queue size: ${matchmakingQueue.length}`);
      }
    });

    socket.on("cancel_matchmaking", ({ userId }) => {
      matchmakingQueue = matchmakingQueue.filter(p => String(p.user._id) !== String(userId));
      console.log(`User ${userId} cancelled matchmaking`);
    });

    socket.on("join_battle", ({ battleId, user }) => {
      socket.join(battleId);
      if (!rooms.has(battleId)) {
        rooms.set(battleId, { players: [], status: "active" });
      }
      const room = rooms.get(battleId);
      if (!room.players.find(p => String(p.userId) === String(user._id))) {
        room.players.push({ ...user, userId: user._id, socketId: socket.id, progress: 0 });
      }
      io.to(battleId).emit("room_state", room);
    });

    socket.on("update_progress", ({ battleId, userId, progress }) => {
      const room = rooms.get(battleId);
      if (room) {
        const player = room.players.find(p => String(p.userId) === String(userId));
        if (player) {
          player.progress = progress;
          socket.to(battleId).emit("opponent_progress", { userId, progress });
        }
      }
    });

    socket.on("battle_submission", ({ battleId, userId, submission }) => {
      socket.to(battleId).emit("opponent_submitted", { userId, submission });
    });

    socket.on("disconnect", () => {
      matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export default socketManager;
