import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/globalChat.controller.js";

const router = express.Router();

router.route("/global").get(verifyJWT, getMessages);
router.route("/global").post(verifyJWT, sendMessage);

export default router;