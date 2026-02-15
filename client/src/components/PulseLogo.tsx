// ============================================================
// PulseLogo — wordmark with integrated heartbeat line
// A single continuous SVG line: heartbeat peaks to the LEFT of
// "Unity Pulse", then flattening into an underline beneath the
// text. One SVG, one polyline, no seams.
// ============================================================

interface Props {
  size?: 'sm' | 'lg';
  className?: string;
}

export default function PulseLogo({ size = 'sm', className = '' }: Props) {
  const isLg = size === 'lg';
  const strokeW = isLg ? 2.5 : 2;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Text with left padding to clear the pulse peaks */}
      <span
        className={`relative z-10 block font-bold tracking-tight leading-none ${
          isLg ? 'text-3xl pl-6' : 'text-lg pl-4'
        }`}
        style={{ fontFamily: "'Quantico', sans-serif" }}
      >
        Unity Pulse
      </span>

      {/* Single SVG: pulse peaks on the left, flat underline across full width */}
      <svg
        className={`absolute left-0 bottom-0 w-full overflow-visible ${
          isLg ? 'h-[30px]' : 'h-[18px]'
        }`}
        viewBox="0 0 100 28"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points="0,26 3,26 5.5,2 8.5,34 10.5,26 12,22 13,26 100,26"
          stroke="currentColor"
          strokeWidth={strokeW}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
