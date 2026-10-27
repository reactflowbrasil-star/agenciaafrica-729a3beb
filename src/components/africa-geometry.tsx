const outline = "M140 52 L169 37 L205 34 L226 44 L255 44 L277 60 L299 61 L312 80 L339 86 L357 113 L370 144 L388 178 L411 186 L438 178 L418 216 L391 243 L377 273 L359 289 L365 317 L352 347 L340 361 L328 394 L306 418 L290 449 L269 465 L248 450 L237 424 L224 397 L221 372 L208 350 L206 321 L192 296 L194 271 L179 249 L153 250 L125 242 L105 228 L81 225 L64 203 L56 180 L62 153 L79 134 L88 108 L109 87 L119 65 Z";
const mesh = [
  "M140 52 L155 133 L88 108 M155 133 L62 153 M155 133 L105 228 L179 249 L155 133 L226 44",
  "M155 133 L247 133 L226 44 M247 133 L299 61 M247 133 L357 113 M247 133 L310 212 L370 144",
  "M105 228 L198 211 L155 133 M198 211 L247 133 M198 211 L179 249 L256 273 L310 212 L198 211",
  "M310 212 L411 186 M310 212 L391 243 M310 212 L359 289 L256 273 L247 133",
  "M256 273 L206 321 M256 273 L283 350 L365 317 M283 350 L359 289 M283 350 L328 394 L290 449",
  "M206 321 L283 350 L224 397 M283 350 L269 465 M224 397 L328 394",
];

/** Decorative only: never intercepts the briefing's input or focus. */
export function AfricaGeometry() {
  return (
    <div aria-hidden="true" className="africa-geometry pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="africa-map" viewBox="0 0 500 500" fill="none">
        <defs>
          <clipPath id="africa-map-clip"><path d={outline} /></clipPath>
        </defs>
        <path className="africa-outline-base" d={outline} />
        <path className="africa-outline-draw" d={outline} pathLength="1" />
        <g className="africa-mesh" clipPath="url(#africa-map-clip)">
          {mesh.map((d) => <path key={d} d={d} pathLength="1" className="africa-mesh-line" />)}
        </g>
        <path className="africa-outline-base" d="M416 331 L426 319 L429 338 L421 365 L410 381 L407 367 Z" />
        <g className="africa-nodes">
          {[[155,133],[247,133],[198,211],[310,212],[256,273],[283,350],[328,394]].map(([cx,cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />)}
        </g>
      </svg>
      <svg className="geometry-trails" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" fill="none">
        <path d="M-120 780 L230 580 L420 690 L720 500 L1080 660 L1560 390" pathLength="1" />
        <path d="M-120 240 L280 400 L510 170 L890 310 L1140 120 L1560 270" pathLength="1" />
      </svg>
    </div>
  );
}