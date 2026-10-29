"use client";

import { useEffect, useRef, useState } from "react";
import { inkOrder, samplePenPath, VIEW_H, VIEW_W } from "./signaturePath";

// The artwork, cut from the reference image.
const SIGNATURE_SRC = "/signature.png";
const START_DELAY = 300;
const DRAW_MS = 3200;
const HOLD_MS = 350;
const FLY_MS = 650;
const LEAVE_MS = 700;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const REPLAY_EVENT = "intro:replay";
// Fired as the overlay starts to fade, so the page can animate in underneath it.
export const REVEAL_EVENT = "intro:reveal";
let revealed = false;
// Whether the first intro has started to fade, for pages that mount after REVEAL_EVENT already fired.
export const hasRevealed = () => revealed;
const reveal = () => {
  revealed = true;
  window.dispatchEvent(new Event(REVEAL_EVENT));
};

// Play the intro again, at the given speed multiplier (1 = normal).
export const replayIntro = (speed = 1) =>
  window.dispatchEvent(new CustomEvent<number>(REPLAY_EVENT, { detail: speed }));

export default function Intro() {
  const [run, setRun] = useState({ id: 0, speed: 1 });

  useEffect(() => {
    const onReplay = (e: Event) => setRun((r) => ({ id: r.id + 1, speed: (e as CustomEvent<number>).detail }));
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, []);

  // A fresh key remounts the player, so every replay starts from a blank canvas.
  return <IntroPlayer key={run.id} speed={run.speed} />;
}

function IntroPlayer({ speed }: { speed: number }) {
  // Every duration is divided by the speed multiplier.
  const ms = (n: number) => n / speed;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<"drawing" | "flying" | "leaving" | "done">("drawing");
  // Transform that carries the signature onto the header logo.
  const [flyTo, setFlyTo] = useState<string>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // The artwork at its native size; pixels are switched on here, then scaled onto the canvas.
    const art = document.createElement("canvas");
    const artCtx = art.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx || !artCtx) {
      reveal();
      setPhase("done");
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    let frame: ImageData | null = null;
    let source: Uint8ClampedArray = new Uint8ClampedArray();
    let ink: { i: number; len: number }[] = [];
    let drawn = 0;

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.imageSmoothingQuality = "high";
    };

    const present = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(art, 0, 0, canvas.width, canvas.height);
    };

    // Switch on every pixel of ink the pen has reached by the given length.
    const drawTo = (length: number) => {
      if (!frame) return;
      const d = frame.data;
      while (drawn < ink.length && ink[drawn].len <= length) {
        const o = ink[drawn++].i * 4 + 3;
        d[o] = source[o];
      }
      artCtx.putImageData(frame, 0, 0);
      present();
    };

    setup();
    document.documentElement.style.overflow = "hidden";

    let raf = 0;
    let cancelled = false;
    const timers: number[] = [];
    const leave = () => {
      reveal();
      setPhase("leaving");
      timers.push(
        window.setTimeout(() => {
          document.documentElement.style.overflow = "";
          setPhase("done");
        }, ms(LEAVE_MS)),
      );
    };

    // Shrink the signature into the header logo (same artwork, same aspect), then fade the
    // backdrop away so the real logo takes over in place.
    const fly = () => {
      const target = document.querySelector("[data-intro-target]")?.getBoundingClientRect();
      const from = canvas.getBoundingClientRect();
      if (!target?.width || !from.width) return leave();
      setFlyTo(
        `translate(${target.left - from.left}px, ${target.top - from.top}px) scale(${target.width / from.width})`,
      );
      setPhase("flying");
      timers.push(window.setTimeout(leave, ms(FLY_MS)));
    };

    const play = () => {
      if (cancelled) return;
      art.width = VIEW_W;
      art.height = VIEW_H;
      artCtx.drawImage(img, 0, 0, VIEW_W, VIEW_H);
      frame = artCtx.getImageData(0, 0, VIEW_W, VIEW_H);
      source = frame.data.slice();
      const samples = samplePenPath(source);
      const total = samples[samples.length - 1].len;
      ink = inkOrder(source, samples);
      for (let o = 3; o < frame.data.length; o += 4) frame.data[o] = 0;

      if (reduceMotion) {
        drawTo(total);
        timers.push(window.setTimeout(leave, ms(HOLD_MS + 400)));
        return;
      }
      const start = performance.now() + ms(START_DELAY);
      const tick = (now: number) => {
        const t = Math.min(Math.max((now - start) / ms(DRAW_MS), 0), 1);
        drawTo(easeInOut(t) * total);
        if (t < 1) raf = requestAnimationFrame(tick);
        else timers.push(window.setTimeout(fly, ms(HOLD_MS)));
      };
      raf = requestAnimationFrame(tick);
    };

    img.src = SIGNATURE_SRC;
    img.decode().then(play, () => !cancelled && leave());

    const onResize = () => {
      setup();
      if (frame) present();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
      document.documentElement.style.overflow = "";
    };
    // Runs once per mount; a replay remounts with a new speed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "done") return null;

  return (
    <div
      id="intro"
      aria-hidden="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity ease-in-out ${
        phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${ms(LEAVE_MS)}ms` }}
    >
      <noscript>
        <style>{"#intro{display:none}"}</style>
      </noscript>
      <canvas
        ref={canvasRef}
        className="w-[min(820px,88vw)] origin-top-left transition-transform"
        style={{
          aspectRatio: `${VIEW_W} / ${VIEW_H}`,
          transform: flyTo,
          transitionDuration: `${ms(FLY_MS)}ms`,
          transitionTimingFunction: "cubic-bezier(.7,0,.2,1)",
        }}
      />
    </div>
  );
}
