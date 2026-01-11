import express from "express";
console.log("Video routes loaded");
import { processVideo } from "../services/processor.js";
import { upload } from "../config/multer.js";
import { auth } from "../middleware/auth.js";
import Video from "../models/Video.js";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

const router = express.Router();

// Delete video 
router.delete("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }
    //Tenant isolation
    if (video.tenantId !== req.user.tenantId) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    //RBAC
    if (!["admin", "editor"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Not allowed" });
    }
    //Delete video file
    if (video.path && fs.existsSync(video.path)) {
      fs.unlinkSync(video.path);
    }
    //Delete frames directory (if created)
    const framesDir = path.join(
      "frames",
      video._id.toString()
    );
    if (fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true, force: true });
    }
    //Remove DB record
    await video.deleteOne();

    res.json({ msg: "Video deleted successfully" });
  } catch (err) {
    console.error("Delete video error:", err);
    res.status(500).json({ msg: "Delete failed" });
  }
});

router.get("/play/:id", auth, async (req,res)=>{
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({ msg: "Video not found" });
  }

  //Tenant isolation
  if (video.tenantId !== req.user.tenantId) {
    return res.status(403).json({ msg: "Forbidden" });
  }

  if(video.status === "flagged" && req.user.role !== "admin"){
    return res.status(403).json({ msg: "Blocked" });
  }

  const token = req.headers.authorization.split(" ")[1];

  res.json({
    url: `${process.env.BASE_URL}/api/videos/stream/${video._id}?token=${token}`
  });
});

router.get("/stream/:id", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1] || req.query.token;

  if (!token) {
    return res.status(401).json({ msg: "No token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ msg: "Invalid token" });
  }

  req.user = decoded;

  const video = await Video.findById(req.params.id);

  // Tenant isolation
  if (video.tenantId !== req.user.tenantId) {
    return res.status(403).json({ msg: "Forbidden" });
  }

  // Block flagged videos for non-admins
  if (video.status === "flagged" && req.user.role !== "admin") {
    return res.status(403).json({ msg: "Video under review" });
  }

  const videoPath = path.resolve(video.path);
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (!range) {
    return res.status(416).send("Range header required");
  }

  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  const chunkSize = end - start + 1;

  const file = fs.createReadStream(videoPath, { start, end });

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4"
  };

  res.writeHead(206, headers);
  file.pipe(res);
});

// Upload video
router.post("/upload", auth, upload.single("video"), async (req, res) => {
  const video = await Video.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    ownerId: req.user.id,
    tenantId: req.user.tenantId,
    path: req.file.path,
    status: "uploaded"
  });

  const io = req.app.get("io");
  processVideo(video._id, io);
  res.json(video);
});

// List videos (tenant isolated)
router.get("/", auth, async (req, res) => {
  const videos = await Video.find({ tenantId: req.user.tenantId });
  res.json(videos);
});

export default router;
