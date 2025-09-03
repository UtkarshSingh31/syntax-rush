import mongoose from "mongoose";

const individualBattleSchema = new mongoose.Schema({
  battletype: { 
    type: String, 
    enum: ["1v1_classic", "1v1_quick", "1v1_friendly"],
    required: true 
  },
  player1: { 
    userId: { type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
  },
    problemId: { type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true 
  },
    submissionId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission" 
  },
    score: { 
      type: Number,
      default: 0 
  },
    solvedAt: Date,
      status: {
      type: String,
      enum: ["participating", "solved", "failed"],
      default: "participating" 
  }
  },
  player2: {
    userId: { type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true 
  },
    problemId: { type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true 
  },
    submissionId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission" 
  },
    score: { 
      type: Number,
      default: 0 
  },
    solvedAt: Date,
    status: {
      type: String,
      enum: ["participating", "solved", "failed"],
      default: "participating" 
  }
},
  problemIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true 
}],
  startTime: { 
    type: Date,
    required: true 
  },
  endTime: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String,
    enum: ["waiting", "active", "completed"], 
    default: "waiting" 
  },
  affectsLeaderboard: { 
    type: Boolean, 
    default: true 
  },
  winner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  roomCode: String
}, { 
  timestamps: true
});

export const IndividualBattle = mongoose.model("IndividualBattle", individualBattleSchema);