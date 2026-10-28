import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type RefObject } from "react";
import narrationAsset from "@/assets/africa-narracao.mp3.asset.json";
import { getNarrationFrame } from "@/lib/narration";
import { Button } from "@/components/ui/button";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
const logo = "https://agenciaafrica.lovable.app/__l5e/assets-v1/42641b7a-09e8-4bc3-996b-9634277af170/africa-logo.png";
const bg = "https://agenciaafrica.lovable.app/__l5e/assets-v1/5d3e8bd4-5e05-49fc-afdc-4ff9fd9c000b/africa-bg.mp4";
const backgroundTrack = "https://sexflow.com.br/sexflow/trilha.mp3";
const narrationUrl = new URL(narrationAsset.url, "https://agenciaafrica.lovable.app").toString();

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

function Index() {
  const [step, setStep] = useState(-2);
  const [phase, setPhase] = useState<Phase>("start");
  const [introFading, setIntroFading] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [value, setValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const voiceModeRef = useRef(false);
  const stepRef = useRef(step);
  const changingStepRef = useRef(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement>(null);
  const narrationRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const showIntro = phase !== "briefing";

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
    const fadeTimer = window.setTimeout(() => setIntroFading(true), 9000);
    const finishTimer = window.setTimeout(() => {
      const music = musicRef.current;
      if (music) rampVolume(music, MUSIC_FULL, 2.5);
      setPhase("briefing");
      setStep(0);
    }, 10000);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(finishTimer);
    };
  }, [phase]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const voiceRecognitionRef = useRef<VoiceRecognition | null>(null);
  const voiceBaseValueRef = useRef("");
  const done = step >= QUESTIONS.length;
  stepRef.current = step;
  const cur = QUESTIONS[step];

  const go = (next: number) => {
    changingStepRef.current = true;
    voiceRecognitionRef.current?.stop();
    setLeaving(true);
    setTimeout(() => {
      setStep(next);
      setValue(QUESTIONS[next] ? answers[QUESTIONS[next].id] ?? "" : "");
      voiceBaseValueRef.current = QUESTIONS[next] ? answers[QUESTIONS[next].id] ?? "" : "";
      changingStepRef.current = false;
      if (voiceModeRef.current && next < QUESTIONS.length) {
        window.setTimeout(() => {
          if (voiceModeRef.current && !voiceRecognitionRef.current) startVoiceRecognition();
        }, 200);
      }
      setLeaving(false);
    }, 450);
  };

  const submit = (v = value) => {
    if (!cur || !v.trim()) return;
    voiceRecognitionRef.current?.stop();
    setAnswers((a) => ({ ...a, [cur.id]: v.trim() }));
    go(step + 1);
  };

  useEffect(() => {
    return () => {
      voiceModeRef.current = false;
      voiceRecognitionRef.current?.stop();
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

  const stopVoiceMode = () => {
    voiceModeRef.current = false;
    setVoiceMode(false);
    voiceRecognitionRef.current?.stop();
    voiceRecognitionRef.current = null;
    setIsListening(false);
    setVoiceStatus("Modo de voz desligado.");
  };

  const startVoiceRecognition = () => {
    const browserWindow = window as WindowWithVoiceRecognition;
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      voiceModeRef.current = false;
      setVoiceMode(false);
      setVoiceStatus("Este navegador não oferece ditado ao vivo. Digite sua resposta ou use o Chrome.");
      return;
    }

    try {
      const recognition = new Recognition();
      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = true;
      voiceBaseValueRef.current = value.trim();
      recognition.onresult = (event) => {
        const finalSegments: string[] = [];
        const interimSegments: string[] = [];
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result?.[0]?.transcript?.trim();
          if (!transcript) continue;
          (result?.isFinal ? finalSegments : interimSegments).push(transcript);
        }
        const spokenText = [...finalSegments, ...interimSegments].join(" ").trim();
        const transcript = [voiceBaseValueRef.current, spokenText].filter(Boolean).join(" ");
        setValue(transcript);
        const question = QUESTIONS[stepRef.current];
        if (question?.options && transcript.trim()) {
          setAnswers((a) => ({ ...a, [question.id]: transcript.trim() }));
        }
      };
      recognition.onerror = () => {
        setIsListening(false);
        setVoiceStatus("Não foi possível reconhecer a fala. Tente novamente ou digite sua resposta.");
      };
      recognition.onend = () => {
        voiceRecognitionRef.current = null;
        setIsListening(false);
        if (voiceModeRef.current && !changingStepRef.current && stepRef.current < QUESTIONS.length) {
          window.setTimeout(() => {
            if (voiceModeRef.current && !voiceRecognitionRef.current) startVoiceRecognition();
          }, 250);
        } else {
          setVoiceStatus("");
        }
      };
      voiceRecognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setVoiceStatus("Ouvindo…");
    } catch {
      voiceRecognitionRef.current = null;
      setIsListening(false);
      setVoiceStatus("Não foi possível iniciar o microfone. Confira a permissão do navegador.");
    }
  };

  const toggleVoiceInput = () => {
    if (voiceModeRef.current) {
      stopVoiceMode();
      return;
    }
    voiceModeRef.current = true;
    setVoiceMode(true);
    setVoiceStatus("Modo de voz ativo. Fale suas respostas; toque em Desligar voz para encerrar.");
    startVoiceRecognition();
  };

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
    <main className="relative min-h-dvh w-full overflow-hidden bg-background font-sans text-foreground">
      <style>{`@keyframes africaIntroLogo { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: scale(1); } } @keyframes africaTypewriterCaret { 50% { opacity: 0; } } .africa-typewriter-caret { display: inline-block; width: .065em; height: .82em; margin-left: .08em; vertical-align: -.04em; background: currentColor; animation: africaTypewriterCaret .85s steps(2, start) infinite; } @media (prefers-reduced-motion: reduce) { .africa-intro-logo { animation-duration: 1ms !important; } .africa-typewriter-caret { animation: none; } }`}</style>
      <video src={bg} autoPlay muted loop playsInline className="bg-breathe pointer-events-none absolute inset-0 h-full w-full object-cover opacity-80" />
      <audio ref={musicRef} src={backgroundTrack} loop preload="auto" onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} />
      <audio ref={narrationRef} src={narrationUrl} preload="auto" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/45" />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 55% at 50% 50%, rgba(0,0,0,0.45), transparent 72%)" }} />
      {phase === "narrating" && <Narration audioRef={narrationRef} onDone={() => setPhase("logo")} />}
      {phase === "logo" && (
        <div aria-hidden="true" className={`fixed inset-0 z-50 flex items-center justify-center bg-black/10 transition-opacity duration-1000 ${introFading ? "opacity-0" : "opacity-100"}`}>
          <img src={logo} alt="" className="africa-intro-logo h-auto max-h-[55dvh] w-[min(78vw,760px)] object-contain" style={{ animation: "africaIntroLogo 2600ms ease-out both" }} />
        </div>
      )}
      {phase === "start" && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-12 bg-background/65 px-6 text-center sm:gap-16">
          <img src={logo} alt="AFRICA" className="h-auto w-[min(58vw,320px)] object-contain" />
          <Button
            type="button"
            onClick={beginIntro}
            variant="ghost"
            className="h-12 gap-4 rounded-none border-b border-foreground/35 px-1 font-display text-base font-light text-foreground hover:bg-transparent hover:text-primary"
          >
            Iniciar
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M8 5v14l11-7z" /></svg>
          </Button>
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
        <img src={logo} alt="AFRICA" className="h-[90px] w-auto sm:h-[108px]" />
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
              <p className="mb-3 font-display text-sm font-light text-primary">{step + 1} →</p>
              <h2 className="text-balance font-display text-4xl font-extralight leading-[1.04] tracking-[-0.025em] sm:text-7xl"><Em text={cur.q} /></h2>
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
                <div className="mt-6 flex items-center gap-3">
                  <button type="button" onClick={toggleVoiceInput} aria-label={voiceMode ? "Desligar modo de voz" : "Responder por voz"} title={voiceMode ? "Desligar modo de voz" : "Responder por voz"} className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 font-display text-sm transition ${voiceMode ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
                    <span aria-hidden="true">🎙</span><span>{voiceMode ? "Desligar voz" : "Responder por voz"}</span>
                  </button>
                  <span className="font-light text-sm text-muted-foreground" aria-live="polite">{answers[cur.id] || "Escolha uma opção ou fale sua resposta."}</span>
                </div>
                </>
              ) : (
                <div className="mt-10">
                  <div className="relative">
                    <textarea
                      ref={inputRef}
                      rows={1}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
                      }}
                      placeholder="Digite sua resposta..."
                      className="w-full resize-none overflow-hidden border-b-2 border-border bg-transparent pb-3 font-light text-2xl caret-primary outline-none transition-colors placeholder:text-foreground/25 focus:border-primary sm:text-3xl"
                      style={{ caretColor: "transparent" }}
                    />
                    <FakeCaret value={value} />
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button onClick={() => submit()} disabled={!value.trim()} className="rounded-full bg-primary px-6 py-3 font-display font-bold text-primary-foreground transition hover:scale-105 disabled:opacity-30 disabled:hover:scale-100">
                      OK ✓
                    </button>
                    <button
                      type="button"
                      onClick={toggleVoiceInput}
                      aria-label={voiceMode ? "Desligar modo de voz" : "Responder por voz"}
                      title={voiceMode ? "Desligar modo de voz" : "Responder por voz"}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 font-display text-sm transition ${voiceMode ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}
                    >
                      {voiceMode ? (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M7 7h10v10H7z" /></svg>
                      ) : (
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a1 1 0 1 0-2 0 3 3 0 0 1-6 0 1 1 0 1 0-2 0 5 5 0 0 0 4 4.9V19H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-3.1a5 5 0 0 0 4-4.9Z" /></svg>
                      )}
                      <span>{voiceMode ? "Desligar voz" : "Responder por voz"}</span>
                    </button>
                    <span className="hidden font-light text-sm text-muted-foreground sm:inline">
                      Enter ↵ {cur.long && "· Shift+Enter nova linha"}
                    </span>
                  </div>
                  <p className="mt-3 min-h-5 font-light text-xs text-muted-foreground" aria-live="polite">
                    {voiceStatus || (voiceMode ? "Modo de voz ligado: permanece ativo em todas as perguntas." : "A fala é transcrita para texto e usada como resposta. Revise antes de enviar.")}
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
            </div>
          )}
        </div>
      </section>

      <footer className={`fixed inset-x-0 bottom-0 z-30 border-t-0 bg-transparent px-4 py-2 transition-opacity duration-500 ${showIntro ? "pointer-events-none opacity-0" : "opacity-100"}`}>
        <InfiniteSlider
          gap={16}
          duration={38}
          reverse
          className="mx-auto h-9 w-full max-w-[420px] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
        >
          {PARTNER_LOGOS.map((partner) => (
            <div
              key={partner.src}
              className="flex h-7 w-11 shrink-0 items-center justify-center overflow-hidden sm:h-8 sm:w-12"
            >
              <img
                src={partner.src}
                alt={partner.name}
                loading="lazy"
                className="h-16 w-16 max-w-none shrink-0 object-contain"
              />
            </div>
          ))}
        </InfiniteSlider>
      </footer>
    </main>
  );
}

/* Types the heading in while preserving its bold-marked segments. */
function Em({ text }: { text: string }) {
  const segments = text.split("**");
  const plainText = segments.join("");
  const totalCharacters = Array.from(plainText).length;
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setVisibleCharacters(totalCharacters);
      return;
    }

    setVisibleCharacters(0);
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      setVisibleCharacters(count);
      if (count >= totalCharacters) window.clearInterval(timer);
    }, 34);
    return () => window.clearInterval(timer);
  }, [text, totalCharacters]);

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

/* Pulsing block caret shown after the typed text (single-line approximation). */
function FakeCaret({ value }: { value: string }) {
  const lastLine = value.split("\n").pop() ?? "";
  const lines = value.split("\n").length;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 whitespace-pre-wrap break-words font-light text-2xl text-transparent sm:text-3xl" style={{ lineHeight: "inherit" }}>
      {lines > 1 ? value.slice(0, value.length - lastLine.length) : ""}
      {lastLine}
      <span className="caret-pulse ml-0.5 inline-block h-[1.1em] w-[3px] translate-y-[0.15em] rounded-full bg-primary" />
    </div>
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
      setFading(true);
      window.setTimeout(() => onDoneRef.current(), 800);
    };
    audio.addEventListener("ended", finish);

    // Audio is the master clock: bound interpolation to avoid accumulating
    // drift, and freeze text when playback pauses or buffers.
    let raf = 0;
    let lastAudio = -1;
    let lastWall = 0;
    let lastShown = -1;
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
      if (time !== lastShown) {
        lastShown = time;
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
