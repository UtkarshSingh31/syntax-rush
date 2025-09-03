import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: String,
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  },
  admins: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
  }],
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member"
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: 25
  },
  stats: {
    totalBattles: {
      type: Number,
      default: 0
    },
    battlesWon: {
      type: Number,
      default: 0
    },
    battleslost: {
      type: Number,
      default: 0  
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    highestPoints:{
      type: Number,
      default: 0
    },
    HighestGlobalRank:{
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      HighestCountryRank:{
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      HighestCollegeRank:{
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      currentcountryRank:{
        type: Number, 
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      currentGlobalRank:{
        type: Number, 
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      currentCollegeRank:{
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      lastBattleAt:{
        type: Date,
        default: null,  
      },
    },
    
  },{ timestamps: true});
  
  
  groupSchema.index({ name: 1 }); // Search groups by name
  groupSchema.index({ "members.userId": 1 }); // User's groups
  groupSchema.index({ isPublic: 1, isActive: 1 }); // Public active groups
  groupSchema.index({ "stats.totalPoints": -1 }); // Group leaderboards

export const Group = mongoose.model("Group", groupSchema);