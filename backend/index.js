import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from './db/db.js';
import authRoutes from './routes/auth.routes.js';
import problemRoutes from './routes/problem.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import battleRoutes from './routes/battle.routes.js';
import chatRoutes from './routes/chat.routes.js';
import contestRoutes from './routes/contest.routes.js';
import groupRoutes from './routes/group.routes.js';
import messageRoutes from './routes/message.routes.js';
import socialRoutes from './routes/social.routes.js';

import { createServer } from "http";
import socketManager from "./socket/socket.js";

const app = express();
const server = createServer(app);
const io = socketManager(server);

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problem", problemRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/battles", battleRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/contest", contestRoutes);
app.use("/api/v1/group", groupRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/social", socialRoutes);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("server is running on port", PORT);
  connectDB();
})
