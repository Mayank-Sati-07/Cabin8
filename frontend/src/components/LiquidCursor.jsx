import { useEffect, useRef } from 'react';

const BLOB_COUNT = 4;
const BLOB_SPEEDS = [0.42, 0.26, 0.17, 0.11];

/**
 * A liquid/metaball cursor: a chain of blobs that lag behind the pointer at
 * decreasing speed, fused into one gooey shape via an SVG "goo" filter, plus
 * a soft ambient glow. Disabled for touch input and reduced-motion.
 */
export default function LiquidCursor() {
  const glowRef = useRef(null);
  const containerRef = useRef(null);
  const blobRefs = useRef([]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isCoarsePointer) return undefined;

    const glow = glowRef.current;
    const container = containerRef.current;
    const blobs = blobRefs.current;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let active = false;
    const positions = blobs.map(() => ({ x: mouseX, y: mouseY }));
    let rafId;

    const activate = () => {
      if (active) return;
      active = true;
      glow.classList.add('is-active');
      container.classList.add('is-active');
    };

    const deactivate = () => {
      active = false;
      glow.classList.remove('is-active');
      container.classList.remove('is-active');
    };

    const handleMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      activate();
      glow.style.setProperty('--cursor-x', `${mouseX}px`);
      glow.style.setProperty('--cursor-y', `${mouseY}px`);
    };

    const handleDown = () => blobs[0]?.classList.add('is-pressed');
    const handleUp = () => blobs[0]?.classList.remove('is-pressed');

    const tick = () => {
      positions.forEach((pos, i) => {
        const speed = BLOB_SPEEDS[i] ?? 0.1;
        const prevX = pos.x;
        const prevY = pos.y;
        pos.x += (mouseX - pos.x) * speed;
        pos.y += (mouseY - pos.y) * speed;
        const dist = Math.hypot(pos.x - prevX, pos.y - prevY);
        const scale = 1 + Math.min(dist / 60, 0.4);
        const el = blobs[i];
        if (el) el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('mousemove', handleMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', deactivate);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
      document.documentElement.removeEventListener('mouseleave', deactivate);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-light-glow" aria-hidden="true" />
      <svg className="liquid-cursor-defs" aria-hidden="true">
        <defs>
          <filter id="liquid-cursor-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div ref={containerRef} className="liquid-cursor-container" aria-hidden="true">
        {Array.from({ length: BLOB_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { blobRefs.current[i] = el; }}
            className={`liquid-cursor-blob liquid-cursor-blob--${i}`}
          />
        ))}
      </div>
    </>
  );
}
