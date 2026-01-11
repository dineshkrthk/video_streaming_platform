import fs from "fs";
import path from "path";
import axios from "axios";
import { exec } from "child_process";
import FormData from "form-data";
import sharp from "sharp";
import Video from "../models/Video.js";

/**
 * Uniformly sample N items across an array
 */
function uniformSample(arr, count) {
  if (arr.length <= count) return arr;

  const step = arr.length / count;
  const sampled = [];

  for (let i = 0; i < count; i++) {
    sampled.push(arr[Math.floor(i * step)]);
  }
  return sampled;
}

export const processVideo = async (videoId, io) => {
  console.log("🧠 AI PROCESS STARTED:", videoId);

  let videoPath;
  let framesDir;

  const THRESHOLD = 0.6;
  const BORDERLINE = 0.3;

  try {
    // 1️⃣ Fetch video
    const video = await Video.findById(videoId);
    if (!video) return;

    // 2️⃣ Mark processing
    await Video.updateOne({ _id: videoId }, { status: "processing" });
    io.emit("progress", { videoId, status: "processing" });

    // 3️⃣ Temp paths (Render-safe)
    videoPath = `/tmp/video-${videoId}.mp4`;
    framesDir = `/tmp/frames-${videoId}`;
    await fs.promises.mkdir(framesDir, { recursive: true });

    // 4️⃣ Download video
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

    // 5️⃣ Extract frames (1 FPS)
    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i "${videoPath}" -vf fps=1 ${framesDir}/frame_%03d.jpg`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    // 6️⃣ Collect frames
    const allFrames = fs
      .readdirSync(framesDir)
      .filter(f => f.endsWith(".jpg"));

    let maxScore = 0;

    // 7️⃣ Decide sampling strategy
    let tier1Frames = [];
    if (allFrames.length <= 30) {
      tier1Frames = allFrames; // small video
    } else {
      tier1Frames = uniformSample(allFrames, 10); // large video
    }

    // ---------- TIER 1 SCAN ----------
    for (const frame of tier1Frames) {
      const framePath = path.join(framesDir, frame);
      const resizedPath = `${framePath}-small.jpg`;

      try {
        await sharp(framePath)
          .resize(224, 224)
          .jpeg({ quality: 80 })
          .toFile(resizedPath);

        const form = new FormData();
        form.append("image", fs.createReadStream(resizedPath));

        const res = await axios.post(
          `${process.env.AI_SERVICE_URL}/analyze`,
          form,
          { headers: form.getHeaders(), timeout: 60000 }
        );

        const score = res.data.score;
        console.log("📊 AI SCORE:", score);

        maxScore = Math.max(maxScore, score);

        // Early exit if NSFW
        if (score >= THRESHOLD) break;
      } catch (err) {
        console.error("❌ AI failure (tier1):", err.message);
        maxScore = 1; // fail-closed
        break;
      }
    }

    // ---------- TIER 2 ESCALATION ----------
    if (
      maxScore >= BORDERLINE &&
      maxScore < THRESHOLD &&
      allFrames.length > tier1Frames.length
    ) {
      console.log("⚠️ Borderline detected, escalating scan");

      const remaining = allFrames.filter(f => !tier1Frames.includes(f));
      const tier2Frames = uniformSample(remaining, 10);

      for (const frame of tier2Frames) {
        const framePath = path.join(framesDir, frame);
        const resizedPath = `${framePath}-small.jpg`;

        try {
          await sharp(framePath)
            .resize(224, 224)
            .jpeg({ quality: 80 })
            .toFile(resizedPath);

          const form = new FormData();
          form.append("image", fs.createReadStream(resizedPath));

          const res = await axios.post(
            `${process.env.AI_SERVICE_URL}/analyze`,
            form,
            { headers: form.getHeaders(), timeout: 60000 }
          );

          const score = res.data.score;
          console.log("📊 AI SCORE (tier2):", score);

          maxScore = Math.max(maxScore, score);

          if (score >= THRESHOLD) break;
        } catch (err) {
          console.error("❌ AI failure (tier2):", err.message);
          maxScore = 1;
          break;
        }
      }
    }

    // 8️⃣ Final decision (fail-closed)
    const finalStatus = maxScore >= THRESHOLD ? "flagged" : "safe";

    await Video.updateOne(
      { _id: videoId },
      { status: finalStatus, sensitivityScore: maxScore }
    );

    io.emit("progress", { videoId, status: finalStatus });
  } catch (err) {
    console.error("❌ Video processing failed:", err);

    await Video.updateOne(
      { _id: videoId },
      { status: "flagged", sensitivityScore: 1 }
    );

    io.emit("progress", { videoId, status: "flagged" });
  } finally {
    // 9️⃣ Cleanup
    try {
      if (videoPath && fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (framesDir && fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.error("⚠️ Cleanup failed:", cleanupErr.message);
    }
  }
};
