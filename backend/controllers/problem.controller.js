import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Problem } from "../models/problem.model.js";
import { User } from "../models/user.model.js";

const createProblem = AsyncHandler(async (req, res) => {
  const { title, description, difficulty, tags, testcases, inputFormat, outputFormat } = req.body;


  const user = await User.findById(req.user._id);
  if (!user || user.position !== "admin") {
    throw new ApiError(403, "Only admin can create problems");
  }

  // Required field validation
 if (!title) {
  throw new ApiError(400, "Title is required");
}
if (!description) {
  throw new ApiError(400, "Description is required");
}
if (!difficulty) {
  throw new ApiError(400, "Difficulty is required");
}
if (!tags) {
  throw new ApiError(400, "Tags are required");
}
if (!testcases) {
  throw new ApiError(400, "Testcases are required");
}
if (!inputFormat) {
  throw new ApiError(400, "Input format is required");
}
if (!outputFormat) {
  throw new ApiError(400, "Output format is required");
}

  if (!Array.isArray(tags) || tags.length === 0) {
    throw new ApiError(400, "At least one tag is required");
  }

  if (!Array.isArray(testcases) || testcases.length === 0) {
    throw new ApiError(400, "At least one testcase is required");
  }

  const formattedTags = tags.map(tag =>
    typeof tag === "string" ? { name: tag, category: "other" } : tag
  );


  const totalProblem = await Problem.countDocuments();
  const newProblem = await Problem.create({
    title,
    problemNumber: totalProblem + 1,
    description,
    inputFormat,
    outputFormat,
    difficulty,
    tags: formattedTags,
    testCases: testcases,
    createdBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, { problem: newProblem }, "Problem created successfully")
  );
});

const getAllProblems = AsyncHandler(async (req, res) => {
  const { difficulty, tags, search, page = 1, limit = 10 } = req.query;
  const query = {};
  if (difficulty) {
    query.difficulty = difficulty;
  }
  if (tags) {
    query.tags = { $in: tags.split(",") };
  }
  if (search) {
    query.$text = { $search: search };
  }
  const problems = await Problem.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit)) 
    .sort({ createdAt: -1 });
  const totalProblems = await Problem.countDocuments(query);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          problems,
          totalProblems,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProblems / limit),
        },
        "Problems fetched successfully"
      )
    );
}
);

const getAdminProblems = AsyncHandler(async(req,res)=>{
  const { page = 1, limit = 10, difficulty, tags } = req.query;
  
  const query = { createdBy: req.user._id };
  if(difficulty) query.difficulty = difficulty;
  if(tags) query.tags = { $in: tags.split(",") };

  const problems = await Problem.find(query)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const totalProblems = await Problem.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      problems,
      totalProblems,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalProblems / limit)
    }, "admin problems fetched successfully")
  )
})

export { createProblem, getAllProblems ,getAdminProblems};