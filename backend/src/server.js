import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());


app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser tools (Postman, curl)
    if (!origin) return callback(null, true);

    // allow everything (dangerous in prod, fine for learning)
    callback(null, true);
  },
  credentials: true
}));

app.use("/root", (req, res) => {
   return res.json({ message: "Welcome to the Chat App API!" });
})
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* ✅ SERVE FRONTEND (ALWAYS) */
// app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// app.get("*", (_, res) => {
//   res.sendFile(
//     path.join(__dirname, "../../frontend/dist/index.html")
//   );
// });

const PORT = ENV.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
