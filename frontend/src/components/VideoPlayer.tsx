export default function VideoPlayer({
  url,
  onClose
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <video
          src={url}
          controls
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 8
          }}
        />
      </div>
    </div>
  );
}
