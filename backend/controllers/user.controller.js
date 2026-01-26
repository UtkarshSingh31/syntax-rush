import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { otp } from "../models/otp.model.js";
import EmailService from "../utils/EmailService.js";
import { Problem } from "../models/problem.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessandRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    console.log(accessToken)
    const refreshToken = user.generateRefreshToken();
    console.log(refreshToken)

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })

    return { refreshToken, accessToken }
  } catch (error) {
    console.log(error)
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}


const refreshAccessToken = AsyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is either expired or invalid")
    }
    const options = {
      httpOnly: true,
      secure: true
    }
    const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "access token refreshed successfully"
        )
      )
  } catch (error) {
    throw new ApiError(401, "invalid refresh token")
  }
})

const sendEmailVerificationOTP = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  const existingOTP = await otp.findOne({ email, purpose: 'signup' });
  if (existingOTP && !existingOTP.isVerified) {
    throw new ApiError(400, "OTP already sent. Please wait before requesting another");
  }

  const otpCode = EmailService.generateOTP();
  const otpHash = EmailService.hashOTP(otpCode);

  await otp.deleteMany({ email, purpose: 'signup' });

  const newOTP = await otp.create({
    email,
    otpHash,
    purpose: 'signup',
    isVerified: false
  });

  if (!newOTP) {
    throw new ApiError(500, "Failed to create OTP record");
  }

  const emailResult = await EmailService.sendOTPEmail(email, otpCode);
  if (!emailResult.success) {
    await otp.findByIdAndDelete(newOTP._id);
    throw new ApiError(500, "Failed to send verification email");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        message: "OTP sent successfully",
        email: email
      }, "Verification OTP sent to your email")
    );
});

const verifyEmailOTP = AsyncHandler(async (req, res) => {
  const { email, otp: otpCode } = req.body;

  if (!email || !otpCode) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const otpRecord = await otp.findOne({ email, purpose: 'signup' });
  if (!otpRecord) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (otpRecord.isVerified) {
    throw new ApiError(400, "OTP already verified");
  }

  if (otpRecord.attempts >= 3) {
    await otp.findByIdAndDelete(otpRecord._id);
    throw new ApiError(400, "Maximum attempts exceeded. Please request a new OTP");
  }

  const providedOTPHash = EmailService.hashOTP(otpCode);
  if (providedOTPHash !== otpRecord.otpHash) {
    await otp.findByIdAndUpdate(otpRecord._id, {
      $inc: { attempts: 1 }
    });
    throw new ApiError(400, "Invalid OTP");
  }

  await otp.findByIdAndUpdate(otpRecord._id, {
    isVerified: true
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {
        message: "Email verified successfully",
        email: email
      }, "Email verification completed")
    );
});

const Register = AsyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body

  if (!fullname) {
    throw new ApiError(400, "fullname is required")
  }
  if (!email) {
    throw new ApiError(400, "email is required")
  }
  if (!username) {
    throw new ApiError(400, "username is required")
  }
  if (!password) {
    throw new ApiError(400, "password is required")
  }

  if (password.length < 8) {
    throw new ApiError(400, "password must be at least 8 characters")
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "user with this email already exist");
  }
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new ApiError(400, "user with this username already exists");
  }

  const emailVerification = await otp.findOne({
    email,
    purpose: 'signup',
    isVerified: true
  });
  if (!emailVerification) {
    throw new ApiError(400, "Please verify your email first");
  }

  const newUser = await User.create({
    fullname,
    email,
    password,
    username,
    isEmailVerified: true,
  })

  if (!newUser) {
    throw new ApiError(400, "error while creating a new user")
  }

  await otp.findOneAndDelete({ email, purpose: 'signup' });

  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(newUser._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(201, {
        user: {
          _id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          username: newUser.username,
          isEmailVerified: newUser.isEmailVerified
        },
        accessToken,
        refreshToken
      }, "new user signedUp successfully")
    )
});
const login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new ApiError(400, "email and password are required")
  }
  const user = await User.findOne({ email }).select("+password +refreshToken")
  if (!user) {
    throw new ApiError(400, "invalid email or password")
  }
  const isPasswordMatched = await user.isPasswordCorrect(password)
  if (!isPasswordMatched) {
    throw new ApiError(400, "invalid email or password")
  }
  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(user._id);
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  };
  if (user.position === "admin") {
    if (!user.isEmailVerified) {
      throw new ApiError(403, "please verify your email first")
    }
    if (user.blocked) {
      throw new ApiError(403, "your account has been blocked. please contact support")
    }
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, {
          user: {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            username: user.username,
            position: user.position,
            isEmailVerified: user.isEmailVerified
          },
          accessToken,
          refreshToken
        }, "admin logged in successfully")
      )
  }



  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, {
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          username: user.username,
          isEmailVerified: user.isEmailVerified
        },
        accessToken,
        refreshToken
      }, "user logged in successfully")
    )
})

const Logout = AsyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  };


  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, "User logged out successfully")
    );
});
const createAdmin = AsyncHandler(async (req, res) => {
  const { fullname, email, password, username, position } = req.body

  if (!fullname) {
    throw new ApiError(400, "fullname is required")
  }
  if (!email) {
    throw new ApiError(400, "email is required")
  }

  if (!username) {
    throw new ApiError(400, "username is required")
  }
  if (!password) {
    throw new ApiError(400, "password is required")
  }
  if (!position || !["admin"].includes(position)) {
    throw new ApiError(400, "valid position is required")
  }
  if (password.length < 8) {
    throw new ApiError(400, "password must be at least 8 characters")
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "user with this email already exist");
  }
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    throw new ApiError(400, "user with this username already exists");
  }
  const newUser = await User.create({
    fullname,
    email,
    password,
    username,
    position,
    isEmailVerified: true,
  })
  if (!newUser) {
    throw new ApiError(400, "error while creating a new user")
  }
  const { accessToken, refreshToken } = await generateAccessandRefreshTokens(newUser._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(201, {
        user: {
          _id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          username: newUser.username,
          position: newUser.position,
          isEmailVerified: newUser.isEmailVerified
        }
      }, "new admin signedUp successfully")
    )
})



const getUserWithCalculatedRank = async (userId) => {
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) return null;

  const rank = await User.countDocuments({
    $or: [
      { "performanceStats.totalPoints": { $gt: user.performanceStats.totalPoints } },
      {
        "performanceStats.totalPoints": user.performanceStats.totalPoints,
        "createdAt": { $lt: user.createdAt }
      }
    ]
  }) + 1;

  const userWithRank = user.toObject();
  userWithRank.performanceStats.currentGlobalRank = rank;
  return userWithRank;
};

const userProfile = AsyncHandler(async (req, res) => {
  const userWithRank = await getUserWithCalculatedRank(req.user._id);
  if (!userWithRank) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, { user: userWithRank }, "User profile fetched"));
});

const adminProfile = AsyncHandler(async (req, res) => {
  const userDoc = await User.findById(req.user._id).select("-password -refreshToken");
  if (!userDoc) {
    throw new ApiError(404, "user not found");
  }
  if (userDoc.position !== "admin") {
    throw new ApiError(403, "only admin can access this resource");
  }
  const problemsCreated = await Problem.countDocuments({ createdBy: userDoc._id });
  const user = userDoc.toObject();
  user.problemsCreated = problemsCreated;
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user }, "admin profile fetched successfully")
    );
})
const forgotPasswordOTP = AsyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otpCode = EmailService.generateOTP();
  const otpHash = EmailService.hashOTP(otpCode);

  await otp.deleteMany({ email, purpose: 'password_reset' });
  await otp.create({
    email,
    otpHash,
    purpose: 'password_reset'
  });

  await EmailService.sendOTPEmail(email, otpCode);

  return res.status(200).json(new ApiResponse(200, { email }, "Reset OTP sent"));
});

const resetPassword = AsyncHandler(async (req, res) => {
  const { email, otp: otpCode, newPassword } = req.body;
  if (!email || !otpCode || !newPassword) throw new ApiError(400, "All fields required");

  const otpRecord = await otp.findOne({ email, purpose: 'password_reset' });
  if (!otpRecord || otpRecord.isVerified) throw new ApiError(400, "Invalid or expired OTP");

  const providedHash = EmailService.hashOTP(otpCode);
  if (providedHash !== otpRecord.otpHash) throw new ApiError(400, "Invalid OTP");

  const user = await User.findOne({ email });
  user.password = newPassword;
  await user.save();

  await otp.findByIdAndDelete(otpRecord._id);

  return res.status(200).json(new ApiResponse(200, {}, "Password reset successful"));
});

const updateProfile = AsyncHandler(async (req, res) => {
  const { fullname, college, country, about, skills } = req.body || {};

  // Create an update object, only including fields if they are provided
  const updateFields = {};
  if (fullname !== undefined) updateFields.fullname = fullname;
  if (college !== undefined) updateFields.college = college;
  if (country !== undefined) updateFields.country = country;
  if (about !== undefined) updateFields.about = about;
  if (skills !== undefined) updateFields.skills = skills;

  // Handle Profile Picture Upload
  console.log("Request File:", req.file);
  console.log("Request Body:", req.body);

  if (req.file) {
    const avatar = await uploadOnCloudinary(req.file.path);
    if (avatar) {
      updateFields.profilePicture = avatar.url;
    }
  } else if (req.body && req.body.profilePicture !== undefined) {
    updateFields.profilePicture = req.body.profilePicture;
  }

  console.log("Update Fields:", updateFields);

  await User.findByIdAndUpdate(
    req.user._id,
    { $set: updateFields },
    { new: true }
  );

  const userWithRank = await getUserWithCalculatedRank(req.user._id);

  return res.status(200).json(new ApiResponse(200, { user: userWithRank }, "Profile updated"));
});

const getLeaderboard = AsyncHandler(async (req, res) => {
  const users = await User.find()
    .sort({ "performanceStats.totalPoints": -1, "createdAt": 1 })
    .limit(50)
    .select("username fullname profilePicture performanceStats");

  return res.status(200).json(new ApiResponse(200, { users }, "Leaderboard fetched"));
});

export {
  refreshAccessToken,
  login,
  Register,
  Logout,
  sendEmailVerificationOTP,
  verifyEmailOTP,
  userProfile,
  createAdmin,
  adminProfile,
  forgotPasswordOTP,
  resetPassword,
  updateProfile,
  getLeaderboard
};