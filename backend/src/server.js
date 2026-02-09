import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from "path";
import cors from "cors"
import {connectDB} from "./lib/db.js";
import { connect } from "http2";
import {ENV} from "./lib/env.js"
import cookieParser from "cookie-parser";
import {app, server} from "./lib/socket.js";
dotenv.config();

app.use(express.json({limit: "5mb"})); // req.body
app.use(cookieParser());
app.use(cors({origin:ENV.CLIENT_URL,credentials:true}));

const PORT = ENV.PORT || 3000;
const __dirname = path.resolve();



// app.use("/root",(req,res)=>{
//     console.log("Root route hit");
//     return res.json({message:"Welcome to the Chat App API!"}); 
// });
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if(ENV.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));
    app.get("*",(_,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist/index.html"));
    })
}

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})