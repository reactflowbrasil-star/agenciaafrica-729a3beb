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
  "@keyframes africa-hero-fade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }",
  "@keyframes africa-hero-title { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }",
  "@keyframes africa-nav-enter { from { opacity: 0; transform: translate(-50%, 100px); } to { opacity: 1; transform: translate(-50%, 0); } }",
  "@keyframes africa-nav-title { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }",
  ".africa-copy-fade { opacity: 0; animation: africa-hero-fade 800ms ease-out 400ms both; }",
  ".africa-delay-500 { animation-delay: 500ms; } .africa-delay-600 { animation-delay: 600ms; } .africa-delay-700 { animation-delay: 700ms; }",
  ".africa-title-reveal { display: block; opacity: 0; animation: africa-hero-title 800ms cubic-bezier(.16,1,.3,1) 500ms both; }",
  ".africa-nav-enter { animation: africa-nav-enter 600ms ease-out 500ms both; }",
  ".africa-nav-title { animation: africa-nav-title 300ms ease-out both; }",
  "@media (prefers-reduced-motion: reduce) { .africa-copy-fade, .africa-title-reveal, .africa-nav-enter, .africa-nav-title { opacity: 1; animation: none; } }",
].join("\n");

function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,.35) .5px, transparent .5px)",
        backgroundSize: "4px 4px",
      }}
    />
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
  const [navIndex, setNavIndex] = useState(0);
  const [navTitleLeaving, setNavTitleLeaving] = useState(false);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);

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
        if (progressCircleRef.current) {
          progressCircleRef.current.style.strokeDashoffset = String(113 * (1 - nextProgress));
        }
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

  useEffect(() => {
    if (activeIndex === navIndex) return;
    setNavTitleLeaving(true);
    const timer = window.setTimeout(() => {
      setNavIndex(activeIndex);
      setNavTitleLeaving(false);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [activeIndex, navIndex]);

  const scrollToChapter = (index: number) => {
    const section = containerRef.current;
    const scrollHost = section?.closest<HTMLElement>("[data-landing-scroll]");
    if (!section || !scrollHost) return;
    const travel = Math.max(0, section.offsetHeight - scrollHost.clientHeight);
    const destination = section.offsetTop + travel * index / (chapters.length - 1);
    scrollHost.scrollTo({ top: destination, behavior: "smooth" });
  };

  const chapter = chapters[navIndex];

  return (
    <section
      ref={containerRef}
      className="africa-scroll-story relative h-[300vh] w-full supports-[height:100svh]:h-[300svh]"
    >
      <style>{heroStyles}</style>
      <div className="sticky top-0 h-screen w-full overflow-hidden supports-[height:100svh]:h-svh">
        <video
          src={videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Leões caminhando pela floresta"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
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
                  "absolute inset-0 flex items-center px-5 pb-20 pt-24 transition-opacity duration-[1200ms] ease-in-out sm:px-10 lg:px-24",
                  active ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <div key={item.id + "-" + activeIndex} className="pointer-events-auto w-full max-w-4xl">
                  <div className="africa-copy-fade mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">
                    <div className="h-0.5 w-8 bg-primary sm:w-12" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary sm:text-xs sm:tracking-[0.3em]">
                      Capítulo {item.id} · {item.title}
                    </span>
                  </div>
                  <div className="mb-6 overflow-hidden py-2">
                    <h1 className="africa-title-reveal max-w-4xl text-balance text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl md:text-7xl lg:text-8xl">
                      {item.subtitle}
                    </h1>
                  </div>
                  <div className="africa-copy-fade africa-delay-600 mt-5 max-w-xl rounded-2xl border border-white/15 bg-black/20 p-4 shadow-2xl backdrop-blur-md sm:mt-7 sm:p-6">
                    <p className="text-pretty text-sm font-light leading-relaxed text-white/85 sm:text-lg">
                      {item.description}
                    </p>
                  </div>
                  {index === chapters.length - 1 ? (
                    <a
                      href="https://wa.me/558398907010"
                      target="_blank"
                      rel="noreferrer"
                      className="africa-copy-fade africa-delay-700 mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-105 hover:translate-x-2.5 active:scale-95 sm:mt-9 sm:px-8 sm:text-base"
                    >
                      Vamos conversar <ChevronRight size={20} aria-hidden="true" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => scrollToChapter(index + 1)}
                      className="africa-copy-fade africa-delay-700 group mt-7 inline-flex min-h-12 items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:scale-105 hover:translate-x-2.5 active:scale-95 sm:mt-9 sm:text-sm"
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

        <div className="africa-nav-enter fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/80 py-2 pl-4 pr-2 shadow-2xl backdrop-blur-xl sm:bottom-7 sm:gap-4 sm:pl-6">
          <div className="min-w-0">
            <span className="block text-[9px] uppercase tracking-[0.2em] text-white/50 sm:text-[10px] sm:tracking-widest">
              Capítulo {chapter.id}
            </span>
            <span key={navIndex} className={cn("africa-nav-title block max-w-[38vw] truncate text-xs font-bold text-white transition-all duration-300 sm:min-w-[120px] sm:max-w-none", navTitleLeaving ? "-translate-y-2.5 opacity-0" : "translate-y-0 opacity-100")}>
              {chapter.title}
            </span>
          </div>
          <div className="relative grid h-10 w-10 shrink-0 place-items-center sm:h-12 sm:w-12">
            <svg className="-rotate-90" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="18" className="stroke-white/15" strokeWidth="2" fill="none" />
              <circle
                ref={progressCircleRef}
                cx="24"
                cy="24"
                r="18"
                className="stroke-primary"
                strokeWidth="2"
                fill="none"
                strokeDasharray="113"
                strokeDashoffset="113"
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
