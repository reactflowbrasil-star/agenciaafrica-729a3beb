import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { getNarrationFrame } from "@/lib/narration";
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import OrbAnswerInput from "@/components/ui/ai-thinking-orb-and-input";
const CinematicScrol = lazy(() => import("@/components/ui/scroll-triggered-video-hero"));
import { DrawLineText } from "@/components/ui/draw-line-text";
const logo = "https://agenciaafrica.lovable.app/__l5e/assets-v1/42641b7a-09e8-4bc3-996b-9634277af170/africa-logo.png";
const backgroundTrack = "https://sexflow.com.br/sexflow/trilha.mp3";
const narrationUrl = "https://agenciaafrica.lovable.app/__l5e/assets-v1/cf54ad2d-7ecb-4d05-b54e-6c76cc9b7c4c/africa-narracao.mp3";
const lionForestUrl = "https://agenciaafrica.lovable.app/__l5e/assets-v1/a63ba6d8-d96e-49bb-8500-0eda4f7ef079/lion-forest-01.mp4";
const introVideoUrls = [lionForestUrl] as const;
const heroVideoUrls = [
  lionForestUrl,
  "https://videos.pexels.com/video-files/7710515/7710515-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/37516159/15894554_2560_1440_30fps.mp4",
  "https://videos.pexels.com/video-files/37515895/15894471_2560_1440_30fps.mp4",
  "https://videos.pexels.com/video-files/11528208/11528208-uhd_1440_2562_30fps.mp4",
  "https://videos.pexels.com/video-files/35884354/15219737_1440_2560_30fps.mp4",
] as const;

function SiteVideoBackdrop({ urls, active }: { urls: readonly string[]; active: boolean }) {
  const videos = useRef<Array<HTMLVideoElement | null>>([]);
  const current = useRef(0);
  const incoming = useRef<number | null>(null);
  const pending = useRef<number | null>(null);
  const beginRef = useRef<(index: number) => void>(() => {});
  const [currentLayer, setCurrentLayer] = useState(0);
  const [incomingLayer, setIncomingLayer] = useState<number | null>(null);

  useEffect(() => {
    if (!active) {
      videos.current.forEach((video) => video?.pause());
      return;
    }

    if (urls.length < 2) {
      const first = videos.current[0];
      if (first?.paused) void first.play().catch(() => {});
      return () => first?.pause();
    }

    let transitionTimer = 0;
    let cycle: number | undefined;
    const begin = (index: number) => {
      if (incoming.current !== null || index === current.current) return;
      const next = videos.current[index];
      if (!next) return;
      pending.current = index;
      if (next.readyState < 2) {
        next.preload = "auto";
        next.load();
        return;
      }

      pending.current = null;
      void next.play().catch(() => {});
      incoming.current = index;
      setIncomingLayer(index);
      transitionTimer = window.setTimeout(() => {
        const previous = current.current;
        current.current = index;
        setCurrentLayer(index);
        incoming.current = null;
        setIncomingLayer(null);
        videos.current[previous]?.pause();
      }, 1250);
    };
    beginRef.current = begin;

    const first = videos.current[current.current];
    if (first && first.paused) void first.play().catch(() => {});
    cycle = window.setInterval(() => begin((current.current + 1) % urls.length), 8000);

    return () => {
      if (cycle !== undefined) window.clearInterval(cycle);
      window.clearTimeout(transitionTimer);
      beginRef.current = () => {};
      pending.current = null;
      incoming.current = null;
      videos.current.forEach((video) => video?.pause());
    };
  }, [active, urls.length]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 isolate overflow-hidden bg-[radial-gradient(ellipse_at_62%_38%,#33452b_0%,#182016_48%,#080a08_100%)]">
      {urls.map((src, index) => (
        <video
          key={src}
          ref={(element) => { videos.current[index] = element; }}
          src={src}
          muted
          loop
          playsInline
          autoPlay={active && index === 0}
          preload={index === 0 ? "auto" : "none"}
          onCanPlay={() => {
            if (index === pending.current) beginRef.current(index);
            else if (active && index === current.current) void videos.current[index]?.play().catch(() => {});
          }}
          onError={() => {
            const video = videos.current[index];
            if (video) video.style.visibility = "hidden";
            if (pending.current === index) pending.current = null;
          }}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1250ms] ease-in-out motion-reduce:transition-none"
          style={{
            opacity: index === incomingLayer || (incomingLayer === null && index === currentLayer) ? 1 : 0,
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden",
          }}
        />
      ))}
    </div>
  );
}

const PARTNER_LOGOS = [
  { src: "/partner-logos/google_ads.png", name: "Google Ads" },
  { src: "/partner-logos/meta.png", name: "Meta" },
  { src: "/partner-logos/google_partner.png", name: "Google Partner" },
  { src: "/partner-logos/youtube.png", name: "YouTube" },
  { src: "/partner-logos/google_analytics.png", name: "Google Analytics" },
  { src: "/partner-logos/google_tag_manager.png", name: "Google Tag Manager" },
  { src: "/partner-logos/google_workspace.png", name: "Google Workspace" },
  { src: "/partner-logos/looker_studio.png", name: "Looker Studio" },
  { src: "/partner-logos/tiktok.png", name: "TikTok" },
  { src: "/partner-logos/rd_station.png", name: "RD Station" },
  { src: "/partner-logos/hubspot.png", name: "HubSpot" },
] as const;

type VoiceRecognitionEvent = {
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};
type VoiceRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: VoiceRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type VoiceRecognitionConstructor = new () => VoiceRecognition;
type WindowWithVoiceRecognition = Window & {
  SpeechRecognition?: VoiceRecognitionConstructor;
  webkitSpeechRecognition?: VoiceRecognitionConstructor;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Briefing AFRICA — Marketing e Tráfego Pago" },
      { name: "description", content: "Responda o briefing da AFRICA, agência de marketing e tráfego pago, uma pergunta por vez." },
      { property: "og:title", content: "Briefing AFRICA — Marketing e Tráfego Pago" },
      { property: "og:description", content: "Conte sobre seu negócio e seus objetivos para a AFRICA montar sua estratégia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Q = { id: string; q: string; hint?: string; options?: string[]; long?: boolean; type?: string };
type Phase = "start" | "narrating" | "logo" | "briefing";

// The soundtrack sits low under the voice-over, then returns to full level.
const MUSIC_DUCKED = 0.25;
const MUSIC_FULL = 0.7;

/* Slides an audio element's volume so level changes are never abrupt. */
function rampVolume(audio: HTMLAudioElement, to: number, seconds: number) {
  const from = audio.volume;
  const beganAt = performance.now();
  const advance = () => {
    const k = Math.min(1, (performance.now() - beganAt) / (seconds * 1000));
    audio.volume = from + (to - from) * k;
    if (k < 1) requestAnimationFrame(advance);
  };
  advance();
}

const QUESTIONS: Q[] = [
  { id: "nome", q: "Qual é o seu **nome**?", hint: "Vamos começar pelo básico." },
  { id: "empresa", q: "Qual o nome da sua **empresa** ou marca?" },
  { id: "contato", q: "Qual seu **WhatsApp** ou e-mail?", type: "text" },
  { id: "segmento", q: "Em qual **segmento** você atua?", hint: "Ex.: moda, saúde, educação, imobiliário..." },
  { id: "oferta", q: "O que você **vende**? Descreva seu produto ou serviço principal.", long: true },
  { id: "publico", q: "Quem é o seu **cliente ideal**?", hint: "Idade, região, interesses, dores.", long: true },
  { id: "objetivo", q: "Qual o principal **objetivo** da campanha?", options: ["Gerar leads", "Vender online", "Reconhecimento de marca", "Mais seguidores", "Atendimento no WhatsApp"] },
  { id: "canais", q: "Em quais **canais** quer anunciar?", options: ["Meta (Instagram/Facebook)", "Google Ads", "TikTok Ads", "YouTube", "LinkedIn", "Ainda não sei"] },
  { id: "historico", q: "Você já investiu em **tráfego pago** antes?", options: ["Sim, com agência", "Sim, por conta própria", "Nunca investi"] },
  { id: "verba", q: "Qual a **verba mensal** prevista para anúncios?", options: ["Até R$ 1.000", "R$ 1.000 a R$ 3.000", "R$ 3.000 a R$ 10.000", "Acima de R$ 10.000"] },
  { id: "concorrentes", q: "Quem são seus principais **concorrentes**?", long: true },
  { id: "diferencial", q: "O que faz sua marca ser **única**?", long: true },
  { id: "extra", q: "Algo mais que **devemos saber**?", hint: "Prazos, materiais, expectativas.", long: true },
];

const QUESTION_AUDIO_URLS = QUESTIONS.map((_, index) => `/audio/questions/q${String(index + 1).padStart(2, "0")}.mp3`);
const COMPLETION_AUDIO_URL = "/audio/questions/completion.mp3";

function Index() {
  const [step, setStep] = useState(-2);
  const [phase, setPhase] = useState<Phase>("start");
  const [introFading, setIntroFading] = useState(false);
  const [introLogoVisible, setIntroLogoVisible] = useState(false);
  const revealIntroLogo = useCallback(() => setIntroLogoVisible(true), []);
  const [leaving, setLeaving] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const voiceModeRef = useRef(false);
  const stepRef = useRef(step);
  const changingStepRef = useRef(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [narrationProgress, setNarrationProgress] = useState(0);
  const [landingVisible, setLandingVisible] = useState(false);
  const [landingFadeIn, setLandingFadeIn] = useState(false);
  const landingTimerRef = useRef<number | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement>(null);
  const narrationRef = useRef<HTMLAudioElement>(null);
  const questionNarrationRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const showIntro = phase !== "briefing";
  const revealLanding = () => {
    setLandingVisible(true);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setLandingFadeIn(true)));
  };

  // One tap on "Iniciar" starts both soundtracks together: the looping
  // background track and the voice-over. Browsers only allow audible playback
  // from inside a gesture, so both play() calls live in this handler. The track
  // stays ducked under the narration and comes back up once the voice ends.
  const beginIntro = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    const music = musicRef.current;
    if (music) {
      music.volume = MUSIC_DUCKED;
      music.play()
        .then(() => setMusicPlaying(true))
        .catch(() => setMusicPlaying(false));
    }
    narrationRef.current?.play().catch(() => {});
    setPhase("narrating");
  };

  useEffect(() => {
    if (phase !== "logo") return;
    setIntroLogoVisible(false);
    const fadeTimer = window.setTimeout(() => setIntroFading(true), 9500);
    const finishTimer = window.setTimeout(() => {
      const music = musicRef.current;
      if (music) rampVolume(music, MUSIC_FULL, 2.5);
      setPhase("briefing");
      setStep(0);
    }, 10500);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [phase]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const voiceRecognitionRef = useRef<VoiceRecognition | null>(null);
  const voiceBaseValueRef = useRef("");
  const voiceTranscriptRef = useRef("");
  const done = step >= QUESTIONS.length;
  useEffect(() => {
    if (!done || phase !== "briefing") return;
    const timer = window.setTimeout(() => {
      landingTimerRef.current = null;
      revealLanding();
    }, 2000);
    landingTimerRef.current = timer;
    return () => {
      window.clearTimeout(timer);
      if (landingTimerRef.current === timer) landingTimerRef.current = null;
    };
  }, [done, phase]);
  stepRef.current = step;
  const cur = QUESTIONS[step];

  const go = (next: number) => {
    changingStepRef.current = true;
    voiceModeRef.current = false;
    voiceRecognitionRef.current?.stop();
    setLeaving(true);
    setTimeout(() => {
      setStep(next);
      setValue(QUESTIONS[next] ? answers[QUESTIONS[next].id] ?? "" : "");
      voiceBaseValueRef.current = QUESTIONS[next] ? answers[QUESTIONS[next].id] ?? "" : "";
      changingStepRef.current = false;
      setLeaving(false);
    }, 450);
  };

  const submit = (v = value) => {
    if (!cur || !v.trim()) return;
    voiceModeRef.current = false;
    voiceRecognitionRef.current?.stop();
    setAnswers((a) => ({ ...a, [cur.id]: v.trim() }));
    go(step + 1);
  };

  useEffect(() => {
    return () => {
      voiceModeRef.current = false;
      voiceRecognitionRef.current?.stop();
      if (landingTimerRef.current !== null) window.clearTimeout(landingTimerRef.current);
    };
  }, []);

  const toggleBackgroundMusic = async () => {
    const audio = musicRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  };

  const stopVoiceRecognition = () => {
    voiceModeRef.current = false;
    setVoiceMode(false);
    const recognition = voiceRecognitionRef.current;
    if (recognition) {
      setVoiceStatus("Finalizando sua resposta…");
      recognition.stop();
    } else {
      setIsListening(false);
    }
  };

  const startVoiceRecognition = () => {
    if (voiceRecognitionRef.current || changingStepRef.current) return;
    const browserWindow = window as WindowWithVoiceRecognition;
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      voiceModeRef.current = false;
      setVoiceMode(false);
      setVoiceStatus("Este navegador não oferece ditado ao vivo. Use o Chrome ou digite sua resposta.");
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = true;
      const question = QUESTIONS[stepRef.current];
      voiceBaseValueRef.current = question?.options ? "" : value.trim();
      voiceTranscriptRef.current = "";
      recognition.onresult = (event) => {
        const segments: string[] = [];
        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i]?.[0]?.transcript?.trim();
          if (transcript) segments.push(transcript);
        }
        voiceTranscriptRef.current = segments.join(" ").trim();
        if (voiceTranscriptRef.current) setVoiceStatus("Solte para preencher a resposta.");
      };
      recognition.onerror = () => {
        voiceModeRef.current = false;
        setVoiceMode(false);
        setIsListening(false);
        setVoiceStatus("Não foi possível reconhecer a fala. Segure para tentar novamente.");
      };
      recognition.onend = () => {
        voiceRecognitionRef.current = null;
        setIsListening(false);
        voiceModeRef.current = false;
        setVoiceMode(false);

        const transcript = [voiceBaseValueRef.current, voiceTranscriptRef.current]
          .filter(Boolean)
          .join(" ")
          .trim();
        const activeQuestion = QUESTIONS[stepRef.current];
        if (transcript && activeQuestion) {
          if (activeQuestion.options) {
            setAnswers((answers) => ({ ...answers, [activeQuestion.id]: transcript }));
          } else {
            setValue(transcript);
          }
          setVoiceStatus("Resposta preenchida. Revise antes de continuar.");
        } else if (!changingStepRef.current) {
          setVoiceStatus("Nenhuma fala reconhecida. Segure para tentar novamente.");
        }
      };

      voiceRecognitionRef.current = recognition;
      recognition.start();
      voiceModeRef.current = true;
      setVoiceMode(true);
      setIsListening(true);
      setVoiceStatus("Ouvindo… solte para preencher a resposta.");
    } catch {
      voiceRecognitionRef.current = null;
      voiceModeRef.current = false;
      setVoiceMode(false);
      setIsListening(false);
      setVoiceStatus("Não foi possível iniciar o microfone. Confira a permissão do navegador.");
    }
  };

  const replayQuestionNarration = () => {
    const audio = questionNarrationRef.current;
    const source = done ? COMPLETION_AUDIO_URL : cur ? QUESTION_AUDIO_URLS[step] : null;
    if (!audio || !source) return;

    voiceModeRef.current = false;
    setVoiceMode(false);
    voiceRecognitionRef.current?.stop();
    voiceRecognitionRef.current = null;
    setIsListening(false);
    const music = musicRef.current;
    if (music && !music.paused) rampVolume(music, MUSIC_DUCKED, 0.6);
    audio.src = source ?? "";
    setNarrationProgress(0);
    audio.currentTime = 0;
    audio.play().catch(() => {
      if (music && !music.paused) rampVolume(music, MUSIC_FULL, 0.6);
    });
  };


  useEffect(() => {
    const audio = questionNarrationRef.current;
    if (!audio) return;

    const music = musicRef.current;
    if (phase !== "briefing" || (!cur && !done)) {
      audio.pause();
      audio.removeAttribute("src");
      if (music && !music.paused) rampVolume(music, MUSIC_FULL, 0.8);
      return;
    }

    const source = done ? COMPLETION_AUDIO_URL : QUESTION_AUDIO_URLS[step];
    // The heading is typed one character at a time, so the audio clock only has
    // to publish a new value when the next character actually becomes due.
    // That keeps the reveal smooth without re-rendering the page every frame.
    const headingChars = Math.max(1, Array.from(cur ? cur.q.split("**").join("") : "").length);
    let raf = 0;
    let revealed = -1;
    const syncTypewriterToAudio = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
      const next = Math.min(1, (audio.currentTime / audio.duration) * 1.22);
      const characters = Math.floor(next * headingChars);
      if (next < 1 && characters === revealed) return;
      revealed = characters;
      setNarrationProgress(next);
    };
    const tick = () => {
      syncTypewriterToAudio();
      raf = window.requestAnimationFrame(tick);
    };
    const onEnded = () => {
      setNarrationProgress(1);
      if (music && !music.paused) rampVolume(music, MUSIC_FULL, 1);
    };

    setNarrationProgress(0);
    audio.onended = onEnded;
    audio.src = source ?? "";
    audio.currentTime = 0;
    syncTypewriterToAudio();
    if (music && !music.paused) rampVolume(music, MUSIC_DUCKED, 0.6);
    // If the voice-over cannot play at all (blocked, missing file), the heading
    // must still appear, so the full question is shown after a short grace time.
    const revealAnyway = window.setTimeout(() => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0 || audio.paused) setNarrationProgress(1);
    }, 1500);
    audio.play().catch(() => {
      setNarrationProgress(1);
      if (music && !music.paused) rampVolume(music, MUSIC_FULL, 0.6);
    });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(revealAnyway);
      audio.pause();
      audio.onended = null;
    };
  }, [phase, step]);

  useEffect(() => {
    const el = inputRef.current;
    if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  }, [value, step]);

  useEffect(() => {
    if (step !== -1 || showIntro) return;
    const h = (e: KeyboardEvent) => e.key === "Enter" && go(0);
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const progress = done ? 100 : Math.max(0, (step / QUESTIONS.length) * 100);

  return (
    <main className={`relative min-h-dvh w-full bg-background font-sans text-foreground ${landingVisible ? "overflow-visible" : "overflow-hidden"}`}>
      <style>{`@keyframes africaTypewriterCaret { 50% { opacity: 0; } } .africa-typewriter-caret { display: inline-block; width: .065em; height: .82em; margin-left: .08em; vertical-align: -.04em; background: currentColor; animation: africaTypewriterCaret .85s steps(2, start) infinite; } @media (prefers-reduced-motion: reduce) { .africa-typewriter-caret { animation: none; } }`}</style>
      <SiteVideoBackdrop urls={introVideoUrls} active={phase === "narrating" || phase === "logo"} />
      <audio ref={musicRef} src={backgroundTrack} loop preload="none" onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} />
      <audio ref={narrationRef} src={narrationUrl} preload="auto" />
      <audio ref={questionNarrationRef} preload="auto" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/12 to-background/20" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 55% at 50% 50%, rgba(0,0,0,0.26), transparent 72%)" }} />
      {phase === "narrating" && <Narration audioRef={narrationRef} onDone={() => setPhase("logo")} />}
      {phase === "logo" && (
        <div aria-hidden="true" className={`fixed inset-0 z-50 flex items-center justify-center bg-black/10 transition-opacity duration-1000 ease-in-out ${introFading ? "opacity-0" : "opacity-100"}`}>
          <div className="relative grid w-[min(88vw,820px)] place-items-center">
            <DrawLineText
              role="img"
              aria-label="AFRICA"
              text="AFRICA"
              className={`font-display font-semibold transition-opacity duration-700 ease-in-out ${introLogoVisible ? "opacity-0" : "opacity-100"}`}
              fontSize={160}
              strokeWidth={1.7}
              letterSpacing={4}
              wordSpacing={18}
              color="#ffffff"
              onDrawComplete={revealIntroLogo}
            />
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              fetchPriority="high"
              decoding="async"
              className={`absolute left-1/2 top-1/2 max-h-[30svh] w-[min(72vw,560px)] -translate-x-1/2 -translate-y-1/2 object-contain transition-opacity duration-1000 ease-in-out ${introLogoVisible ? "opacity-100" : "opacity-0"}`}
            />
          </div>
        </div>
      )}
      {phase === "start" && (
        <div className={`fixed inset-0 z-[70] flex flex-col items-center justify-center gap-8 bg-background/65 px-5 text-center transition-opacity duration-700 sm:gap-10 ${introFading ? "pointer-events-none opacity-0" : "opacity-100"}`}>
          <div className="w-[min(72vw,420px)]"><DrawLineText role="img" aria-label="AFRICA" text="AFRICA" className="font-display font-semibold" fontSize={112} strokeWidth={1.5} letterSpacing={3} wordSpacing={14} color="#ffffff" /></div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <Button
              type="button"
              onClick={beginIntro}
              variant="ghost"
              className="h-12 gap-3 rounded-none border-b border-foreground/35 px-1 font-display text-base font-light text-foreground hover:bg-transparent hover:text-primary"
            >
              Iniciar
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
            </Button>
            <Button
              type="button"
              onClick={() => { setIntroFading(true); revealLanding(); }}
              variant="ghost"
              className="h-12 rounded-none border-b border-foreground/35 px-1 font-display text-sm font-light text-foreground/80 hover:bg-transparent hover:text-primary sm:text-base"
            >
              Pular briefing <span aria-hidden="true" className="px-1 text-foreground/55">→</span><span className="text-foreground/55">ir para o site</span>
            </Button>
          </div>
        </div>
      )}
      {phase !== "start" && showIntro && !musicPlaying && (
        <button
          type="button"
          onClick={toggleBackgroundMusic}
          aria-label="Ativar trilha de fundo"
          className="fixed right-6 top-6 z-[60] inline-flex items-center gap-2 rounded-full border border-white/40 bg-black/35 px-4 py-2.5 text-sm text-white backdrop-blur transition hover:bg-black/55"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
          Ativar áudio
        </button>
      )}

      <div className="absolute inset-x-0 top-0 z-20 h-1 bg-foreground/10">
        <div className="h-full bg-primary transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <header className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-6 transition-opacity duration-500 sm:px-10 ${showIntro ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <img src={logo} alt="AFRICA" fetchPriority="high" decoding="async" className="h-[90px] w-auto sm:h-[108px]" />
        <div className="flex items-center gap-4">
          {step >= 0 && !done && (
            <span className="font-display text-sm font-light tracking-[0.25em] text-muted-foreground">
              {String(step + 1).padStart(2, "0")} / {QUESTIONS.length}
            </span>
          )}
          <button type="button" onClick={toggleBackgroundMusic} aria-label={musicPlaying ? "Pausar trilha de fundo" : "Reproduzir trilha de fundo"} title={musicPlaying ? "Pausar trilha" : "Reproduzir trilha"} className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-background/30 text-foreground backdrop-blur transition hover:border-primary hover:text-primary">
            {musicPlaying ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M7 5h4v14H7zm6 0h4v14h-4z" /></svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        </div>
      </header>

      <section key={step} className={`relative z-10 flex min-h-dvh items-center px-6 py-28 sm:px-16 ${leaving ? "step-out" : "step-in"}`}>
        <div className="mx-auto w-full max-w-3xl">
          {step === -1 && (
            <div>
              <p className="mb-4 font-display text-sm font-light uppercase tracking-[0.3em] text-primary">Briefing</p>
              <h1 className="text-balance font-display text-4xl font-extralight leading-[1.06] tracking-[-0.03em] sm:text-7xl">
                <Em text="Vamos construir sua **próxima campanha**." />
              </h1>
              <p className="mt-6 max-w-xl font-light text-lg text-muted-foreground">
                {QUESTIONS.length} perguntas rápidas. Leva cerca de 3 minutos.
              </p>
              <button onClick={() => go(0)} className="mt-10 rounded-full bg-primary px-8 py-4 font-display font-bold text-primary-foreground transition hover:scale-105">
                Começar →
              </button>
              <p className="mt-4 hidden font-light text-sm text-muted-foreground sm:block">ou pressione <b className="font-bold">Enter ↵</b></p>
            </div>
          )}

          {cur && (
            <div>
              <div className="mb-3 flex items-center gap-3">
                <p className="font-display text-sm font-light text-primary">{step + 1} →</p>
                <button
                  type="button"
                  onClick={replayQuestionNarration}
                  aria-label="Ouvir a pergunta novamente"
                  title="Ouvir a pergunta novamente"
                  className="grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-background/30 text-foreground/80 backdrop-blur transition hover:border-primary hover:text-primary"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zm-2.5-9v2.06a7 7 0 0 1 0 13.88V21a9 9 0 0 0 0-18z" /></svg>
                </button>
              </div>
              <h2 className="text-balance font-display text-4xl font-extralight leading-[1.04] tracking-[-0.025em] sm:text-7xl"><Em text={cur.q} progress={narrationProgress} /></h2>
              {cur.hint && <p className="mt-3 font-light text-lg text-muted-foreground">{cur.hint}</p>}

              {cur.options ? (
                <>
                <div className="mt-10 grid gap-3 sm:grid-cols-2">
                  {cur.options.map((o, i) => (
                    <button
                      key={o}
                      onClick={() => submit(o)}
                      className={`step-in flex items-center gap-4 rounded-xl border border-border bg-background/40 px-5 py-4 text-left backdrop-blur transition hover:border-primary hover:bg-primary/10 ${answers[cur.id] === o ? "border-primary" : ""}`}
                      style={{ animationDelay: `${150 + i * 60}ms` }}
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-primary/60 font-display text-xs font-bold text-primary">{String.fromCharCode(65 + i)}</span>
                      <span className="min-w-0 font-light">{o}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="button" onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); startVoiceRecognition(); }} onPointerUp={stopVoiceRecognition} onPointerCancel={stopVoiceRecognition} onKeyDown={(event) => { if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); startVoiceRecognition(); } }} onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); stopVoiceRecognition(); } }} aria-label={isListening ? "Ouvindo, solte para preencher" : "Segure para falar"} title={isListening ? "Ouvindo, solte para preencher" : "Segure para falar"} className={`inline-flex items-center gap-2 touch-none select-none rounded-full border px-4 py-3 font-display text-sm transition ${voiceMode ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                    <span aria-hidden="true">🎙</span><span>{isListening ? "Ouvindo… solte para preencher" : "Segure para falar"}</span>
                  </button>
                  <span className="font-light text-sm text-muted-foreground" aria-live="polite">{answers[cur.id] || "Escolha uma opção ou segure para falar."}</span>
                </div>
                </>
              ) : (
                <div className="mt-10">
                  <OrbAnswerInput key={cur.id} value={value} onChange={setValue} onSubmit={(t) => submit(t)} inputRef={inputRef} />
                  <div className="mt-6 flex flex-wrap items-center gap-3">

                    <button
                      type="button"
                      onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); startVoiceRecognition(); }} onPointerUp={stopVoiceRecognition} onPointerCancel={stopVoiceRecognition} onKeyDown={(event) => { if ((event.key === " " || event.key === "Enter") && !event.repeat) { event.preventDefault(); startVoiceRecognition(); } }} onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); stopVoiceRecognition(); } }}
                      aria-label={isListening ? "Ouvindo, solte para preencher" : "Segure para falar"}
                      title={isListening ? "Ouvindo, solte para preencher" : "Segure para falar"}
                      className={`inline-flex items-center gap-2 touch-none select-none rounded-full border px-4 py-3 font-display text-sm transition ${voiceMode ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                    >
                      {voiceMode ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M7 7h10v10H7z" /></svg>
                      ) : (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a1 1 0 1 0-2 0 3 3 0 0 1-6 0 1 1 0 1 0-2 0 5 5 0 0 0 4 4.9V19H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.1a5 5 0 0 0 4-4.9Z" /></svg>
                      )}
                      <span>{isListening ? "Ouvindo… solte para preencher" : "Segure para falar"}</span>
                    </button>
                    <span className="hidden font-light text-sm text-muted-foreground sm:inline">
                      Enter ↵ {cur.long && "· Shift+Enter nova linha"}
                    </span>
                  </div>
                  <p className="mt-3 min-h-5 font-light text-xs text-muted-foreground" aria-live="polite">
                    {voiceStatus || (voiceMode ? "Segure o botão para falar; ao soltar, a resposta será preenchida." : "Segure o botão para falar e solte para preencher a resposta.")}
                  </p>
                </div>
              )}

              {step > 0 && (
                <button onClick={() => go(step - 1)} className="mt-10 font-light text-sm text-muted-foreground transition hover:text-foreground">
                  ← Voltar
                </button>
              )}
            </div>
          )}

          {done && (
            <div>
              <p className="mb-4 font-display text-sm font-light uppercase tracking-[0.3em] text-primary">Recebido</p>
              <h2 className="text-balance font-display text-5xl font-extralight leading-[1.02] tracking-[-0.03em] sm:text-7xl">
                <Em text={`Obrigado${answers["nome"] ? `, **${(answers["nome"].split(" ")[0] ?? "").replace(/\*/g, "")}**` : ""}!`} />
              </h2>
              <p className="mt-6 max-w-xl font-light text-lg text-muted-foreground">
                Nosso time vai analisar seu briefing e entrar em contato em breve.
              </p>
              <button
                type="button"
                onClick={replayQuestionNarration}
                aria-label="Ouvir a mensagem de conclusão novamente"
                title="Ouvir a mensagem de conclusão novamente"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/30 px-4 py-3 text-sm text-foreground/80 backdrop-blur transition hover:border-primary hover:text-primary"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zm-2.5-9v2.06a7 7 0 0 1 0 13.88V21a9 9 0 0 0 0-18z" /></svg>
                Ouvir mensagem novamente
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className={`fixed inset-x-0 bottom-0 z-30 border-t-0 bg-transparent px-4 pb-3 transition-opacity duration-500 ${showIntro ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <InfiniteSlider
          gap={26}
          duration={46}
          reverse
          className="mx-auto w-full max-w-[760px] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        >
          {PARTNER_LOGOS.map((partner) => (
            <img
              key={partner.src}
              src={partner.src}
              alt={partner.name}
              loading="lazy"
              decoding="async"
              width={48}
              height={48}
              className="h-10 w-10 shrink-0 object-contain opacity-45 transition-opacity duration-300 hover:opacity-90 sm:h-12 sm:w-12"
            />
          ))}
        </InfiniteSlider>
      </footer>
          <div
        data-landing-scroll
        aria-hidden={!landingVisible}
        className={`fixed inset-0 z-[80] overflow-y-auto bg-black transition-opacity duration-1000 ease-out ${landingVisible ? (landingFadeIn ? "opacity-100" : "opacity-0") : "pointer-events-none opacity-0"}`}
      >
        {landingVisible && (
          <Suspense fallback={<div className="min-h-dvh bg-black" aria-label="Carregando a landing page" />}>
            <CinematicScrol videoUrls={heroVideoUrls} logoUrl={logo} />
          </Suspense>
        )}
      </div>
</main>
  );
}

/* Types the heading in while preserving its bold-marked segments. */
function Em({ text, progress }: { text: string; progress?: number }) {
  const segments = text.split("**");
  const plainText = segments.join("");
  const totalCharacters = Array.from(plainText).length;
  const [localVisibleCharacters, setLocalVisibleCharacters] = useState(0);
  const clampedProgress = progress === undefined ? 0 : Math.max(0, Math.min(1, progress));
  // Keep character reveal linear to the narration clock so the middle and end
  // of each spoken question do not run ahead of the audio.
  const synchronizedProgress = clampedProgress;
  const visibleCharacters = progress === undefined
    ? localVisibleCharacters
    : Math.floor(totalCharacters * synchronizedProgress);

  useEffect(() => {
    if (progress !== undefined) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setLocalVisibleCharacters(totalCharacters);
      return;
    }

    setLocalVisibleCharacters(0);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setLocalVisibleCharacters(count);
      if (count >= totalCharacters) window.clearInterval(timer);
    }, 22);
    return () => window.clearInterval(timer);
  }, [text, totalCharacters, progress]);

  let previousCharacters = 0;
  const typedSegments = segments.map((part, index) => {
    const characters = Array.from(part);
    const shown = characters.slice(0, Math.max(0, visibleCharacters - previousCharacters)).join("");
    previousCharacters += characters.length;
    return index % 2 === 1
      ? <b key={index} className="font-bold whitespace-nowrap">{shown}</b>
      : <span key={index}>{shown}</span>;
  });

  return (
    <>
      <span className="sr-only">{plainText}</span>
      <span aria-hidden="true">
        {typedSegments}
        <span className="africa-typewriter-caret" />
      </span>
    </>
  );
}

/* Voice-over intro: types each phrase word by word in sync with the narration audio. */
function Narration({ audioRef, onDone }: { audioRef: RefObject<HTMLAudioElement | null>; onDone: () => void }) {
  const [t, setT] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);
  const blockedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setT(Number.MAX_SAFE_INTEGER);
      setFading(true);
      window.setTimeout(() => onDoneRef.current(), 800);
    };
    audio.addEventListener("ended", finish);

    // Audio is the master clock: bound interpolation to avoid accumulating
    // drift, and freeze text when playback pauses or buffers.
    let raf = 0;
    let lastAudio = -1;
    let lastWall = 0;
    let lastFrameKey = "";
    const beganAt = performance.now();
    const tick = (now: number) => {
      let time = audio.currentTime;
      if (audio.paused || audio.readyState < 3) {
        lastAudio = time;
        lastWall = now;
      } else if (time !== lastAudio) {
        lastAudio = time;
        lastWall = now;
      } else {
        time = lastAudio + Math.min(0.08, (now - lastWall) / 1000) * audio.playbackRate;
      }
      // Final words can be only 30ms apart: update on every animation frame.
      const frame = getNarrationFrame(time);
      const frameKey = frame.fullText + "::" + frame.typed;
      if (frameKey !== lastFrameKey) {
        lastFrameKey = frameKey;
        setT(time);
      }
      // Safety net: if the voice-over never actually started, offer a retry.
      const silent = audio.paused && performance.now() - beganAt > 2500;
      if (silent !== blockedRef.current) {
        blockedRef.current = silent;
        setBlocked(silent);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      audio.removeEventListener("ended", finish);
    };
  }, []);

  const start = () => {
    audioRef.current?.play().then(() => setBlocked(false)).catch(() => {});
  };

  const { fullText, typed } = getNarrationFrame(t);

  return (
    <div className={`fixed inset-0 z-[55] flex items-center justify-center bg-black/40 px-6 transition-opacity duration-700 ${fading ? "opacity-0" : "opacity-100"}`}>
      {blocked ? (
        <button type="button" onClick={start} className="rounded-full border border-white/40 bg-black/40 px-6 py-3 text-lg font-light text-white backdrop-blur transition hover:bg-black/60">
          Toque para continuar ▶
        </button>
      ) : (
        <p aria-live="polite" className="max-w-4xl text-balance text-center text-3xl font-extralight leading-tight tracking-[-0.02em] text-white sm:text-6xl">
          <span>{fullText.slice(0, typed)}</span>
          <span aria-hidden="true" className="africa-typewriter-caret" />
          {/* Untyped rest is kept invisible so lines never re-wrap while typing. */}
          <span aria-hidden="true" className="opacity-0">{fullText.slice(typed)}</span>
        </p>
      )}
      <button type="button" onClick={() => { audioRef.current?.pause(); if (!doneRef.current) { doneRef.current = true; setFading(true); window.setTimeout(() => onDoneRef.current(), 800); } }} className="absolute bottom-8 right-6 text-sm font-light text-white/60 transition hover:text-white">
        Pular intro →
      </button>
    </div>
  );
}
