import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  ownerId: mongoose.Schema.Types.ObjectId,
  tenantId: String,
  status: {
    type: String,
    enum: ["uploaded", "processing", "safe", "flagged"],
    default: "uploaded"
  },

  sensitivityScore: Number,
  videoUrl: String,      // streaming URL
  cloudinaryId: String, 

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Video", videoSchema);
