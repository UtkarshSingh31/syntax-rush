import express from 'express'; 
import dotenv from "dotenv" 
import cookieParser from "cookie-parser"; 
import connectDB from './db/db.js'; 
import authRoutes from './routes/auth.routes.js'; 
import problemRoutes from './routes/problem.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import battleRoutes from './routes/battle.routes.js';
dotenv.config(); //

const app=express(); 

app.use(express.json()); 
app.use(cookieParser()) 


app.use("/api/v1/auth",authRoutes); 
app.use("/api/v1/problem",problemRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/battles", battleRoutes);

app.listen(process.env.PORT,()=>{ 
  console.log("server is running",process.env.PORT) 
  connectDB();
})
