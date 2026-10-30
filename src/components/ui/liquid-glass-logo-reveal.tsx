"use client";

import * as React from "react";

type LiquidGlassLogoRevealProps = {
  src: string;
  alt: string;
  className?: string;
  duration?: number;
};

/** A lightweight, self-contained liquid-glass reveal for the intro logo. */
export function LiquidGlassLogoReveal({
  src,
  alt,
  className = "",
  duration = 6000,
}: LiquidGlassLogoRevealProps) {
  const filterId = React.useId().replace(/:/g, "");
  const style = { ["--glass-reveal-duration" as string]: duration + "ms" };

  return (
    <div className={"africa-glass-reveal " + className} style={style}>
      <svg aria-hidden="true" className="africa-glass-defs">
        <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.035"
            numOctaves="2"
            seed="8"
            result="texture"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="texture"
            scale="60"
            xChannelSelector="R"
            yChannelSelector="G"
          >
            <animate
              attributeName="scale"
              values="60;82;28;0;0"
              keyTimes="0;0.12;0.3;0.55;1"
              dur={duration + "ms"}
              fill="freeze"
            />
          </feDisplacementMap>
        </filter>
      </svg>

      <img
        src={src}
        alt={alt}
        className="africa-glass-mark"
        style={{ filter: "url(#" + filterId + ")" }}
      />
      <span aria-hidden="true" className="africa-glass-droplet" />
      <style>{"
        .africa-glass-reveal {
          position: relative;
          display: grid;
          place-items: center;
          isolation: isolate;
          overflow: visible;
        }
        .africa-glass-defs {
          position: absolute;
          width: 0;
          height: 0;
          overflow: hidden;
        }
        .africa-glass-mark {
          position: relative;
          z-index: 1;
          display: block;
          width: 100%;
          height: auto;
          max-height: 55dvh;
          object-fit: contain;
          opacity: 0;
          transform: scale(1.22);
          animation: africa-glass-mark-reveal var(--glass-reveal-duration) cubic-bezier(.2,.75,.25,1) forwards;
          will-change: opacity, transform, filter;
        }
        .africa-glass-droplet {
          position: absolute;
          z-index: 2;
          left: 50%;
          top: 50%;
          width: 18%;
          aspect-ratio: 1;
          border: 1px solid rgba(255,255,255,.75);
          border-radius: 50%;
          background:
            radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.78), transparent 38%),
            linear-gradient(145deg, rgba(255,255,255,.23), rgba(255,255,255,.025) 62%, rgba(255,255,255,.17));
          box-shadow:
            inset 0 1px 2px rgba(255,255,255,.62),
            inset 0 -2px 8px rgba(255,255,255,.11),
            0 0 34px rgba(193,226,255,.2),
            0 14px 50px rgba(0,0,0,.22);
          opacity: 0;
          transform: translate(-50%,-50%) scale(.12);
          backdrop-filter: blur(9px) saturate(1.3);
          -webkit-backdrop-filter: blur(9px) saturate(1.3);
          animation: africa-glass-droplet-reveal var(--glass-reveal-duration) cubic-bezier(.2,.75,.25,1) forwards;
          will-change: width, border-radius, opacity, transform;
        }
        @keyframes africa-glass-mark-reveal {
          0%, 9% { opacity: 0; transform: scale(1.22); }
          24% { opacity: 1; transform: scale(1.12); }
          45% { opacity: 1; transform: scale(1.08); }
          76%, 100% { opacity: 1; transform: scale(1); }
        }
        @keyframes africa-glass-droplet-reveal {
          0%, 5% { opacity: 0; width: 18%; border-radius: 50%; transform: translate(-50%,-50%) scale(.12); }
          15% { opacity: 1; width: 18%; border-radius: 50%; transform: translate(-50%,-50%) scale(1); }
          36% { opacity: .96; width: 82%; border-radius: 34%; transform: translate(-50%,-50%) scale(1); }
          52% { opacity: .74; width: 82%; border-radius: 34%; transform: translate(-50%,-50%) scale(1.015); }
          72% { opacity: .34; width: 82%; border-radius: 34%; transform: translate(-50%,-50%) scale(1.035); }
          84%, 100% { opacity: 0; width: 82%; border-radius: 34%; transform: translate(-50%,-50%) scale(1.07); }
        }
        @media (prefers-reduced-motion: reduce) {
          .africa-glass-mark { animation-duration: 1ms; }
          .africa-glass-droplet { animation-duration: 1ms; }
        }
      "}</style>
    </div>
  );
}

export default LiquidGlassLogoReveal;
