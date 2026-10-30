'use client';

import { useEffect, useRef, useState } from "react";
import { ChevronRight, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  description: string;
}

const chapters: Chapter[] = [
  {
    id: "01",
    title: "Nossa essência",
    subtitle: "Cultura que inspira. Estratégia que transforma.",
    description: "Ideias frescas e execuções corajosas que conectam cultura e negócios. A AFRICA leva a ginga brasileira para marcas com ambição global.",
  },
  {
    id: "02",
    title: "Criatividade com performance",
    subtitle: "Cada ideia precisa mover algo.",
    description: "Unimos branding, design e mídia de performance para criar experiências que aproximam marcas das pessoas e geram resultados de verdade.",
  },
  {
    id: "03",
    title: "Creative como sobrenome",
    subtitle: "Vamos construir sua próxima grande ideia?",
    description: "Conte para a AFRICA o que sua marca quer transformar. Nosso time está pronto para começar essa conversa.",
  },
];

const heroStyles = [
  "@keyframes africa-hero-reveal { from { opacity: 0; transform: translate3d(0, 24px, 0); filter: blur(8px); } to { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); } }",
  ".africa-hero-copy { animation: africa-hero-reveal 850ms cubic-bezier(.16,1,.3,1) both; }",
  ".africa-hero-copy > :nth-child(2) { animation-delay: 90ms; }",
  ".africa-hero-copy > :nth-child(3) { animation-delay: 180ms; }",
  ".africa-hero-copy > :nth-child(4) { animation-delay: 270ms; }",
  "@media (prefers-reduced-motion: reduce) { .africa-hero-copy { animation: none; } }",
].join("\n");

function FilmGrain() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 opacity-[0.06] mix-blend-overlay">
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%271%27/%3E%3C/svg%3E")',
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}

export default function CinematicScrol({
  videoUrl,
  logoUrl,
}: {
  videoUrl: string;
  logoUrl: string;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = containerRef.current;
    const scrollHost = section?.closest<HTMLElement>("[data-landing-scroll]");
    if (!section || !scrollHost) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const travel = Math.max(1, section.offsetHeight - scrollHost.clientHeight);
        const nextProgress = Math.max(
          0,
          Math.min(1, -section.getBoundingClientRect().top / travel),
        );
        setProgress(nextProgress);
        const nextIndex = Math.min(
          Math.floor(nextProgress * chapters.length),
          chapters.length - 1,
        );
        setActiveIndex((current) => current === nextIndex ? current : nextIndex);
      });
    };

    scrollHost.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      scrollHost.removeEventListener("scroll", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToChapter = (index: number) => {
    const section = containerRef.current;
    const scrollHost = section?.closest<HTMLElement>("[data-landing-scroll]");
    if (!section || !scrollHost) return;
    const travel = Math.max(0, section.offsetHeight - scrollHost.clientHeight);
    const destination = section.offsetTop + travel * index / (chapters.length - 1);
    scrollHost.scrollTo({ top: destination, behavior: "smooth" });
  };

  const chapter = chapters[activeIndex];

  return (
    <section
      ref={containerRef}
      className="africa-scroll-story relative h-[300vh] w-full supports-[height:100svh]:h-[300svh]"
    >
      <style>{heroStyles}</style>
      <div className="sticky top-0 h-screen w-full overflow-hidden supports-[height:100svh]:h-svh">
        <video
          key={videoUrl}
          src={videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="Leões caminhando pela floresta"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/50" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,.72) 0%, rgba(0,0,0,.38) 55%, rgba(0,0,0,.12) 100%), linear-gradient(0deg, rgba(0,0,0,.38), transparent 55%)",
          }}
        />
        <FilmGrain />

        <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-14">
          <img src={logoUrl} alt="AFRICA" className="h-auto w-[min(38vw,180px)] object-contain sm:w-[190px]" />
          <a
            href="https://wa.me/558398907010"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/40 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-white hover:bg-white/10 sm:px-5 sm:text-sm"
          >
            Fale com a AFRICA
          </a>
        </header>

        <div className="pointer-events-none absolute inset-0 z-30">
          {chapters.map((item, index) => {
            const active = index === activeIndex;
            return (
              <div
                key={item.id}
                aria-hidden={!active}
                className={cn(
                  "absolute inset-0 flex items-center px-5 pb-20 pt-24 transition-opacity duration-700 sm:px-10 lg:px-24",
                  active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <div key={item.id + "-" + activeIndex} className="africa-hero-copy pointer-events-auto w-full max-w-4xl">
                  <div className="mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">
                    <div className="h-0.5 w-8 bg-primary sm:w-12" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary sm:text-xs sm:tracking-[0.3em]">
                      Capítulo {item.id} · Agência AFRICA
                    </span>
                  </div>
                  <p className="mb-3 text-sm font-medium text-white/70 sm:text-base">{item.title}</p>
                  <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
                    {item.subtitle}
                  </h1>
                  <div className="mt-5 max-w-xl rounded-2xl border border-white/15 bg-black/20 p-4 shadow-2xl backdrop-blur-md sm:mt-7 sm:p-6">
                    <p className="text-pretty text-sm font-light leading-relaxed text-white/85 sm:text-lg">
                      {item.description}
                    </p>
                  </div>
                  {index === chapters.length - 1 ? (
                    <a
                      href="https://wa.me/558398907010"
                      target="_blank"
                      rel="noreferrer"
                      className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.03] sm:mt-9 sm:px-8 sm:text-base"
                    >
                      Vamos conversar <ChevronRight size={20} aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => scrollToChapter(index + 1)}
                      className="group mt-7 inline-flex min-h-12 items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white sm:mt-9 sm:text-sm"
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-full border border-white/40 transition group-hover:bg-white group-hover:text-black">
                        <ChevronRight size={19} aria-hidden="true" />
                      </span>
                      Explorar sequência
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/80 py-2 pl-4 pr-2 shadow-2xl backdrop-blur-xl sm:bottom-7 sm:gap-4 sm:pl-6">
          <div className="min-w-0">
            <span className="block text-[9px] uppercase tracking-[0.2em] text-white/50 sm:text-[10px] sm:tracking-widest">
              Capítulo {chapter.id}
            </span>
            <span className="block max-w-[38vw] truncate text-xs font-bold text-white sm:min-w-[120px] sm:max-w-none">
              {chapter.title}
            </span>
          </div>
          <div className="relative grid h-10 w-10 shrink-0 place-items-center sm:h-12 sm:w-12">
            <svg className="-rotate-90" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="18" className="stroke-white/15" strokeWidth="2" fill="none" />
              <circle
                cx="24"
                cy="24"
                r="18"
                className="stroke-primary transition-[stroke-dashoffset] duration-150"
                strokeWidth="2"
                fill="none"
                strokeDasharray="113"
                strokeDashoffset={113 * (1 - progress)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <PlayCircle size={16} fill="white" className="text-black sm:h-[18px] sm:w-[18px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
