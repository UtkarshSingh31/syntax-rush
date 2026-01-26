import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true,
      unique: true
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
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    blocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    refreshToken: {
      type: String
    },
    position: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
      index: true,
    },

    performanceStats: {
      contestPoints: {
        type: Number,
        default: 0,
      },
      contestsParticipated: {
        type: Number,
        default: 0,
      },
      contestsWon: {
        type: Number,
        default: 0,
      },
      battlePoints: {
        type: Number,
        default: 0,
      },
      battleParticipated: {
        type: Number,
        default: 0,
      },
      battleWon: {
        type: Number,
        default: 0,
      },
      battleLost: {
        type: Number,
        default: 0,
      },
      totalPoints: {
        type: Number,
        default: 0,
        index: -1,
      },
      currentLeague: {
        type: String,
        enum: ["unknown", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"],
        default: "unknown",
        index: true,
      },
      highestLeague: {
        type: String,
        enum: ["unknown", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"],
        default: "unknown",
        index: true,
      },
      HighestGlobalRank: {
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      HighestCountryRank: {
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      HighestCollegeRank: {
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      currentcountryRank: {
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      currentGlobalRank: {
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      currentCollegeRank: {
        type: Number,
        default: Infinity, // Set to infinity to indicate no rank yet
      },
      problemSolved: {
        type: Number,
        default: 0,
      },
      unusualActivity: [
        {
          type: String,
        }
      ],
      overAllWinRate: {
        type: Number,
        default: 0,
      },
      lastBattleAt: {
        type: Date,
        default: null,
      },
      lastContestAt: {
        type: Date,
        default: null,
      },
    },
    userFriendship: [{
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
      isInitiator: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    about: {
      type: String,
      default: "Passionate about algorithms and competitive coding. Always learning, always shipping."
    },
    skills: {
      type: [String],
      default: ["Arrays", "Strings", "Math"]
    }
  },
  {
    timestamps: true
  }
);

// userSchema.index({ college: 1, country: 1 });//accending 
// userSchema.index({ "performanceStats.totalPoints": -1 }); //decending
// userSchema.index({ "performanceStats.currentLeague": 1 });//accending
// userSchema.index({ isActive: 1 });//only for active users


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      fullname: this.fullname,
      username: this.username,
      email: this.email
    },
    process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES
    }
  )
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET || process.env.SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES
    }
  )
}


export const User = mongoose.model("User", userSchema); 