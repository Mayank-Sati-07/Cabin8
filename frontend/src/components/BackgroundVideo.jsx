import { useEffect, useRef } from 'react';

/**
 * Full-viewport ambient background video with gradient overlay.
 * Renders behind all page content for the dashboard aesthetic.
 */
export default function BackgroundVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    // Ensure video plays even if autoplay is blocked
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <div className="bg-video-wrapper" aria-hidden="true">
      <video
        ref={videoRef}
        className="bg-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23020617'/%3E%3Cstop offset='50%25' stop-color='%230f172a'/%3E%3Cstop offset='100%25' stop-color='%23020617'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='1920' height='1080'/%3E%3C/svg%3E"
      >
        {/* Futuristic abstract digital flow background */}
        <source
          src="https://videos.pexels.com/video-files/32399073/13820342_2560_1440_30fps.mp4"
          type="video/mp4"
        />
      </video>
      <div className="bg-video-overlay" />
    </div>
  );
}
