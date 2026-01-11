import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const upload = async () => {
    if (!file) return;

    const form = new FormData();
    form.append("video", file);

    setUploading(true);
    setProgress(0);

    await api.post("/api/videos/upload", form, {
      onUploadProgress: (e) => {
        if (e.total) {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      }
    });

    setUploading(false);
    alert("Upload successful!");
    navigate("/");
  };

  return (
    <div className="upload-container">
      <h2>Upload Video</h2>
      <div
        className="upload-box"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          setFile(e.dataTransfer.files[0]);
        }}
      >
        {file ? (
          <b>{file.name}</b>
        ) : (
          <>
            <p>Drag & drop video here</p>
            <p>or</p>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </>
        )}
      </div>
      {uploading && (
        <div className="progress-wrapper">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <small>{progress}%</small>
        </div>
      )}

      <button
        className="btn btn-primary"
        disabled={!file || uploading}
        onClick={upload}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
