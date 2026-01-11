import fs from "fs";
import path from "path";
import axios from "axios";
import { exec } from "child_process";
import FormData from "form-data";
import Video from "../models/Video.js";

export const processVideo = async (videoId, io) => {
  console.log("🧠 AI PROCESS STARTED:", videoId);

  let videoPath;
  let framesDir;

  try {
    // 1️⃣ Fetch video record
    const video = await Video.findById(videoId);
    if (!video) return;

    // 2️⃣ Update status → processing
    await Video.updateOne(
      { _id: videoId },
      { status: "processing" }
    );
    io.emit("progress", { videoId, status: "processing" });

    // 3️⃣ Temp paths (Render-safe)
    videoPath = `/tmp/video-${videoId}.mp4`;
    framesDir = `/tmp/frames-${videoId}`;

    await fs.promises.mkdir(framesDir, { recursive: true });

    // 4️⃣ Download video from Cloudinary
    const response = await axios({
      method: "GET",
      url: video.videoUrl,
      responseType: "stream"
    });

    const writer = fs.createWriteStream(videoPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // 5️⃣ Extract frames (1 frame per second)
    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i "${videoPath}" -vf fps=1 ${framesDir}/frame_%03d.jpg`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    // 6️⃣ AI analysis
    const frames = fs
      .readdirSync(framesDir)
      .filter(f => f.endsWith(".jpg"));

    let maxScore = 0;

    for (const frame of frames) {
      const framePath = path.join(framesDir, frame);

      console.log("📤 Sending frame to AI:", frame);

      const form = new FormData();
      form.append("image", fs.createReadStream(framePath));

      const res = await axios.post(
        `${process.env.AI_SERVICE_URL}/analyze`,
        form,
        {
          headers: form.getHeaders(),
          timeout: 60000, // important for Render cold starts
          maxBodyLength: Infinity,
          maxContentLength: Infinity
        }
      );

      console.log("📊 AI SCORE:", res.data.score);
      maxScore = Math.max(maxScore, res.data.score);
    }

    // 7️⃣ Final status
    const finalStatus = maxScore > 0.6 ? "flagged" : "safe";

    await Video.updateOne(
      { _id: videoId },
      {
        status: finalStatus,
        sensitivityScore: maxScore
      }
    );

    io.emit("progress", { videoId, status: finalStatus });
  } catch (err) {
    console.error("❌ Video processing failed:", err);

    // Fail safe: block video if AI fails
    await Video.updateOne(
      { _id: videoId },
      { status: "flagged", sensitivityScore: 1 }
    );

    io.emit("progress", { videoId, status: "flagged" });
  } finally {
    // 8️⃣ Cleanup temp files
    try {
      if (videoPath && fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
      if (framesDir && fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.error("⚠️ Cleanup failed:", cleanupErr);
    }
  }
};
