import express from "express";
console.log("Video routes loaded");
import { processVideo } from "../services/processor.js";
import { upload } from "../config/multer.js";
import { auth } from "../middleware/auth.js";
import Video from "../models/Video.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// Delete video 
router.delete("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ msg: "Video not found" });
    }

    // 🔐 Tenant isolation
    if (video.tenantId !== req.user.tenantId) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    // 🔑 RBAC: Admin + Editor only
    if (!["admin", "editor"].includes(req.user.role)) {
      return res.status(403).json({ msg: "Not allowed" });
    }

    // ☁️ Delete from Cloudinary
    if (video.cloudinaryId) {
      await cloudinary.uploader.destroy(video.cloudinaryId, {
        resource_type: "video"
      });
    }

    // 🗑 Delete DB record
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

  res.json({ url: video.videoUrl });
});

// Upload video
router.post("/upload", auth, upload.single("video"), async (req, res) => {
  console.log("REQ FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

   // ✅ RBAC: editor & admin can upload
  if (!["editor", "admin"].includes(req.user.role)) {
    return res.status(403).json({ msg: "Not allowed to upload" });
  }

  const video = await Video.create({
    originalName: req.file.originalname,
    ownerId: req.user.id,
    tenantId: req.user.tenantId,
    videoUrl: req.file.path,
    cloudinaryId: req.file.public_id,
    status: "safe" // for demo
  });

  //disabled for demo stability
  // const io = req.app.get("io");
  // setImmediate(() => {
  //   processVideo(video._id, io);
  // });
  
  res.json(video);
});


// List videos (tenant isolated)
router.get("/", auth, async (req, res) => {
  const videos = await Video.find({ tenantId: req.user.tenantId });
  res.json(videos);
});

export default router;
