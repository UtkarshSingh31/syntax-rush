import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { create1v1, getBattle, submitToBattle } from "../controllers/battle.controller.js";

const router = express.Router();

router.post("/create", verifyJWT, create1v1);
router.get("/:id", verifyJWT, getBattle);
router.post("/:id/submit", verifyJWT, submitToBattle);

export default router;


