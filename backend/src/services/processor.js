import fs from "fs";
import path from "path";
import axios from "axios";
import { exec } from "child_process";
import FormData from "form-data";
import Video from "../models/Video.js";


export const processVideo = async (videoId, io) => {
  console.log("🧠 AI PROCESS STARTED:", videoId);
  let videoPath, framesDir;

  try {
    const video = await Video.findById(videoId);
    if (!video) return;

    // Update status
    await Video.updateOne({ _id: videoId }, { status: "processing" });
    io.emit("progress", { videoId, status: "processing" });

    // --- TEMP PATHS (Render-safe) ---
    videoPath = `/tmp/video-${videoId}.mp4`;
    framesDir = `/tmp/frames-${videoId}`;

    await fs.promises.mkdir(framesDir, { recursive: true });

    // --- DOWNLOAD VIDEO FROM CLOUDINARY ---
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

    // --- EXTRACT FRAMES (1 FPS) ---
    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i "${videoPath}" -vf fps=1 ${framesDir}/frame_%03d.jpg`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    // --- AI ANALYSIS ---
    const frames = fs.readdirSync(framesDir);
    let maxScore = 0;

    for (const frame of frames) {
      const framePath = path.join(framesDir, frame);

      console.log("📤 Sending frame to AI:", frame);

      const form = new FormData();
      form.append("image", fs.createReadStream(framePath));

      const res = await axios.post(
        process.env.AI_SERVICE_URL + "/analyze",
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          timeout: 60000
        }
      );

      maxScore = Math.max(maxScore, res.data.score);
      console.log("📊 AI SCORE:", res.data.score);

    }

    const status = maxScore > 0.6 ? "flagged" : "safe";

    await Video.updateOne(
      { _id: videoId },
      { status, sensitivityScore: maxScore }
    );

    io.emit("progress", { videoId, status });
  } catch (err) {
    console.error("Video processing failed:", err);

    await Video.updateOne(
      { _id: videoId },
      { status: "flagged", sensitivityScore: 1 }
    );

    io.emit("progress", { videoId, status: "flagged" });
  } finally {
    // --- CLEANUP ---
    if (videoPath && fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    if (framesDir && fs.existsSync(framesDir)) {
      fs.rmSync(framesDir, { recursive: true, force: true });
    }
  }
};
