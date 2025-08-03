import express from 'express';
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import connectDB from './db/db.js';

dotenv.config();

const app=express();

app.use(express.json());
app.use(cookieParser())

app.listen(process.env.PORT,()=>{
  console.log("server is running",process.env.PORT)
  connectDB();
})
