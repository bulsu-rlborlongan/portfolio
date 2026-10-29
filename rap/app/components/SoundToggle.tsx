"use client";

import { useRef, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { hasRevealed, REVEAL_EVENT } from "./Intro";

// Background music: "Everyone Adores You" by Matt Maltese, looped. The file lives in public/music.
const SRC = "/music/everyone-adores-you.mp3";
const VOLUME_KEY = "music-volume";
const OFF_KEY = "music-off";
const DEFAULT_VOLUME = 0.5;
// Each start eases the sound in over this long, in seconds.
const FADE_IN = 1.5;

// One player shared by every toggle (the header's and the phone menu's). Music is on unless the visitor switched it
// off (remembered across visits); `playing` is whether sound is actually coming out yet.
type State = { on: boolean; playing: boolean; volume: number };

const DEFAULTS: State = { on: true, playing: false, volume: DEFAULT_VOLUME };
let state = DEFAULTS;
const listeners = new Set<() => void>();
const set = (next: Partial<State>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

function load() {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    const v = Number(raw);
    return { on: localStorage.getItem(OFF_KEY) === null, volume: raw !== null && v >= 0 && v <= 1 ? v : DEFAULT_VOLUME };
  } catch {
    return {};
  }
}
const save = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
};

// Volume goes through a gain node, since iOS ignores `audio.volume`. Both are made on the visitor's first click or
// key press, so the browser allows the sound.
let audio: HTMLAudioElement | null = null;
let gain: GainNode | null = null;
let ctx: AudioContext | null = null;

function player() {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.addEventListener("pause", () => set({ playing: false }));
    audio.addEventListener("play", () => set({ playing: true }));
    try {
      ctx = new AudioContext();
      gain = ctx.createGain();
      gain.gain.value = state.volume;
      ctx.createMediaElementSource(audio).connect(gain).connect(ctx.destination);
    } catch {
      // No Web Audio: fall back to the element's own volume.
      audio.volume = state.volume;
    }
  }
  return audio;
}

function start() {
  const a = player();
  if (!a.paused) return;
  ctx?.resume();
  if (ctx && gain) {
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(state.volume, ctx.currentTime + FADE_IN);
  }
  // Fails if the file is missing or the browser wants a gesture first; the next gesture tries again.
  a.play().catch(() => set({ playing: false }));
}

function toggle() {
  if (state.on) {
    audio?.pause();
    save(OFF_KEY, "1");
    set({ on: false });
  } else {
    save(OFF_KEY, null);
    set({ on: true });
    start();
  }
}

function setVolume(volume: number) {
  if (ctx && gain) {
    // Drop any fade-in still running, or it would override the new level.
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
  } else if (audio) audio.volume = volume;
  save(VOLUME_KEY, String(volume));
  set({ volume });
}

// Music that's on starts as the signature intro fades out. Browsers only allow sound once the visitor has interacted
// with the page, so if they haven't by then, it starts with their first click, tap or key press instead. One during
// the intro just readies the player for the end of it. The music button itself is left out: pressing it means
// "turn it off".
const GESTURES = ["click", "touchend", "keydown"] as const;
function onGesture(e: Event) {
  if (state.playing) return GESTURES.forEach((g) => window.removeEventListener(g, onGesture, true));
  if (!state.on || (e.target instanceof Element && e.target.closest("[data-music-toggle]"))) return;
  if (hasRevealed()) start();
  else {
    player();
    ctx?.resume();
  }
}
if (typeof window !== "undefined") {
  state = { ...state, ...load() };
  GESTURES.forEach((g) => window.addEventListener(g, onGesture, true));
  const onReveal = () => state.on && start();
  if (hasRevealed()) onReveal();
  else window.addEventListener(REVEAL_EVENT, onReveal, { once: true });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
// Speaker with one or two waves for the level; a cross when off or silent.
function icon({ on, volume }: State) {
  const speaker = "M5 10v4h3l4 3V7L8 10H5z";
  if (!on || volume === 0) return `${speaker}M16 10l4 4M20 10l-4 4`;
  return volume < 0.5 ? `${speaker}M16 9a4 4 0 010 6` : `${speaker}M16 9a4 4 0 010 6M18.5 6.5a7.5 7.5 0 010 11`;
}

// Space between the two bars, in px; it marks the current level.
const GAP = 6;

const clamp = (v: number) => Math.min(1, Math.max(0, Math.round(v * 100) / 100));

// Vertical volume slider: drag or click along the track (top is loudest), or use the arrow keys.
function VolumeSlider({ volume }: { volume: number }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const fromPointer = (e: PointerEvent) => {
    const r = trackRef.current?.getBoundingClientRect();
    if (r) setVolume(clamp((r.bottom - e.clientY) / r.height));
  };

  const onKey = (e: KeyboardEvent) => {
    const step = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05, PageUp: 0.2, PageDown: -0.2 }[
      e.key
    ];
    if (step !== undefined) setVolume(clamp(volume + step));
    else if (e.key === "Home") setVolume(0);
    else if (e.key === "End") setVolume(1);
    else return;
    e.preventDefault();
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Music volume"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(volume * 100)}
      onKeyDown={onKey}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e);
      }}
      onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && fromPointer(e)}
      className="flex h-28 w-6 cursor-pointer touch-none justify-center rounded-[3px] outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
    >
      {/* Flat bars split by a gap at the current level: solid below, dimmed above. */}
      <div ref={trackRef} className="relative h-full w-2">
        <div
          className="absolute inset-x-0 top-0 rounded-[2px] bg-neutral-900/35 dark:bg-neutral-200/45"
          style={{ height: `max(0px, ${(1 - volume) * 100}% - ${GAP / 2}px)` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 rounded-[2px] bg-neutral-900 dark:bg-neutral-200"
          style={{ height: `max(0px, ${volume * 100}% - ${GAP / 2}px)` }}
        />
      </div>
    </div>
  );
}

// Music switch. Hovering (or focusing) it opens a vertical volume slider, below it in the header and above it in the
// phone menu, where it sits at the bottom of the screen.
export default function SoundToggle({ slider = "below" }: { slider?: "below" | "above" }) {
  const current = useSyncExternalStore(subscribe, () => state, () => DEFAULTS);
  const { on, volume } = current;

  return (
    <div className="group relative">
      <button
        type="button"
        data-music-toggle
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "Turn music off" : "Turn music on"}
        title={on ? "Everyone Adores You — Matt Maltese" : "Music off"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-100"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d={icon(current)} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* The padding bridges the gap to the button, so the pointer can travel onto the slider without closing it. */}
      <div
        className={`invisible absolute left-1/2 z-10 -translate-x-1/2 opacity-0 transition-[opacity,translate,visibility] duration-200 ease-out group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none ${
          slider === "below" ? "top-full -translate-y-1 pt-2" : "bottom-full translate-y-1 pb-2"
        }`}
      >
        <div className="flex flex-col items-center gap-2.5 rounded-full border border-black/10 bg-white/80 px-1.5 pt-3 pb-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_12px_28px_-14px_rgba(0,0,0,0.3)] backdrop-blur-[18px] backdrop-saturate-[1.6] dark:border-white/[0.11] dark:bg-[rgba(20,20,26,0.8)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_12px_28px_-14px_rgba(0,0,0,0.8)]">
          <output className="min-w-[3ch] text-center font-mono text-[11px] font-medium text-neutral-900 tabular-nums dark:text-neutral-100">
            {Math.round(volume * 100)}
          </output>
          <VolumeSlider volume={volume} />
        </div>
      </div>
    </div>
  );
}
