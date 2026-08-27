/**
 * Neutral placeholder seal. Deliberately NOT the State Emblem of India
 * (the four-lion national emblem is legally protected). Occupies the same
 * masthead position so the layout matches, without reproducing protected
 * government insignia.
 */
export function GovSeal({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Demo seal (placeholder, not an official emblem)"
    >
      <circle cx="32" cy="32" r="30" fill="none" stroke="#7a1f3d" strokeWidth="2" />
      <circle cx="32" cy="32" r="24" fill="none" stroke="#7a1f3d" strokeWidth="1" />
      {/* stylised columns — evokes 'administrative' without the national emblem */}
      <g fill="#7a1f3d">
        <rect x="18" y="26" width="4" height="16" />
        <rect x="26" y="26" width="4" height="16" />
        <rect x="34" y="26" width="4" height="16" />
        <rect x="42" y="26" width="4" height="16" />
        <polygon points="14,26 50,26 32,18" />
        <rect x="16" y="42" width="32" height="3" />
      </g>
      {/* subtle spokes ring */}
      <g stroke="#d9760a" strokeWidth="1">
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          const x1 = 32 + Math.cos(a) * 25;
          const y1 = 32 + Math.sin(a) * 25;
          const x2 = 32 + Math.cos(a) * 29;
          const y2 = 32 + Math.sin(a) * 29;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
    </svg>
  );
}
