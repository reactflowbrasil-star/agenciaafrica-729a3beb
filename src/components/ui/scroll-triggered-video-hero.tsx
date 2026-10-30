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
  { id: "01", title: "Nossa essência", subtitle: "CRIATIVIDADE QUE MOVE NEGÓCIOS.", description: "A AFRICA conecta cultura, tecnologia e estratégia para transformar ideias ousadas em crescimento real para marcas." },
  { id: "02", title: "Tráfego pago", subtitle: "NÃO COMPRAMOS CLIQUES. CRIAMOS OPORTUNIDADES.", description: "Meta Ads, Google Ads e aquisição orientada por dados: campanhas de performance que atraem clientes e impulsionam negócios." },
  { id: "03", title: "Landing pages & desenvolvimento", subtitle: "EXPERIÊNCIAS DIGITAIS QUE CONVERTEM.", description: "Landing pages e produtos web com UX/UI, alta performance e otimização contínua para transformar visitas em conversões." },
  { id: "04", title: "Branding & design", subtitle: "MARCAS FORTES NÃO PASSAM DESPERCEBIDAS.", description: "Identidade visual, posicionamento e direção de arte para construir marcas memoráveis, consistentes e cheias de personalidade." },
  { id: "05", title: "Tecnologia & automação", subtitle: "O FUTURO NÃO ESPERA.", description: "Inteligência artificial, automações e integrações que simplificam processos e aplicam inovação ao dia a dia dos negócios." },
  { id: "06", title: "Resultados & conversão", subtitle: "SUA PRÓXIMA GRANDE IDEIA COMEÇA AQUI.", description: "Vamos conectar estratégia, criatividade e resultado para levar sua marca ao próximo nível." },
];

const heroStyles = [
  "@keyframes africa-hero-fade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }",
  "@keyframes africa-hero-title { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }",
  "@keyframes africa-nav-enter { from { opacity: 0; transform: translate(-50%, 100px); } to { opacity: 1; transform: translate(-50%, 0); } }",
  "@keyframes africa-nav-title { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }",
  "@keyframes africa-whatsapp-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(37,211,102,.45); } 50% { box-shadow: 0 0 0 12px rgba(37,211,102,0); } }",
  ".africa-whatsapp-float { animation: africa-whatsapp-pulse 2.8s ease-out infinite; }",
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

const DEFAULT_VIDEO_URLS = [
  "https://agenciaafrica.lovable.app/__l5e/assets-v1/a63ba6d8-d96e-49bb-8500-0eda4f7ef079/lion-forest-01.mp4",
  "https://videos.pexels.com/video-files/7710515/7710515-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/37516159/15894554_2560_1440_30fps.mp4",
  "https://videos.pexels.com/video-files/37515895/15894471_2560_1440_30fps.mp4",
  "https://videos.pexels.com/video-files/11528208/11528208-uhd_1440_2562_30fps.mp4",
  "https://videos.pexels.com/video-files/35884354/15219737_1440_2560_30fps.mp4",
] as const;
const DEFAULT_LOGO_URL = "https://agenciaafrica.lovable.app/__l5e/assets-v1/42641b7a-09e8-4bc3-996b-9634277af170/africa-logo.png";

export default function CinematicScrol({
  videoUrls,
  videoUrl,
  logoUrl = DEFAULT_LOGO_URL,
}: {
  videoUrls?: readonly string[];
  videoUrl?: string;
  logoUrl?: string;
} = {}) {
  const sceneVideoUrls = chapters.map((_, index) =>
    videoUrls?.[index] ?? (index === 0 ? videoUrl : undefined) ?? DEFAULT_VIDEO_URLS[index] ?? DEFAULT_VIDEO_URLS[0],
  );
  const containerRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const currentVideoIndexRef = useRef(0);
  const chapterContentRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [navIndex, setNavIndex] = useState(0);
  const [navTitleLeaving, setNavTitleLeaving] = useState(false);
  const progressCircleRef = useRef<SVGCircleElement | null>(null);
  const updateScrollRef = useRef<(() => void) | null>(null);
  const loadedVideosRef = useRef(new Set<number>());

  useEffect(() => {
    const section = containerRef.current;
    const scrollHost = section?.closest<HTMLElement>("[data-landing-scroll]")
      ?? document.scrollingElement as HTMLElement | null
      ?? document.documentElement;
    if (!section || !scrollHost) return;

    const isDocumentScroll = scrollHost === document.scrollingElement;
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const hostTop = isDocumentScroll ? 0 : scrollHost.getBoundingClientRect().top;
        const sectionTop = section.getBoundingClientRect().top - hostTop;
        const travel = Math.max(1, section.offsetHeight - scrollHost.clientHeight);
        const nextProgress = Math.max(0, Math.min(1, -sectionTop / travel));
        if (progressCircleRef.current) {
          progressCircleRef.current.style.strokeDashoffset = String(113 * (1 - nextProgress));
        }
        const position = nextProgress * (chapters.length - 1);
        chapterContentRefs.current.forEach((content, index) => {
          if (!content) return;
          const offset = Math.max(-1, Math.min(1, position - index));
          const scale = 1 - Math.abs(offset) * 0.018;
          content.style.transform =
            "translate3d(0, " + (-offset * 32).toFixed(2) + "px, 0) scale(" + scale.toFixed(4) + ")";
        });
        const nextIndex = Math.min(Math.floor(position), chapters.length - 1);
        const nextScene = Math.min(nextIndex + 1, chapters.length - 1);
        const blend = position - nextIndex;
        const nextVideo = videoRefs.current[nextScene];
        const blendReady = nextScene !== nextIndex && Boolean(nextVideo && nextVideo.readyState >= 2);
        const activeVideo = videoRefs.current[nextIndex];
        if (nextIndex > currentVideoIndexRef.current && activeVideo && activeVideo.readyState >= 2) {
          currentVideoIndexRef.current = nextIndex;
        }
        const heldScene = blendReady ? nextIndex : Math.min(nextIndex, currentVideoIndexRef.current);
        videoRefs.current.forEach((video, index) => {
          if (!video) return;
          const opacity = blendReady
            ? index === nextIndex ? 1 - blend : index === nextScene ? blend : 0
            : index === heldScene ? 1 : 0;
          video.style.opacity = String(opacity);
          const parallax = Math.max(-1, Math.min(1, position - index));
          video.style.transform =
            "translate3d(0, " + (-parallax * 3).toFixed(3) + "%, 0) scale(1.08)";
          if (index === heldScene || index === nextIndex || index === nextScene) {
            if (video.preload === "none" && !loadedVideosRef.current.has(index)) {
              loadedVideosRef.current.add(index);
              video.preload = "auto";
              video.load();
            }
            if (video.paused) void video.play().catch(() => {});
          } else if (!video.paused) {
            video.pause();
          }
        });
        if (activeIndexRef.current !== nextIndex) {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
        }
      });
    };

    updateScrollRef.current = update;
    scrollHost.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      updateScrollRef.current = null;
      scrollHost.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => () => {
    videoRefs.current.forEach((video) => video?.pause());
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
    const scrollHost = section?.closest<HTMLElement>("[data-landing-scroll]")
      ?? document.scrollingElement as HTMLElement | null
      ?? document.documentElement;
    if (!section || !scrollHost) return;
    const travel = Math.max(0, section.offsetHeight - scrollHost.clientHeight);
    const hostTop = scrollHost === document.scrollingElement ? 0 : scrollHost.getBoundingClientRect().top;
    const sectionScrollTop = section.getBoundingClientRect().top - hostTop + scrollHost.scrollTop;
    const destination = sectionScrollTop + travel * index / (chapters.length - 1);
    scrollHost.scrollTo({ top: destination, behavior: "smooth" });
  };

  const chapter = chapters[navIndex];

  return (
    <section
      ref={containerRef}
      className="africa-scroll-story relative h-[300vh] w-full max-w-full overflow-x-clip supports-[height:100svh]:h-[300svh]"
    >
      <style>{heroStyles}</style>
      <div className="sticky top-0 h-screen w-full max-w-full overflow-hidden supports-[height:100svh]:h-svh">
        <div className="absolute inset-0 isolate overflow-hidden bg-[radial-gradient(ellipse_at_62%_38%,#33452b_0%,#182016_48%,#080a08_100%)]">
          {sceneVideoUrls.map((src, index) => {
            const opacity = index === 0 ? 1 : 0;

            return (
              <video
                key={src}
                ref={(element) => { videoRefs.current[index] = element; }}
                src={src}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  opacity,
                  transform: "translate3d(0,0,0)",
                  backfaceVisibility: "hidden",
                  transition: "opacity 450ms ease-in-out",
                  willChange: "opacity",
                }}
                muted
                loop
                playsInline
                autoPlay={index === 0}
                preload={index === 0 ? "auto" : "none"}
                onCanPlay={() => {
                  const video = videoRefs.current[index];
                  loadedVideosRef.current.add(index);
                  if (index === activeIndexRef.current || index === activeIndexRef.current + 1) {
                    void video?.play().catch(() => {});
                    updateScrollRef.current?.();
                  }
                }}
                onError={() => {
                  const video = videoRefs.current[index];
                  if (video) { video.style.opacity = "0"; video.style.visibility = "hidden"; }
                }}
                aria-label="Vídeo cinematográfico de fundo"
                tabIndex={-1}
              />
            );
          })}
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,.56) 0%, rgba(0,0,0,.24) 55%, rgba(0,0,0,.06) 100%), linear-gradient(0deg, rgba(0,0,0,.24), transparent 55%)",
          }}
        />
        <FilmGrain />

        <header className="absolute inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-14">
          <img src={logoUrl} alt="AFRICA" className="h-auto w-[min(38vw,180px)] object-contain sm:w-[190px]" />
          <a
            href="https://wa.me/558398907010?text=Ol%C3%A1%21%20Conheci%20a%20Ag%C3%AAncia%20AFRICA%20pelo%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto."
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
                <div ref={(element) => { chapterContentRefs.current[index] = element; }} key={item.id + "-" + activeIndex} className="pointer-events-auto w-full min-w-0 max-w-4xl [overflow-wrap:anywhere]" style={{ willChange: "transform" }}>
                  <div className="africa-copy-fade mb-5 flex items-center gap-3 sm:mb-7 sm:gap-4">
                    <div className="h-0.5 w-8 bg-primary sm:w-12" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary sm:text-xs sm:tracking-[0.3em]">
                      Capítulo {item.id} · {item.title}
                    </span>
                  </div>
                  <div className="mb-6 overflow-hidden py-2">
                    <h1 className="africa-title-reveal max-w-4xl text-balance text-[clamp(2rem,9vw,4.5rem)] font-black leading-[1.02] tracking-[-0.045em] break-words text-white sm:text-6xl md:text-7xl lg:text-8xl">
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
                      href="https://wa.me/558398907010?text=Ol%C3%A1%21%20Conheci%20a%20Ag%C3%AAncia%20AFRICA%20pelo%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto."
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

        <a href="https://wa.me/558398907010?text=Ol%C3%A1%21%20Conheci%20a%20Ag%C3%AAncia%20AFRICA%20pelo%20site%20e%20gostaria%20de%20conversar%20sobre%20um%20projeto." target="_blank" rel="noreferrer" aria-label="Fale com a AFRICA pelo WhatsApp" className="africa-whatsapp-float fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-4 z-[60] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl ring-4 ring-white/15 transition hover:scale-110 active:scale-95 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16">
          <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current sm:h-8 sm:w-8" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.08 0C5.5 0 .15 5.34.15 11.92c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.9 11.9 0 0 0 5.79 1.47h.01C18.66 23.82 24 18.48 24 11.9c0-3.18-1.24-6.17-3.48-8.42ZM12.08 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.64-.23-.37a9.85 9.85 0 0 1-1.52-5.26c0-5.46 4.45-9.9 9.9-9.9a9.83 9.83 0 0 1 7 2.9 9.84 9.84 0 0 1 2.9 7c0 5.45-4.44 9.88-9.91 9.88Zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.08-.12-.27-.2-.57-.35Z"/></svg>
        </a>
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
