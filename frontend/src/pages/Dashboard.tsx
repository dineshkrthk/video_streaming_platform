import { useEffect, useState, useContext } from "react";
import api from "../api/axios";
import { socket } from "../api/socket";
import type { Video } from "../types/Video";
import VideoPlayer from "../components/VideoPlayer";
import VideoCard from "../components/VideoCard";
import { AuthContext } from "../auth/AuthContext";

export default function Dashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [playUrl, setPlayUrl] = useState<string | null>(null);
  const auth = useContext(AuthContext);

  const role = auth?.role as "admin" | "editor" | "viewer";

  const load = async () => {
    const res = await api.get("/api/videos");
    setVideos(res.data);
  };

  useEffect(() => {
    load();

    socket.on("progress", (data) => {
      setVideos((prev) =>
        prev.map((v) =>
          v._id === data.videoId
            ? { ...v, status: data.status || "processing" }
            : v
        )
      );
    });

    return () => {
      socket.off("progress");
    };
  }, []);

  //Delete (Admin + Editor only)
  const deleteVideo = async (id: string) => {
    if (!window.confirm("Delete this video?")) return;
    await api.delete(`/api/videos/${id}`);
    setVideos((prev) => prev.filter((v) => v._id !== id));
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div>
          <h2>{role === "admin" ? "Admin Dashboard" : "My Videos"}</h2>
          <small style={{ color: "#666" }}>
            Logged in as <b>{role.toUpperCase()}</b>
          </small>
        </div>

        <div>
          {(role === "admin" || role === "editor") && (
            <a href="/upload" className="btn btn-primary">
              Upload
            </a>
          )}

          <button
            className="btn btn-danger"
            style={{ marginLeft: 10 }}
            onClick={auth?.logout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Video List */}
      {videos.length === 0 && <p>No videos available.</p>}

      {videos.map((video) => (
        <VideoCard
          key={video._id}
          video={video}
          role={role}
          onPlay={async () => {
            const res = await api.get(`/api/videos/play/${video._id}`);
            setPlayUrl(res.data.url);
          }}
          onDelete={
            role === "admin" || role === "editor"
              ? () => {
                  deleteVideo(video._id);
                }
              : undefined
          }
        />
      ))}

      {/* Modal Player */}
      {playUrl && (
        <VideoPlayer url={playUrl} onClose={() => setPlayUrl(null)} />
      )}
    </div>
  );
}
