"use client";

import { useRef, useState, type ComponentProps } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

type DrawTextProps = {
  afterFill?: boolean;
  color?: string;
  fontSize?: number;
  letterSpacing?: number;
  onDrawComplete?: () => void;
  oneByOne?: boolean;
  strokeWidth?: number;
  text: string;
  wordSpacing?: number;
} & ComponentProps<"svg">;

export const DrawLineText = ({
  text,
  oneByOne = true,
  afterFill = true,
  color = "black",
  fontSize = 40,
  wordSpacing = 10,
  strokeWidth = 1,
  letterSpacing = 0,
  onDrawComplete,
  ...props
}: DrawTextProps) => {
  const wrapperRef = useRef<SVGSVGElement | null>(null);
  const [textDimension, setTextDimension] = useState({ height: 0, width: 0 });

  useGSAP(
    () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const children = Array.from(wrapper.children) as SVGTextElement[];
      let totalWidth = 0;
      let maxHeight = 0;

      children.forEach((element, index) => {
        const elementWidth = element.getComputedTextLength();
        const box = element.getBBox();
        maxHeight = Math.max(maxHeight, box.height || fontSize);
        element.setAttribute("x", totalWidth + "px");

        const length = elementWidth * 8;
        element.style.strokeDasharray = length + "px";
        element.style.strokeDashoffset = length + "px";

        totalWidth +=
          (elementWidth === 0 ? wordSpacing : elementWidth) +
          (index < children.length - 1 ? letterSpacing : 0);
      });

      setTextDimension({ width: totalWidth, height: maxHeight });

      const visibleGlyphs = children.filter((element) => element.textContent?.trim());
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(visibleGlyphs, { strokeDashoffset: 0, fillOpacity: 1 });
        onDrawComplete?.();
        return;
      }

      const timeline = gsap.timeline();
      timeline.to(visibleGlyphs, {
        strokeDashoffset: 0,
        duration: 2.5,
        ease: "linear",
        stagger: oneByOne ? 0.8 : 0,
      });

      if (afterFill) {
        timeline.to(visibleGlyphs, {
          fillOpacity: 1,
          duration: 0.6,
          ease: "power4.in",
          stagger: { amount: 0.2, from: "center" },
        });
      }
      if (onDrawComplete) timeline.eventCallback("onComplete", onDrawComplete);
    },
    {
      scope: wrapperRef,
      dependencies: [text, oneByOne, afterFill, fontSize, wordSpacing, letterSpacing, onDrawComplete],
      revertOnUpdate: true,
    },
  );

  const estimatedWidth = Math.max(fontSize, Array.from(text).length * fontSize * 0.72);
  const width = textDimension.width || estimatedWidth;
  const height = textDimension.height || fontSize * 1.2;
  const viewBoxWidth = Math.max(1, width);
  const viewBoxHeight = Math.max(1, height * 1.1);

  return (
    <svg
      {...props}
      ref={wrapperRef}
      width={viewBoxWidth}
      height={viewBoxHeight}
      viewBox={"0 0 " + viewBoxWidth + " " + viewBoxHeight}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: "block",
        userSelect: "none",
        width: "100%",
        height: "auto",
        overflow: "visible",
        ...props.style,
      }}
    >
      {Array.from(text).map((character, index) => (
        <text
          key={index}
          style={{
            stroke: color,
            fill: color,
            fillOpacity: 0,
            fontSize: fontSize + "px",
            strokeWidth: strokeWidth + "px",
          }}
          y={fontSize}
        >
          {character}
        </text>
      ))}
    </svg>
  );
};

export default DrawLineText;
