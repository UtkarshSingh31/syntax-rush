import {User} from "../models/user.model.js";
import {AsyncHandler} from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {otp} from "../models/otp.model.js";
import EmailService from "../utils/EmailService.js";

const generateAccessandRefreshTokens = async(userId)=>{
  try{
    const user = await User.findById(userId);
    const accessToken=user.generateAccessToken();
    console.log(accessToken)
    const refreshToken=user.generateRefreshToken();
    console.log(refreshToken)

    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false})

    return {refreshToken,accessToken}
  }catch(error){
    console.log(error)
    throw new ApiError(500,"Something went wrong while generating refresh and access token")
  }
}

const refreshAccessToken = AsyncHandler(async(req,res)=>{
  const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    if(!user){
      throw new ApiError(401,"invalid refresh token");
    }
  
    if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401,"refresh token is either expired or invalid")
    }
    const options = {
      httpOnly:true,
      secure:true
    }
    const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id);
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken,refreshToken},
        "access token refreshed successfully"
      )
    )
  } catch (error) {
    throw new ApiError(401,"invalid refresh token")
  }
})

const sendEmailVerificationOTP = AsyncHandler(async(req,res)=>{
  const {email} = req.body;

  if(!email){
    throw new ApiError(400,"Email is required");
  }

  const existingUser = await User.findOne({email});
  if(existingUser){
    throw new ApiError(400,"User with this email already exists");
  }

  const existingOTP = await otp.findOne({email, purpose: 'signup'});
  if(existingOTP && !existingOTP.isVerified){
    throw new ApiError(400,"OTP already sent. Please wait before requesting another");
  }

  const otpCode = EmailService.generateOTP();
  const otpHash = EmailService.hashOTP(otpCode);

  await otp.deleteMany({email, purpose: 'signup'});

  const newOTP = await otp.create({
    email,
    otpHash,
    purpose: 'signup',
    isVerified: false
  });

  if(!newOTP){
    throw new ApiError(500,"Failed to create OTP record");
  }

  const emailResult = await EmailService.sendOTPEmail(email, otpCode);
  if(!emailResult.success){
    await otp.findByIdAndDelete(newOTP._id);
    throw new ApiError(500,"Failed to send verification email");
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,{
      message: "OTP sent successfully",
      email: email
    },"Verification OTP sent to your email")
  );
});

const verifyEmailOTP = AsyncHandler(async(req,res)=>{
  const {email, otp: otpCode} = req.body;

  if(!email || !otpCode){
    throw new ApiError(400,"Email and OTP are required");
  }

  const otpRecord = await otp.findOne({email, purpose: 'signup'});
  if(!otpRecord){
    throw new ApiError(400,"Invalid or expired OTP");
  }

  if(otpRecord.isVerified){
    throw new ApiError(400,"OTP already verified");
  }

  if(otpRecord.attempts >= 3){
    await otp.findByIdAndDelete(otpRecord._id);
    throw new ApiError(400,"Maximum attempts exceeded. Please request a new OTP");
  }

  const providedOTPHash = EmailService.hashOTP(otpCode);
  if(providedOTPHash !== otpRecord.otpHash){
    await otp.findByIdAndUpdate(otpRecord._id, {
      $inc: { attempts: 1 }
    });
    throw new ApiError(400,"Invalid OTP");
  }

  await otp.findByIdAndUpdate(otpRecord._id, {
    isVerified: true
  });

  return res
  .status(200)
  .json(
    new ApiResponse(200,{
      message: "Email verified successfully",
      email: email
    },"Email verification completed")
  );
});

const Register = AsyncHandler(async(req,res)=>{
  const {fullname,email,password,username}=req.body
 
  if(!fullname){
    throw new ApiError(400,"fullname is required")
  }
  if(!email){
    throw new ApiError(400,"email is required")
  } 
  if(!username){
    throw new ApiError(400,"username is required")
  } 
  if(!password){
    throw new ApiError(400,"password is required")  
  }

  if(password.length<8){
    throw new ApiError(400,"password must be at least 8 characters")
  }

  const existingUser = await User.findOne({email})
  if(existingUser){
    throw new ApiError(400,"user with this email already exist")
  }

  const usernameExists = await User.findOne({username})
  if(usernameExists){
    throw new ApiError(400,"user with this username already exists")
  }

  const emailVerification = await otp.findOne({ 
    email, 
    purpose: 'signup',
    isVerified: true 
  });
  if (!emailVerification) {
    throw new ApiError(400,"Please verify your email first");
  }

  const newUser = await User.create({
    fullname,
    email,
    password,
    username,
    isEmailVerified: true,
  })

  if(!newUser){
    throw new ApiError(400,"error while creating a new user")
  }

  await otp.findOneAndDelete({ email, purpose: 'signup' });

  const {accessToken,refreshToken} = await generateAccessandRefreshTokens(newUser._id);
  
  const options = {
    httpOnly:true,
    secure:true
  };

  return res
  .status(201)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(201,{
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        username: newUser.username,
        isEmailVerified: newUser.isEmailVerified
      },
      accessToken,
      refreshToken
    },"new user signedUp successfully")
  )
});
const login = AsyncHandler(async(req,res)=>{
  const {email,password}=req.body
  if(!email || !password){
    throw new ApiError(400,"email and password are required")
  }
  const user = await User.findOne({email}).select("+password +refreshToken")
  if(!user){
    throw new ApiError(400,"invalid email or password")
  }
  const isPasswordMatched = await user.isPasswordCorrect(password)
  if(!isPasswordMatched){
    throw new ApiError(400,"invalid email or password")
  }
  const {accessToken,refreshToken} = await generateAccessandRefreshTokens(user._id);
  const options = {
    httpOnly:true,
    secure:true
  };
  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,{
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      },
      accessToken,
      refreshToken
    },"user logged in successfully")
  )
})

const Logout = AsyncHandler(async(req,res)=>{
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
    httpOnly:true,
    secure:true
  };
  
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(
    new ApiResponse(200,{},"User logged out successfully")
  );
});

export {refreshAccessToken,login,Register,Logout,sendEmailVerificationOTP,verifyEmailOTP};