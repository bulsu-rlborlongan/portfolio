"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useRouter } from "next/navigation";

// Slide-to-open pill: drag the knob to the end of the track to navigate. Released early, it springs
// back. Enter/Space on the focused knob completes the slide for keyboard users. The glow uses the
// same rose-to-slate palette as the gradient heading above it.

const PAD = 4; // gap between the track edge and the knob
const KNOB = 40; // knob size in px (size-10)
const THRESHOLD = 0.85; // fraction of the track the knob must pass to count as a slide
const EASE = "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";
const AURA = "linear-gradient(100deg,#f1e9df,#d9b3c3 40%,#9c6c84 70%,#8f97ad)";

// Icons after lucide's arrow-right and check.
const ICON = "absolute size-[18px] fill-none stroke-current stroke-[2.25] [stroke-linecap:round] [stroke-linejoin:round]";

export default function SlideButton({ href, label }: { href: string; label: string }) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [max, setMax] = useState(0);

  const reset = () => {
    startX.current = null;
    setDragging(false);
    setDone(false);
    setX(0);
  };

  // How far the knob can travel; re-measured if the track resizes (e.g. root font size changes).
  // cacheComponents keeps this page alive (hidden) after navigating away, so the effect cleanup is
  // where we put the knob back; `pageshow` covers the browser's back/forward cache too.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setMax(track.clientWidth - KNOB - PAD * 2);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    const onPageShow = (e: PageTransitionEvent) => e.persisted && reset();
    window.addEventListener("pageshow", onPageShow);
    return () => {
      ro.disconnect();
      window.removeEventListener("pageshow", onPageShow);
      reset();
    };
  }, []);

  const complete = () => {
    setDone(true);
    setX(max);
    window.setTimeout(() => router.push(href), 420);
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startX.current = e.clientX - x;
    setDragging(true);
  };

  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (startX.current === null) return;
    setX(Math.min(Math.max(e.clientX - startX.current, 0), max));
  };

  const onPointerUp = () => {
    if (startX.current === null) return;
    startX.current = null;
    setDragging(false);
    if (max > 0 && x >= max * THRESHOLD) complete();
    else setX(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (!done) complete();
  };

  const progress = max > 0 ? x / max : 0;
  const idle = !dragging && !done && x === 0;
  // While dragging, everything tracks the pointer with no transition; otherwise ease (spring back or finish).
  const ease = (props: string) => (dragging ? "" : `${props} ${EASE}`);

  return (
    <div
      ref={trackRef}
      className={`relative flex h-12 w-[12rem] items-center overflow-hidden rounded-full border border-white/10 bg-neutral-900 select-none dark:bg-[#141418] ${ease("transition-shadow")}`}
      style={{
        boxShadow: `0 0 ${8 + progress * 28}px ${progress * 4}px rgba(217,179,195,${0.08 + progress * 0.35})`,
      }}
    >
      {/* Glowing fill that trails the knob. */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 rounded-full opacity-60 blur-[2px] ${ease("transition-[width]")}`}
        style={{
          width: x + KNOB,
          background: `linear-gradient(90deg,transparent,rgba(156,108,132,0.55) 55%,rgba(217,179,195,0.85))`,
          boxShadow: `0 0 18px rgba(217,179,195,${0.2 + progress * 0.4})`,
        }}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 flex items-center justify-center bg-[length:200%_100%] bg-clip-text pl-10 text-[13px] leading-none font-medium text-transparent ${ease("transition-opacity")} ${idle ? "motion-safe:animate-shimmer" : ""}`}
        style={{
          opacity: done ? 0 : 1 - progress * 1.5,
          backgroundImage: `linear-gradient(90deg,#8f97ad 0%,#d9b3c3 40%,#fff 50%,#d9b3c3 60%,#8f97ad 100%)`,
        }}
      >
        {label}
      </span>
      <button
        type="button"
        aria-label={`Slide to ${label.toLowerCase()}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={`absolute top-1 left-1 flex size-10 cursor-grab touch-none items-center justify-center rounded-full text-neutral-950 will-change-transform outline-none focus-visible:ring-2 focus-visible:ring-[#d9b3c3] active:cursor-grabbing ${ease("transition-[transform,box-shadow]")} ${idle ? "motion-safe:animate-nudge" : ""}`}
        style={{
          transform: `translateX(${x}px)${dragging ? " scale(1.05)" : ""}`,
          backgroundImage: AURA,
          boxShadow: `0 0 ${10 + progress * 18}px rgba(217,179,195,${0.45 + progress * 0.4}), inset 0 1px 0 rgba(255,255,255,0.6)`,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`${ICON} transition-[opacity,transform] ${EASE} ${done ? "translate-x-2 opacity-0" : ""}`}
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={`${ICON} transition-[opacity,transform] ${EASE} ${done ? "" : "scale-50 -rotate-45 opacity-0"}`}
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </button>
    </div>
  );
}
