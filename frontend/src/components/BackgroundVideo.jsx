import { useEffect, useRef } from 'react';

/**
 * Full-viewport ambient background video with gradient overlay.
 * Renders behind all page content for the dashboard aesthetic. Dark and
 * light themes each get their own clip; CSS shows only the active one so
 * both can stay mounted (and looping) without a jarring swap on toggle.
 */
export default function BackgroundVideo() {
  const darkVideoRef = useRef(null);
  const lightVideoRef = useRef(null);

  useEffect(() => {
    // Ensure video plays even if autoplay is blocked
    darkVideoRef.current?.play().catch(() => {});
    lightVideoRef.current?.play().catch(() => {});
  }, []);

  return (
    <>
      <div className="bg-video-wrapper bg-video-wrapper--dark" aria-hidden="true">
        <video
          ref={darkVideoRef}
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
        <div className="bg-video-overlay bg-video-overlay--dark" />
      </div>

      <div className="bg-video-wrapper bg-video-wrapper--light" aria-hidden="true">
        <video
          ref={lightVideoRef}
          className="bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23eef0fb'/%3E%3Cstop offset='50%25' stop-color='%23f7f7fd'/%3E%3Cstop offset='100%25' stop-color='%23fdf1ec'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g2)' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          {/* Soft pastel flow — periwinkle blue easing into a warm peach glow */}
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_034306_165449ef-7d2e-4e81-850f-1939c5cb442d.mp4"
            type="video/mp4"
          />
        </video>
        <div className="bg-video-overlay bg-video-overlay--light" />
      </div>
    </>
  );
}
