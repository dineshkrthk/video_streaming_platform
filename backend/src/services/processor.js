import fs from "fs";
import { exec } from "child_process";
import axios from "axios";
import FormData from "form-data";
import Video from "../models/Video.js";

export const processVideo = async (videoId, io) => {
  const video = await Video.findById(videoId);

  await Video.updateOne({ _id: videoId }, { status: "processing" });
  io.emit("progress", { videoId, status: "processing" });

  const framesDir = `frames/${videoId}`;
  await fs.promises.mkdir(framesDir, { recursive: true });

  // Extract 1 frame per second
  await new Promise((resolve, reject) => {
    exec(
      `ffmpeg -i "${video.path}" -vf fps=1 ${framesDir}/frame_%03d.jpg`,
      (err) => (err ? reject(err) : resolve())
    );
  });

  const frames = fs.readdirSync(framesDir);
  let maxScore = 0;
  for (const frame of frames) {
    const framePath = `${framesDir}/${frame}`;
    const form = new FormData();
    form.append("image", fs.createReadStream(framePath));
    const res = await axios.post("http://127.0.0.1:5001/analyze", form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    console.log("AI score:", res.data);
    maxScore = Math.max(maxScore, res.data.score);
  }
  const status = maxScore > 0.6 ? "flagged" : "safe";
  await Video.updateOne(
    { _id: videoId },
    { status, sensitivityScore: maxScore }
  );
  io.emit("progress", { videoId, status });
};
