/**
 * Cabin8 logomark: a single flowing stroke on a soft gradient badge, echoing
 * the app's ribbon-shaped background video and liquid motion motifs. Colors
 * are read from the active theme's gradient tokens via CSS variables, so it
 * adapts automatically between light and dark mode.
 */
export default function Logo({ size = 32, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Cabin8"
    >
      <defs>
        <linearGradient id="cabin8-logo-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--gradient-start)" />
          <stop offset="1" stopColor="var(--gradient-mid)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#cabin8-logo-g)" />
      <path
        d="M9 24C9 17 14 19 16 16C18 13 23 15 23 8"
        fill="none"
        stroke="var(--color-on-primary)"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
