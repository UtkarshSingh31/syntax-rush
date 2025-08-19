import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    college: String,
    country: String,
    verified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isActive:{
      type: Boolean,
      default: true,
      index: true,
    },
    blocked:{
      type: Boolean,
      default: false,
      index: true,
    },

    performanceStats: {
      contestPoints:{
        type:Number,
        default: 0,
      },
      contestsParticipated:{
        type:Number,
        default: 0,
      },
      contestsWon:{
        type:Number,
        default: 0,
      },
      battlePoints:{
        type:Number,
        default: 0,
      },
      battleParticipated:{
        type:Number,
        default: 0,
      },
      battleWon:{
        type:Number,
        default: 0,
      },
      battleLost:{
        type:Number,
        default: 0,
      },
      totalPoints:{
        type:Number,
        default: 0,
        index: -1,
      },
      currentLeague:{
        type: String,
        enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"],
        default: "Bronze",
        index: true,
      },
      highestLeague:{
        type: String,
        enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"],
        default: "Bronze",
        index: true,
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
      problemSolved:{
        type: Number, 
        default: 0,
      },
      unusualActivity:[
        {
          type: String, 
        }
      ],
      overAllWinRate:{
        type: Number,
        default: 0,
      },
      lastBattleAt:{
        type: Date,
        default: null,  
      },
      lastContestAt:{
        type: Date,
        default: null,  
      },
    },
    userFriendship:[{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
      },
      createdAt: {
        type: Date,
        default: Date.now
      } 
    }]
},
  {
    timestamps: true
  }
);

userSchema.index({ college: 1, country: 1 });//accending 
userSchema.index({ "performanceStats.totalPoints": -1 }); //decending
userSchema.index({ "performanceStats.currentLeague": 1 });//accending
userSchema.index({ isActive: 1 });//only for active users

export const User=  mongoose.model("User", userSchema);  