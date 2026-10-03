"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion, motion } from "motion/react";
import { Pause, Play } from "@phosphor-icons/react";
import { hero } from "@/content/media";

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/**
 * Video del hero.
 * - Poster como imagen real (candidato LCP); el video aparece con fundido recién en `playing`.
 * - preload="none" y src asignado en idle: no compite con la carga inicial.
 * - Sin autoplay con reduced motion, Save-Data o 2G. Si play() falla o el archivo falta, queda el poster.
 * - Se pausa fuera de viewport o con la pestaña oculta. Botón pausa/play siempre accesible (WCAG 2.2.2).
 *
 * Para usar tu video: colocá /public/videos/hero.mp4 (y opcionalmente hero-mobile.mp4).
 */
export function HeroMedia({ hasVideo, hasMobileVideo }: { hasVideo: boolean; hasMobileVideo: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const inView = useRef(true);
  const autoplayAllowed = useRef(true);

  // Carga diferida del src
  useEffect(() => {
    const v = ref.current;
    if (!hasVideo || !v) return;
    const net = (navigator as Navigator & { connection?: NetworkInfo }).connection;
    const constrained = net?.saveData || /(^|-)2g$/.test(net?.effectiveType ?? "");
    autoplayAllowed.current = !reduce && !constrained;
    if (!autoplayAllowed.current) {
      setUserPaused(true);
      return;
    }
    const load = () => {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      v.src = mobile && hasMobileVideo ? hero.videoMobile : hero.video;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      setLoaded(true);
      v.play().catch(() => setFailed(true));
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const id = w.requestIdleCallback ? w.requestIdleCallback(load, { timeout: 1500 }) : window.setTimeout(load, 900);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [hasVideo, hasMobileVideo, reduce]);

  // Pausar fuera de viewport / pestaña oculta
  useEffect(() => {
    const v = ref.current;
    if (!hasVideo || !v) return;
    const sync = () => {
      if (!v.src) return;
      const shouldPlay = inView.current && !document.hidden && !userPaused;
      if (shouldPlay && v.paused) v.play().catch(() => setFailed(true));
      else if (!shouldPlay && !v.paused) v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      inView.current = e.isIntersecting;
      sync();
    });
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [hasVideo, userPaused]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (userPaused) {
      if (!v.src) {
        v.src = window.matchMedia("(max-width: 767px)").matches && hasMobileVideo ? hero.videoMobile : hero.video;
        v.muted = true;
        setLoaded(true);
      }
      setUserPaused(false);
      setFailed(false);
      v.play().catch(() => setFailed(true));
    } else {
      setUserPaused(true);
      v.pause();
    }
  };

  const showDevLabel = process.env.NODE_ENV !== "production" && (!hasVideo || failed);

  return (
    <div className="absolute inset-0 overflow-hidden bg-tide-deep">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src={hero.poster.src}
          alt=""
          fill
          preload
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: hero.poster.focus }}
        />
      </motion.div>
      {hasVideo && (
        <video
          ref={ref}
          aria-hidden
          muted
          loop
          playsInline
          preload="none"
          poster={hero.poster.src}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => loaded && setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${playing && !failed ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: hero.poster.focus }}
        />
      )}
      {/* Scrim para legibilidad del texto sobre cualquier video */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(14_20_23_/_0.35)_0%,rgb(14_20_23_/_0)_28%,rgb(14_20_23_/_0.05)_55%,rgb(14_20_23_/_0.55)_100%)]" />

      {hasVideo && (
        <button
          type="button"
          onClick={toggle}
          className="absolute bottom-5 right-4 z-20 flex h-11 items-center gap-2 rounded-full bg-ink/55 px-4 text-xs font-semibold uppercase tracking-wide text-salt backdrop-blur-md transition-colors hover:bg-ink md:right-8"
          data-surface="dark"
        >
          {userPaused || (!playing && !failed && reduce) ? (
            <>
              <Play size={14} weight="fill" aria-hidden /> Reproducir video
            </>
          ) : (
            <>
              <Pause size={14} weight="fill" aria-hidden /> Pausar video
            </>
          )}
        </button>
      )}

      {showDevLabel && (
        <p className="mono absolute left-1/2 top-20 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-salt/90 px-4 py-2 text-[11px] font-semibold uppercase text-ink">
          Video placeholder · /public/videos/hero.mp4
        </p>
      )}
    </div>
  );
}
