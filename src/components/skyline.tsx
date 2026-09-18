// Decorative skyline silhouette: a courthouse (columns + pediment) flanked by
// office buildings, with a handful of windows that softly twinkle via CSS.
// Purely decorative background layer — aria-hidden, no motion beyond the
// slow opacity pulse on individual windows.

type Win = { x: number; y: number; delay: number; duration: number };

function windows(buildingX: number, buildingWidth: number, top: number, bottom: number, seed: number): Win[] {
  const cols = Math.max(2, Math.floor(buildingWidth / 20));
  const rows = Math.max(2, Math.floor((bottom - top) / 18));
  const out: Win[] = [];
  let i = seed;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      i++;
      // Sparse, deterministic pseudo-random selection so it's stable across renders.
      if ((i * 2654435761) % 9 !== 0) continue;
      out.push({
        x: buildingX + 7 + c * 20,
        y: top + 10 + r * 18,
        delay: (i % 7) * 0.9,
        duration: 4 + (i % 5),
      });
    }
  }
  return out;
}

const buildings = [
  { x: 0, w: 90, top: 120, far: true },
  { x: 95, w: 60, top: 90, far: false },
  { x: 160, w: 110, top: 60, far: true },
  { x: 275, w: 70, top: 100, far: false },
  { x: 350, w: 90, top: 45, far: true },
  // gap for courthouse at ~440-660
  { x: 660, w: 80, top: 70, far: true },
  { x: 745, w: 55, top: 100, far: false },
  { x: 805, w: 100, top: 50, far: true },
  { x: 910, w: 65, top: 90, far: false },
  { x: 980, w: 95, top: 65, far: true },
  { x: 1080, w: 70, top: 105, far: false },
  { x: 1155, w: 110, top: 55, far: true },
  { x: 1270, w: 80, top: 95, far: false },
  { x: 1355, w: 85, top: 75, far: true },
];

const baseline = 200;

export function Skyline({ className }: { className?: string }) {
  const nearWindows = buildings
    .filter((b) => !b.far)
    .flatMap((b, idx) => windows(b.x, b.w, b.top, baseline, idx * 13 + 1));
  const farWindows = buildings
    .filter((b) => b.far)
    .flatMap((b, idx) => windows(b.x, b.w, b.top, baseline, idx * 17 + 5));

  return (
    <svg
      viewBox="0 0 1440 220"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true"
    >
      {/* Far buildings — lighter, recede into the background */}
      <g className="fill-brand-stone dark:fill-white/[0.04]">
        {buildings
          .filter((b) => b.far)
          .map((b, i) => (
            <rect key={i} x={b.x} y={b.top} width={b.w} height={baseline - b.top} />
          ))}
      </g>

      {/* Near buildings — a touch deeper for depth */}
      <g className="fill-brand-stone-deep dark:fill-white/[0.06]">
        {buildings
          .filter((b) => !b.far)
          .map((b, i) => (
            <rect key={i} x={b.x} y={b.top} width={b.w} height={baseline - b.top} />
          ))}
      </g>

      {/* Courthouse: base, columns, pediment */}
      <g className="fill-brand-stone-deep dark:fill-white/[0.08]">
        <rect x="440" y="150" width="220" height="50" />
        <rect x="450" y="70" width="200" height="80" />
        <polygon points="440,70 660,70 550,25" />
        {[470, 505, 540, 575, 610].map((x) => (
          <rect key={x} x={x} y="85" width="10" height="65" fill="var(--brand-paper)" className="dark:fill-slate-950" />
        ))}
      </g>

      {/* Twinkling windows — sparser/dimmer on the far row for depth */}
      <g className="fill-brand-brass/50 dark:fill-brand-brass/40">
        {nearWindows.map((w, i) => (
          <rect
            key={i}
            x={w.x}
            y={w.y}
            width="3"
            height="4"
            style={{ animation: `skyline-twinkle ${w.duration}s ease-in-out ${w.delay}s infinite` }}
          />
        ))}
      </g>
      <g className="fill-brand-brass/25 dark:fill-brand-brass/25">
        {farWindows.map((w, i) => (
          <rect
            key={i}
            x={w.x}
            y={w.y}
            width="3"
            height="4"
            style={{ animation: `skyline-twinkle ${w.duration + 1}s ease-in-out ${w.delay}s infinite` }}
          />
        ))}
      </g>
    </svg>
  );
}
