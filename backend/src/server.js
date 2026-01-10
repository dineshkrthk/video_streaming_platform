import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import { socketHandler } from "./sockets/socket.js";
import authRoutes from "./routes/auth.routes.js";
import videoRoutes from "./routes/video.routes.js";
import { connectDB } from "./config/db.js";

dotenv.config();

//Ensure DB connects before server starts
await connectDB();

const app = express();

// ✅ CORS (safe for Vercel / Render)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);

app.get("/", (req, res) => {
  res.send("Video Platform Backend Running 🚀");
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);
socketHandler(io);

//PORT (Render injects this)
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
