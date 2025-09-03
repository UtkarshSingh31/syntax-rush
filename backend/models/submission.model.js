import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  problemId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  code:{
    type: String,
    required: true,
  },
  language:{
    type: String,
    required: true,
  },
  status:{
    type: String,
    enum: ["accepted", "wrong_answer", "time_limit", "runtime_error", "compilation_error"],
  },
  executionTime: Number,
  memoryUsed: Number,
  submittedAt:{
    type: Date,
    Default: Date.now
  },
  testcasesPassed: Number,
  totalTestcases: Number
});


export const Submission = mongoose.model("Submission", submissionSchema);