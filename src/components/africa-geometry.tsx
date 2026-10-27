const POINTS: [number, number][] = [
  [90, 120], [330, 60], [560, 170], [820, 90], [1080, 180], [1330, 110],
  [180, 340], [470, 300], [720, 420], [980, 330], [1250, 430],
  [110, 610], [390, 660], [660, 590], [930, 700], [1210, 640],
  [260, 830], [560, 790], [860, 860], [1160, 810],
];

const CHAINS: number[][] = [
  [0, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19],
  [0, 6, 11, 16],
  [1, 7, 12, 17],
  [2, 8, 13, 18],
  [3, 9, 14, 19],
  [5, 10, 15, 19],
  [6, 8, 10, 14],
  [11, 13, 15],
  [12, 8, 9, 14],
];

const STEP = 2.8;

function chainPath(chain: number[]) {
  return chain
    .map((index, k) => `${k === 0 ? "M" : "L"} ${POINTS[index][0]} ${POINTS[index][1]}`)
    .join(" ");
}

export default function AfricaGeometry() {
  return (
    <div
      className="africa-geometry pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="africa-mesh">
          {CHAINS.map((chain, i) => (
            <path
              key={i}
              className="africa-link"
              d={chainPath(chain)}
              pathLength={1}
              strokeWidth={i % 3 === 0 ? 1.4 : 0.9}
              style={{ animationDelay: `${-i * STEP}s, ${-i * STEP}s` }}
            />
          ))}
        </g>
        <g className="geometry-trails">
          <path d="M -200 640 C 260 430, 620 760, 1040 500 S 1500 250, 1760 380" pathLength={1} />
          <path d="M -200 200 C 300 360, 700 120, 1120 300 S 1520 520, 1760 360" pathLength={1} />
        </g>
      </svg>
    </div>
  );
}
