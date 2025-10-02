import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { IndividualBattle } from "../models/IndividualBattle.model.js";
import { Problem } from "../models/problem.model.js";
import { Submission } from "../models/submission.model.js";
import { createSubmission as judgeCreate, waitForResult } from "../utils/judge0.js";

const create1v1 = AsyncHandler(async (req, res) => {
  const { opponentId, problemIds, durationMinutes = 20, battleType = "1v1_classic" } = req.body;
  if (!opponentId) throw new ApiError(400, "opponentId is required");
  if (!Array.isArray(problemIds) || problemIds.length === 0) throw new ApiError(400, "problemIds required");

  const now = new Date();
  const end = new Date(now.getTime() + durationMinutes * 60 * 1000);

  const battle = await IndividualBattle.create({
    battleType,
    player1: { userId: req.user._id, problemId: problemIds[0] },
    player2: { userId: opponentId, problemId: problemIds[0] },
    problemIds,
    startTime: now,
    endTime: end,
    status: "active",
  });

  return res.status(201).json(new ApiResponse(201, { battle }, "battle created"));
});

const getBattle = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const battle = await IndividualBattle.findById(id)
    .populate("player1.userId", "username")
    .populate("player2.userId", "username")
    .populate("problemIds", "title problemNumber");
  if (!battle) throw new ApiError(404, "battle not found");
  if (!isParticipant(battle, req.user._id) && req.user.position !== "admin") {
    throw new ApiError(403, "forbidden");
  }
  return res.status(200).json(new ApiResponse(200, { battle }));
});

function isParticipant(battle, userId) {
  return (
    String(battle.player1?.userId) === String(userId) ||
    String(battle.player2?.userId) === String(userId)
  );
}

const submitToBattle = AsyncHandler(async (req, res) => {
  const { id } = req.params; // battle id
  const { code, language } = req.body;
  if (!code || !language) throw new ApiError(400, "code and language are required");

  const battle = await IndividualBattle.findById(id);
  if (!battle) throw new ApiError(404, "battle not found");
  if (!isParticipant(battle, req.user._id)) throw new ApiError(403, "forbidden");
  if (battle.status !== "active") throw new ApiError(400, "battle not active");
  if (new Date() > new Date(battle.endTime)) throw new ApiError(400, "battle ended");

  // Select current problem (first unsolved or first)
  const currentProblemId = battle.problemIds[0];
  const problem = await Problem.findById(currentProblemId);
  if (!problem) throw new ApiError(404, "problem not found");

  // Evaluate with same routine as submissions controller
  const testCases = problem.testCases || [];
  if (!testCases.length) throw new ApiError(400, "problem has no test cases");

  const language_id = typeof language === "number" ? language : undefined;

  // Parallelize Judge0 submissions
  const tokens = await Promise.all(testCases.map(async t => {
    const payload = {
      source_code: code,
      language_id,
      stdin: t.input ?? "",
      expected_output: (t.output ?? "").toString(),
      cpu_time_limit: Math.ceil((problem.timeLimitMs ?? 2000) / 1000),
      memory_limit: Math.ceil((problem.memoryLimitKb ?? 256000) / 1024),
    };
    const { token } = await judgeCreate(payload);
    return token;
  }));

  // Parallelize waiting for results
  const results = await Promise.all(tokens.map(token =>
    waitForResult(token, { timeoutMs: 20000 })
  ));

  let passed = 0;
  let maxExecMs = 0;
  for (const result of results) {
    const statusId = result?.status?.id;
    if (statusId === 3) passed += 1;
    const timeSec = parseFloat(result?.time ?? 0);
    if (!Number.isNaN(timeSec)) {
      const ms = Math.round(timeSec * 1000);
      if (ms > maxExecMs) maxExecMs = ms;
    }
  }

  const accepted = passed === testCases.length;

  // Persist submission
  const sub = await Submission.create({
    user: req.user._id,
    problemId: problem._id,
    code,
    language: typeof language === "number" ? String(language) : String(language),
    status: accepted ? "accepted" : passed > 0 ? "wrong_answer" : "wrong_answer",
    executionTime: maxExecMs,
    memoryUsed: undefined,
    testcasesPassed: passed,
    totalTestcases: testCases.length,
  });

  // Update battle state for the submitting player
  const isP1 = String(battle.player1.userId) === String(req.user._id);
  const player = isP1 ? battle.player1 : battle.player2;
  player.submissionId = sub._id;
  player.score = accepted ? 100 : Math.floor((passed / testCases.length) * 100);
  player.status = accepted ? "solved" : "participating";
  player.solvedAt = accepted ? new Date() : player.solvedAt;

  // Decide winner if both submitted or time over
  let winner = battle.winner;
  if (battle.player1.submissionId && battle.player2.submissionId) {
    if ((battle.player1.score ?? 0) > (battle.player2.score ?? 0)) {
      winner = battle.player1.userId;
    } else if ((battle.player2.score ?? 0) > (battle.player1.score ?? 0)) {
      winner = battle.player2.userId;
    } else {
      // tie: earlier solvedAt wins if accepted, else none
      if (battle.player1.status === "solved" && battle.player2.status === "solved") {
        winner = (new Date(battle.player1.solvedAt) <= new Date(battle.player2.solvedAt)) ? battle.player1.userId : battle.player2.userId;
      }
    }
    battle.status = "completed";
  }

  battle.winner = winner ?? battle.winner;
  await battle.save();

  return res.status(200).json(new ApiResponse(200, { battle, submission: sub }, "battle submission processed"));
});

export { create1v1, getBattle, submitToBattle };


