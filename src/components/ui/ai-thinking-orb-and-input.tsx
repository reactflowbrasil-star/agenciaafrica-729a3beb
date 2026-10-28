import { useEffect, useRef, useState, type RefObject } from "react";

/*
 * Answer bar that morphs into a dotted "thinking" orb on submit, then
 * confirms and hands the text back. Visual recreation of the MorphOrb module,
 * styled with the AFRICA tokens (see .orb-* rules in src/styles.css).
 */

type Phase = "idle" | "launch" | "think" | "done";

const LABELS = ["Analisando", "Registrando", "Preparando a próxima"];
const THINK_MS = 1500;

export interface OrbAnswerInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (text: string) => void;
  placeholder?: string;
  inputRef?: RefObject<HTMLTextAreaElement | null>;
}

/* dotted sphere points, built once */
const DOTS = (() => {
  const out: { x: number; y: number; z: number; u: number }[] = [];
  const rings = 14;
  for (let k = 0; k < rings; k++) {
    const y = 1 - ((k + 0.5) / rings) * 2;
    const r = Math.sqrt(1 - y * y);
    const m = Math.max(4, Math.round(26 * r));
    for (let j = 0; j < m; j++) {
      const a = (j / m) * Math.PI * 2 + k * 0.35;
      out.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r, u: (1 - y) / 2 });
    }
  }
  return out;
})();

function useOrbCanvas(canvasRef: RefObject<HTMLCanvasElement | null>, active: boolean, done: boolean) {
  const doneRef = useRef(done);
  doneRef.current = done;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!active || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const SIZE = 180;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const color = getComputedStyle(canvas).color || "rgb(230,180,90)";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const t0 = performance.now();
    let sweep = 0;
    const frame = (now: number) => {
      const t = reduced ? 1.2 : (now - t0) / 1000;
      const k = Math.min(1, t / 0.6);
      if (doneRef.current) sweep = Math.min(1, sweep + 0.04);
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = color;
      const yaw = t * 0.9, cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(0.35), sp = Math.sin(0.35);
      const R = 54;
      const head = (t * 260) % DOTS.length;
      DOTS.forEach((d, n) => {
        const ki = Math.max(0, Math.min(1, k * 1.6 - 0.6 * d.u));
        if (ki <= 0) return;
        const x1 = d.x * cy + d.z * sy, z1 = -d.x * sy + d.z * cy;
        const y2 = d.y * cp - z1 * sp, z2 = d.y * sp + z1 * cp;
        const f = 2.8 / (2.8 - z2), depth = (z2 + 1) / 2;
        let dd = Math.abs(n - head);
        if (dd > DOTS.length - dd) dd = DOTS.length - dd;
        const lit = Math.max(0, 1 - dd / 18) ** 2;
        const g = Math.max(0, Math.min(1, (sweep * 1.4 - d.u) / 0.4));
        const a = Math.min(1, 0.12 + 0.4 * depth * depth + 0.8 * lit * (1 - g) + g * (0.6 + 0.4 * depth)) * ki;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(SIZE / 2 + x1 * R * f * ki, SIZE / 2 - y2 * R * f * ki, (0.6 + 0.9 * depth) * f + lit, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, canvasRef]);
}

export default function OrbAnswerInput({ value, onChange, onSubmit, placeholder = "Digite sua resposta…", inputRef }: OrbAnswerInputProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState(0);
  const [shake, setShake] = useState(false);
  const [typing, setTyping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timers = useRef<number[]>([]);
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? localRef;

  useOrbCanvas(canvasRef, phase !== "idle", phase === "done");
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // auto-grow the field
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value, ref]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const send = () => {
    if (phase !== "idle") return;
    const text = value.trim();
    if (!text) {
      setShake(true);
      later(() => setShake(false), 300);
      return;
    }
    setPhase("launch");
    setLabel(0);
    later(() => setPhase("think"), 450);
    later(() => setLabel(1), 450 + THINK_MS / 2);
    later(() => { setLabel(2); setPhase("done"); }, 450 + THINK_MS);
    later(() => onSubmit(text), 450 + THINK_MS + 650);
  };

  return (
    <div className="orb-root" data-phase={phase}>
      <form
        className="orb-pill"
        data-shake={shake ? "" : undefined}
        data-typing={typing ? "" : undefined}
        onSubmit={(e) => { e.preventDefault(); send(); }}
        autoComplete="off"
        inert={phase !== "idle" ? true : undefined}
      >
        <span className="orb-aurora" aria-hidden="true"><i /><i /><i /></span>
        <svg className="orb-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10 3.5l1.7 4.8 4.8 1.7-4.8 1.7L10 16.5l-1.7-4.8L3.5 10l4.8-1.7L10 3.5z" />
          <path d="M18 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
        </svg>
        <textarea
          ref={ref}
          rows={1}
          className="orb-field"
          value={value}
          placeholder={placeholder}
          aria-label="Sua resposta"
          onChange={(e) => {
            onChange(e.target.value);
            setTyping(true);
            timers.current.push(window.setTimeout(() => setTyping(false), 300));
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
          }}
        />
        <button type="submit" className="orb-send" aria-label="Enviar resposta" data-ready={value.trim() ? "" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5" /><path d="M5.5 11.5L12 5l6.5 6.5" />
          </svg>
        </button>
      </form>

      <div className="orb-stage" aria-hidden="true">
        <span className="orb-halo" />
        <canvas ref={canvasRef} className="orb-canvas" />
        <span className="orb-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </span>
      </div>

      <div className="orb-status" role="status" aria-live="polite">
        {phase !== "idle" && (
          <span key={label} className="orb-label">
            {phase === "done" ? "Resposta registrada" : LABELS[label]}
            {phase !== "done" && <span className="orb-dots" aria-hidden="true"><i /><i /><i /></span>}
          </span>
        )}
      </div>
    </div>
  );
}
