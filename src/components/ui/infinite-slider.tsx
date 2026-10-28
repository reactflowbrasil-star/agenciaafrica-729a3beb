'use client';

import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type InfiniteSliderProps = {
  children: ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

/** A lightweight, accessible marquee for repeating logo strips and other content. */
export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const style = {
    '--infinite-slider-gap': `${gap}px`,
    '--infinite-slider-duration': `${duration}s`,
    ...(durationOnHover ? { '--infinite-slider-hover-duration': `${durationOnHover}s` } : {}),
    animationDirection: reverse ? 'reverse' : 'normal',
  } as CSSProperties;

  return (
    <div className={cn('infinite-slider overflow-hidden', className)} data-direction={direction}>
      <style>{`
        @keyframes infinite-slider-horizontal { to { transform: translateX(-50%); } }
        @keyframes infinite-slider-vertical { to { transform: translateY(-50%); } }
        .infinite-slider-track {
          display: flex;
          width: max-content;
          animation: infinite-slider-horizontal var(--infinite-slider-duration) linear infinite;
          animation-direction: var(--infinite-slider-direction, normal);
        }
        .infinite-slider[data-direction="vertical"] .infinite-slider-track {
          flex-direction: column;
          animation-name: infinite-slider-vertical;
        }
        .infinite-slider-group {
          display: flex;
          flex: none;
          align-items: center;
          gap: var(--infinite-slider-gap);
          padding-inline-end: var(--infinite-slider-gap);
        }
        .infinite-slider[data-direction="vertical"] .infinite-slider-group {
          flex-direction: column;
          padding-inline-end: 0;
          padding-block-end: var(--infinite-slider-gap);
        }
        .infinite-slider-track:hover {
          animation-duration: var(--infinite-slider-hover-duration, var(--infinite-slider-duration));
        }
        @media (prefers-reduced-motion: reduce) {
          .infinite-slider-track { animation: none; }
          .infinite-slider-group[aria-hidden="true"] { display: none; }
        }
      `}</style>
      <div
        className="infinite-slider-track"
        style={{ ...style, '--infinite-slider-direction': reverse ? 'reverse' : 'normal' } as CSSProperties}
      >
        <div className="infinite-slider-group">{children}</div>
        <div className="infinite-slider-group" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
