/**
 * Faint node-and-link network topology drawn behind headers.
 * Purely decorative: positioned absolutely by the parent and hidden from assistive tech.
 */
const NODES: [number, number, "router" | "switch" | "host"][] = [
  [60, 40, "host"],
  [150, 90, "switch"],
  [70, 150, "host"],
  [260, 60, "router"],
  [380, 120, "router"],
  [330, 200, "switch"],
  [470, 50, "host"],
  [520, 180, "switch"],
  [640, 90, "router"],
  [600, 230, "host"],
  [760, 160, "router"],
  [850, 60, "switch"],
  [900, 210, "host"],
  [990, 120, "router"],
  [1080, 50, "host"],
  [1110, 200, "switch"],
  [1200, 110, "host"],
];

const LINKS: [number, number][] = [
  [0, 1], [2, 1], [1, 3], [3, 4], [4, 5], [3, 6], [4, 7], [7, 9], [4, 8], [6, 8],
  [8, 10], [10, 11], [10, 12], [11, 13], [10, 13], [13, 14], [13, 15], [15, 16], [5, 7],
];

export default function TopologyPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1260 260"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="currentColor" strokeWidth="1.2" opacity="0.5">
        {LINKS.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
        ))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        {NODES.map(([x, y, kind], i) =>
          kind === "router" ? (
            <circle key={i} cx={x} cy={y} r="10" />
          ) : kind === "switch" ? (
            <rect key={i} x={x - 11} y={y - 7} width="22" height="14" rx="2" />
          ) : (
            <circle key={i} cx={x} cy={y} r="4" fill="currentColor" />
          ),
        )}
      </g>
    </svg>
  );
}
