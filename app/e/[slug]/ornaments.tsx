/** Decorative sprig: curved stem, leaves and berries. Colours follow the theme. */
export function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden
      className={`pointer-events-none text-(--inv-accent) ${className}`}
      fill="none"
    >
      <path d="M6 6 C40 14 70 40 84 84" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.6" strokeLinecap="round" />
      {[
        [26, 14, -20],
        [48, 28, 10],
        [64, 52, 40],
        [76, 74, 62],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          d="M0 0 C8 -9 20 -9 26 0 C20 9 8 9 0 0Z"
          fill="currentColor"
          fillOpacity="0.28"
          transform={`translate(${x} ${y}) rotate(${r})`}
        />
      ))}
      <g fill="currentColor">
        <circle cx="90" cy="92" r="7" fillOpacity="0.55" />
        <circle cx="86" cy="104" r="5" fillOpacity="0.4" />
        <path d="M88 84 l-3 -6 M88 84 l4 -5" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** A few petals drifting down; purely decorative. */
export function Petals() {
  const petals = [
    { left: "12%", delay: "0s", dur: "9s", size: 10 },
    { left: "28%", delay: "2.5s", dur: "11s", size: 8 },
    { left: "48%", delay: "1s", dur: "10s", size: 12 },
    { left: "66%", delay: "4s", dur: "12s", size: 9 },
    { left: "82%", delay: "0.5s", dur: "9.5s", size: 11 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="petal absolute -top-6 rounded-[60%_40%_60%_40%] bg-(--inv-accent)/25"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.4,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
}
