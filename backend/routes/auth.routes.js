import express from "express";
import { Register, login, refreshAccessToken, Logout, sendEmailVerificationOTP, verifyEmailOTP, userProfile, createAdmin, adminProfile, forgotPasswordOTP, resetPassword, updateProfile, getLeaderboard } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import rateLimiter from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.route("/send-otp").post(rateLimiter.otpRequestLimit, sendEmailVerificationOTP);
router.route("/verify-otp").post(rateLimiter.otpVerifyLimit, verifyEmailOTP);
router.route("/forgot-password").post(forgotPasswordOTP);
router.route("/reset-password").post(resetPassword);
router.route("/register").post(Register);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT, Logout);
router.route("/profile").get(verifyJWT, userProfile);
router.route("/update-profile").patch(verifyJWT, upload.single("profilePicture"), updateProfile);
router.route("/leaderboard").get(getLeaderboard);
router.route("/create-admin").post(createAdmin);
router.route("/admin-profile").get(verifyJWT, adminProfile);

export default router;
