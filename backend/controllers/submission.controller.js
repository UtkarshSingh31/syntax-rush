import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Submission } from "../models/submission.model.js";
import { Problem } from "../models/problem.model.js";
import { createSubmission as judgeCreate, waitForResult } from "../utils/judge0.js";

// Map common language strings to Judge0 language IDs (client can also pass numeric id)
const JUDGE0_LANG_IDS = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  go: 60,
};

function resolveLanguageId(language) {
  if (typeof language === "number") return language;
  if (!language) return undefined;
  const key = String(language).toLowerCase();
  return JUDGE0_LANG_IDS[key];
}

const submitSolution = AsyncHandler(async (req, res) => {
  const { problemId, code, language } = req.body;

  if (!problemId) throw new ApiError(400, "problemId is required");
  if (!code) throw new ApiError(400, "code is required");
  if (!language) throw new ApiError(400, "language is required");

  const language_id = resolveLanguageId(language);
  if (!language_id) throw new ApiError(400, "unsupported language");

  const problem = await Problem.findById(problemId);
  if (!problem) throw new ApiError(404, "problem not found");

  const testCases = problem.testCases || [];
  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new ApiError(400, "problem has no test cases configured");
  }

  // Parallelize Judge0 submissions
  const tokens = await Promise.all(
    testCases.map(async (t) => {
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
    })
  );

  // Parallelize waiting for results
  const results = await Promise.all(
    tokens.map((token) => waitForResult(token, { timeoutMs: 20000 }))
  );

  let totalPassed = 0;
  let maxExecMs = 0;
  let totalMemoryKb = 0;

  for (const result of results) {
    const statusId = result?.status?.id;
    const isAccepted = statusId === 3; // 3 => Accepted
    if (isAccepted) totalPassed += 1;
    const timeSec = parseFloat(result?.time ?? 0);
    const memKb = parseInt(result?.memory ?? 0, 10);
    if (!Number.isNaN(timeSec)) {
      const ms = Math.round(timeSec * 1000);
      if (ms > maxExecMs) maxExecMs = ms;
    }
    if (!Number.isNaN(memKb)) totalMemoryKb += memKb;
  }

  const status =
    totalPassed === testCases.length
      ? "accepted"
      : totalPassed > 0
      ? "wrong_answer"
      : mapJudgeStatus(results[0]?.status?.id);

  const submissionDoc = await Submission.create({
    user: req.user._id,
    problemId: problem._id,
    code,
    language: typeof language === "number" ? String(language) : String(language),
    status,
    executionTime: maxExecMs,
    memoryUsed: totalMemoryKb,
    testcasesPassed: totalPassed,
    totalTestcases: testCases.length,
  });

  // Update problem stats (best-effort): totals, success, averageTime, successRate
  try {
    const fresh = await Problem.findById(problem._id).select("stats");
    const prevTotal = fresh?.stats?.totalSubmissions || 0;
    const prevSuccess = fresh?.stats?.successfulSubmissions || 0;
    const prevAvgTime = fresh?.stats?.averageTime || 0;

    const newTotal = prevTotal + 1;
    const newSuccess = prevSuccess + (status === "accepted" ? 1 : 0);
    const newAvgTime = Math.round(
      ((prevAvgTime * prevTotal) + maxExecMs) / newTotal
    );
    const newSuccessRate = Math.round((newSuccess / newTotal) * 100);

    await Problem.findByIdAndUpdate(problem._id, {
      $set: {
        "stats.averageTime": newAvgTime,
        "stats.successRate": newSuccessRate,
      },
      $inc: {
        "stats.totalSubmissions": 1,
        ...(status === "accepted" ? { "stats.successfulSubmissions": 1 } : {}),
      },
    });
  } catch (_) {}

  return res
    .status(201)
    .json(new ApiResponse(201, { submission: submissionDoc, results }, "submission evaluated"));
});

function mapJudgeStatus(id) {
  switch (id) {
    case 4:
      return "wrong_answer";
    case 5:
      return "time_limit";
    case 6:
      return "compilation_error";
    case 7:
    case 8:
      return "runtime_error";
    default:
      return "wrong_answer";
  }
}

const getSubmissionById = AsyncHandler(async (req, res) => {
  const { id } = req.params;
  const submission = await Submission.findById(id).populate(
    "problemId",
    "title problemNumber"
  );
  if (!submission) throw new ApiError(404, "submission not found");
  if (String(submission.user) !== String(req.user._id) && req.user.position !== "admin") {
    throw new ApiError(403, "forbidden");
  }
  return res.status(200).json(new ApiResponse(200, { submission }));
});

const listUserSubmissions = AsyncHandler(async (req, res) => {
  const { problemId, page = 1, limit = 20 } = req.query;
  const query = { user: req.user._id };
  if (problemId) query.problemId = problemId;
  const submissions = await Submission.find(query)
    .sort({ submittedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));
  const total = await Submission.countDocuments(query);
  return res.status(200).json(new ApiResponse(200, { submissions, total }));
});

export { submitSolution, getSubmissionById, listUserSubmissions };


