import { User } from "../models/user.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"


export const verifyJWT = AsyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      console.log("No token found in cookies or headers:", {
        cookies: req.cookies ? Object.keys(req.cookies) : "none",
        authHeader: !!req.header("Authorization")
      });
      throw new ApiError(401, "unauthorized req")
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || process.env.SECRET_KEY)

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
      throw new ApiError(401, "invalid Access token")
    }

    req.user = user
    next()
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid access token")
  }
})