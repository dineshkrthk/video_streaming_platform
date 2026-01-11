import StatusBadge from "./StatusBadge";
import type { Video } from "../types/Video";

export default function VideoCard({
  video,
  role,
  onPlay,
  onDelete
}: {
  video: Video;
  role: "admin" | "editor" | "viewer";
  onPlay: () => void;
  onDelete?: () => void;
}) {
  const canPlay =
    video.status === "safe" ||
    (role === "admin" && video.status === "flagged");

  const canDelete = role === "admin" || role === "editor";

  return (
    <div className={`video-card ${video.status}`}>
      <div>
        <b>{video.originalName}</b>
        <StatusBadge status={video.status} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn btn-primary"
          disabled={!canPlay}
          onClick={onPlay}
          title={
            !canPlay
              ? "Video under review"
              : role === "admin" && video.status === "flagged"
              ? "Admin preview"
              : "Play video"
          }
        >
          Play
        </button>
        {canDelete && (
          <button
            className="btn btn-danger"
            onClick={onDelete}
          >
           Delete
          </button>
        )}
      </div>
    </div>
  );
}
