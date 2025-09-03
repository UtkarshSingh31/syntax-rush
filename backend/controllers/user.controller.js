import User from "../models/user.model.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";



const Signin =  AsyncHandler(async(req,res)=>{
  const {email,password}=req.body;
})

export {Signin};