"use client";

import * as React from "react";
import "./liquid-glass-logo-reveal.css";

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
  const style: React.CSSProperties & { "--glass-reveal-duration": string } = {
    "--glass-reveal-duration": duration + "ms",
  };

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

    </div>
  );
}

export default LiquidGlassLogoReveal;
