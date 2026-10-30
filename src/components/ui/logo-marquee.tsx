"use client";

import { memo, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type Logo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type LogoMarqueeProps = {
  logos: Logo[];
  className?: string;
};

const LogoImage = memo(function LogoImage({ logo }: { logo: Logo }) {
  return (
    <img
      alt={logo.alt}
      src={logo.src}
      width={logo.width}
      height={logo.height}
      loading="lazy"
      draggable={false}
      className="pointer-events-none h-7 w-7 shrink-0 select-none object-contain opacity-75 transition-opacity duration-300 md:h-8 md:w-8"
    />
  );
});

export const LogoMarquee = memo(function LogoMarquee({
  logos,
  className,
}: LogoMarqueeProps) {
  const style = {
    "--logo-marquee-gap": "16px",
    "--logo-marquee-duration": "80s",
    "--logo-marquee-hover-duration": "25s",
  } as CSSProperties;

  return (
    <div
      className={cn(
        "logo-marquee mx-auto max-w-7xl overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]",
        className,
      )}
      style={style}
    >
      <style>{`
        @keyframes logo-marquee-scroll {
          to { transform: translateX(-50%); }
        }
        .logo-marquee-track {
          display: flex;
          width: max-content;
          animation: logo-marquee-scroll var(--logo-marquee-duration) linear infinite reverse;
        }
        .logo-marquee:hover .logo-marquee-track {
          animation-duration: var(--logo-marquee-hover-duration);
        }
        .logo-marquee-group {
          display: flex;
          flex: none;
          align-items: center;
          gap: var(--logo-marquee-gap);
          padding-inline-end: var(--logo-marquee-gap);
        }
        .logo-marquee-group img:hover { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .logo-marquee-track { animation: none; }
          .logo-marquee-group[aria-hidden="true"] { display: none; }
        }
      `}</style>
      <div className="logo-marquee-track">
        <div className="logo-marquee-group">
          {logos.map((logo, index) => (
            <LogoImage key={`${logo.alt}-${index}`} logo={logo} />
          ))}
        </div>
        <div className="logo-marquee-group" aria-hidden="true">
          {logos.map((logo, index) => (
            <LogoImage key={`${logo.alt}-copy-${index}`} logo={logo} />
          ))}
        </div>
      </div>
    </div>
  );
});

LogoMarquee.displayName = "LogoMarquee";
export default LogoMarquee;
