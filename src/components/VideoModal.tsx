import React, { useState } from "react";
import "./VideoModal.css";

const VideoModal: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        className="video-thumbnail-container"
        onClick={() => setOpen(true)}
        style={{ cursor: "pointer" }}
      >
        <img
          src="/lovable-uploads/imagem-videio-aereo.jpg"
          alt="Vista aérea de Milfontes"
          className="video-thumbnail"
        />
      </div>
      {open && (
        <div className="video-modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="video-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src="https://www.youtube.com/embed/6nlJW9-RiqM?autoplay=1&rel=0&modestbranding=1&playsinline=1"
              title="Vista aérea de Vila Nova de Milfontes"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder={0}
            />
            <button
              className="video-modal-close"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoModal;
