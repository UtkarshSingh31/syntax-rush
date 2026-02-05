import { Server } from "socket.io";
import matchmaker from "../utils/matchmaker.js";

const socketManager = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  const rooms = new Map();

  // Periodic task to expand matchmaking tolerances and find matches
  setInterval(() => {
    matchmaker.expandTolerances();

    // Attempt to match players who are waiting
    const processedUsers = new Set();

    for (const entry of matchmaker.queue) {
      if (processedUsers.has(String(entry.user._id))) continue;

      const match = matchmaker.findMatch(entry.user._id);
      if (match) {
        const [p1, p2] = match;
        processedUsers.add(String(p1.user._id));
        processedUsers.add(String(p2.user._id));
        createMatch(p1, p2);
      }
    }
  }, 5000); // Check every 5 seconds

  async function createMatch(playerA, playerB) {
    try {
      const { IndividualBattle } = await import("../models/IndividualBattle.model.js");
      const { Problem } = await import("../models/problem.model.js");

      const problems = await Problem.find({});
      if (!problems.length) {
        io.to(playerA.socketId).emit("match_error", "No problems available for battle");
        io.to(playerB.socketId).emit("match_error", "No problems available for battle");
        return;
      }
      const randomProblem = problems[Math.floor(Math.random() * problems.length)];

      const now = new Date();
      const durationMinutes = 20;
      const end = new Date(now.getTime() + durationMinutes * 60 * 1000);

      const battle = await IndividualBattle.create({
        battleType: playerA.matchType,
        player1: { userId: playerA.user._id, problemId: randomProblem._id },
        player2: { userId: playerB.user._id, problemId: randomProblem._id },
        problemIds: [randomProblem._id],
        startTime: now,
        endTime: end,
        status: "active",
      });

      // Notify both players
      io.to(playerA.socketId).emit("match_found", { battle, opponent: playerB.user });
      io.to(playerB.socketId).emit("match_found", { battle, opponent: playerA.user });

      console.log(`Match created: ${playerA.user.username} vs ${playerB.user.username}`);
    } catch (err) {
      console.error("Battle creation error:", err);
      io.to(playerA.socketId).emit("match_error", "Failed to create battle");
      io.to(playerB.socketId).emit("match_error", "Failed to create battle");
    }
  }

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("start_matchmaking", async ({ user, matchType }) => {
      console.log(`${user.username} started matchmaking for ${matchType}`);

      // Add player to matchmaker queue
      matchmaker.addPlayer(socket.id, user, matchType);

      // Immediate match check
      const match = matchmaker.findMatch(user._id);
      if (match) {
        const [p1, p2] = match;
        createMatch(p1, p2);
      }
    });

    socket.on("cancel_matchmaking", ({ userId }) => {
      matchmaker.removePlayer(userId);
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
      // Find user by socketId to remove from queue
      const entry = matchmaker.queue.find(p => p.socketId === socket.id);
      if (entry) {
        matchmaker.removePlayer(entry.user._id);
      }
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

export default socketManager;
