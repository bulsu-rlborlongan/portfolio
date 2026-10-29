"use client";

import { useEffect, useRef } from "react";
import { REPLAY_EVENT, REVEAL_EVENT } from "./Intro";

// Interactive dot bust: the dotted figure in /bust.webp is scanned into particles that spring back to
// their place. The pointer pushes them aside, a click sends out a shockwave, and they assemble as the
// intro overlay fades. Beside the text it's anchored to the bottom-right of its box like the ascii-reveal hero
// figure (the hero clips the left shoulder); stacked above the text on smaller screens it's centred.

const SRC = "/bust.webp";
const SAMPLE_W = 340; // width the image is scanned at
const STEP = 2; // scan grid, in sample pixels
const MAX_DOTS = 5600;
// The face is solid ink, so every grid point there becomes a dot and it reads as a packed blob. Cap how many dots
// any CELL×CELL patch (sample pixels) may keep; sparser areas like the shoulders sit under the cap and are untouched.
const CELL = 10;
const CELL_MAX = 9; // of the 25 grid points in a patch
const FILL_HEIGHT = 0.94; // share of the box's height the figure takes

const SPRING = 0.055;
const DAMPING = 0.86;
// Idle: each dot drifts on its own toward a nearby point, then picks another after a random pause.
const WANDER = 9; // how far a dot may stray from home, px
const WANDER_MIN = 0.35; // share of WANDER every new goal is at least, so no dot just sits still
const WANDER_EASE = 0.02; // per-frame glide toward the current goal; small = slow
const WANDER_HOLD = [1, 3.5]; // seconds before a dot picks a new goal (min, max)
const HOVER_R = 95; // pointer push radius, px
const HOVER_PUSH = 2.6;
const BURST_R = 190;
const BURST_PUSH = 16;
const ASSEMBLE_MS = 900;

type Dots = {
  n: number;
  // Home position in 0..1 of the figure, current position/velocity in px, and dot radius.
  ux: Float32Array;
  uy: Float32Array;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  size: Float32Array;
  // Idle wander: current offset from home, the goal it glides to, and when it picks the next goal.
  wx: Float32Array;
  wy: Float32Array;
  gx: Float32Array;
  gy: Float32Array;
  next: Float32Array;
  // Dots are sorted by colour so each colour is one path; [start, end, fillStyle, alpha].
  buckets: [number, number, string, number][];
  aspect: number;
};

// Turn the image's coloured dots into particles. Pixels are un-blended from the paper colour so the
// dots keep their full colour on a dark background too.
function scan(img: HTMLImageElement): Dots | null {
  const sw = SAMPLE_W;
  const sh = Math.round((SAMPLE_W * img.naturalHeight) / img.naturalWidth);
  const c = document.createElement("canvas");
  c.width = sw;
  c.height = sh;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, sw, sh);
  const d = ctx.getImageData(0, 0, sw, sh).data;
  const bg = [d[0], d[1], d[2]];

  const found: { ux: number; uy: number; key: string; a: number }[] = [];
  for (let y = 0; y < sh; y += STEP) {
    for (let x = 0; x < sw; x += STEP) {
      const i = (y * sw + x) * 4;
      const diff = Math.max(bg[0] - d[i], bg[1] - d[i + 1], bg[2] - d[i + 2]);
      const a = Math.min(diff / 140, 1);
      if (a < 0.14) continue;
      // Quantised so dots share a handful of fill colours.
      const ch = (k: number) => Math.round(Math.min(Math.max(bg[k] - (bg[k] - d[i + k]) / a, 0), 255) / 24) * 24;
      const alpha = Math.ceil(a * 4) / 4;
      found.push({
        ux: (x + Math.random() * STEP) / sw,
        uy: (y + Math.random() * STEP) / sh,
        key: `rgb(${ch(0)},${ch(1)},${ch(2)})|${alpha}`,
        a: alpha,
      });
    }
  }
  // Thin crowded patches down to CELL_MAX, then thin out evenly if there are still more than we want to animate.
  const cellOf = (p: { ux: number; uy: number }) => Math.floor((p.ux * sw) / CELL) * 1e4 + Math.floor((p.uy * sh) / CELL);
  const perCell = new Map<number, number>();
  for (const p of found) perCell.set(cellOf(p), (perCell.get(cellOf(p)) ?? 0) + 1);
  const spaced = found.filter((p) => Math.random() < CELL_MAX / Math.max(perCell.get(cellOf(p))!, CELL_MAX));
  const keep = spaced.length > MAX_DOTS ? spaced.filter(() => Math.random() < MAX_DOTS / spaced.length) : spaced;
  keep.sort((p, q) => (p.key < q.key ? -1 : p.key > q.key ? 1 : 0));

  const n = keep.length;
  const dots: Dots = {
    n,
    ux: new Float32Array(n),
    uy: new Float32Array(n),
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    size: new Float32Array(n),
    wx: new Float32Array(n),
    wy: new Float32Array(n),
    gx: new Float32Array(n),
    gy: new Float32Array(n),
    next: new Float32Array(n),
    buckets: [],
    aspect: sw / sh,
  };
  keep.forEach((p, i) => {
    dots.ux[i] = p.ux;
    dots.uy[i] = p.uy;
    dots.size[i] = 0.55 + p.a * 0.75 + Math.random() * 0.35;
    const last = dots.buckets[dots.buckets.length - 1];
    if (last && keep[last[0]].key === p.key) last[1] = i + 1;
    else dots.buckets.push([i, i + 1, p.key.split("|")[0], p.a]);
  });
  return dots;
}

export default function ParticleBust() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dots: Dots | null = null;
    let W = 0;
    let H = 0;
    // Figure placement in px: origin and size.
    let fx = 0;
    let fy = 0;
    let fw = 0;
    let fh = 0;
    let scale = 1; // dot size scale for the figure's size
    let dark = document.documentElement.classList.contains("dark");
    // Pointer target, and a smoothed copy the push field follows.
    const ptr = { x: 0, y: 0, sx: 0, sy: 0, on: false };
    // Until the intro reveals the page, dots wait off-figure and invisible.
    let waiting = !reduceMotion && !!document.getElementById("intro");
    let fadeStart = 0;
    let raf = 0;
    let visible = true;

    const homeX = (i: number) => fx + dots!.ux[i] * fw;
    const homeY = (i: number) => fy + dots!.uy[i] * fh;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!dots) return;
      const prevW = fw;
      fh = H * FILL_HEIGHT;
      fw = fh * dots.aspect;
      // Beside the text (lg up) it hugs the right edge. Stacked above the text on smaller screens it's centred on
      // the head, which sits a little left of the image's middle because the shoulders lean right.
      fx = window.matchMedia("(min-width: 64rem)").matches ? W - fw * 0.97 : (W - fw) / 2 + fw * 0.03;
      fy = H - fh;
      scale = Math.max(fh / 560, 0.7);
      // First layout puts dots at home; later ones keep them where they are relative to the figure.
      if (prevW) return;
      for (let i = 0; i < dots.n; i++) {
        dots.x[i] = homeX(i);
        dots.y[i] = homeY(i);
      }
    };

    // Throw every dot outward from its home, to fly back in when the page is revealed.
    const scatter = () => {
      if (!dots) return;
      for (let i = 0; i < dots.n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 120 + Math.random() * 380;
        dots.x[i] = homeX(i) + Math.cos(ang) * dist;
        dots.y[i] = homeY(i) + Math.sin(ang) * dist * 0.7;
        dots.vx[i] = dots.vy[i] = 0;
      }
    };

    const assemble = () => {
      waiting = false;
      fadeStart = performance.now();
      start();
    };

    const draw = (fade: number) => {
      ctx.clearRect(0, 0, W, H);
      if (!dots || fade <= 0) return;
      // Additive blending makes overlapping dots glow on the dark theme.
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (const [from, to, fill, alpha] of dots.buckets) {
        ctx.fillStyle = fill;
        ctx.globalAlpha = alpha * fade * (dark ? 0.9 : 1);
        ctx.beginPath();
        for (let i = from; i < to; i++) {
          const r = dots.size[i] * scale;
          ctx.moveTo(dots.x[i] + r, dots.y[i]);
          ctx.arc(dots.x[i], dots.y[i], r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const tick = (now: number) => {
      raf = 0;
      if (!dots) return;
      if (waiting) {
        draw(0);
        return;
      }
      const t = now / 1000;
      ptr.sx += (ptr.x - ptr.sx) * 0.3;
      ptr.sy += (ptr.y - ptr.sy) * 0.3;
      const r2 = HOVER_R * HOVER_R;
      for (let i = 0; i < dots.n; i++) {
        if (t >= dots.next[i]) {
          const ang = Math.random() * Math.PI * 2;
          const dist = (WANDER_MIN + Math.random() * (1 - WANDER_MIN)) * WANDER;
          dots.gx[i] = Math.cos(ang) * dist;
          dots.gy[i] = Math.sin(ang) * dist;
          dots.next[i] = t + WANDER_HOLD[0] + Math.random() * (WANDER_HOLD[1] - WANDER_HOLD[0]);
        }
        dots.wx[i] += (dots.gx[i] - dots.wx[i]) * WANDER_EASE;
        dots.wy[i] += (dots.gy[i] - dots.wy[i]) * WANDER_EASE;
        const tx = homeX(i) + dots.wx[i];
        const ty = homeY(i) + dots.wy[i];
        let ax = (tx - dots.x[i]) * SPRING;
        let ay = (ty - dots.y[i]) * SPRING;
        if (ptr.on) {
          const dx = dots.x[i] - ptr.sx;
          const dy = dots.y[i] - ptr.sy;
          const dd = dx * dx + dy * dy;
          if (dd < r2 && dd > 0.01) {
            const dist = Math.sqrt(dd);
            const f = (1 - dist / HOVER_R) ** 2 * HOVER_PUSH;
            ax += (dx / dist) * f;
            ay += (dy / dist) * f;
          }
        }
        dots.vx[i] = (dots.vx[i] + ax) * DAMPING;
        dots.vy[i] = (dots.vy[i] + ay) * DAMPING;
        dots.x[i] += dots.vx[i];
        dots.y[i] += dots.vy[i];
      }
      draw(Math.min((now - fadeStart) / ASSEMBLE_MS, 1));
      if (visible) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf && dots && visible && !reduceMotion) raf = requestAnimationFrame(tick);
      if (reduceMotion) draw(1);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      ptr.x = e.clientX - rect.left;
      ptr.y = e.clientY - rect.top;
      const inside = ptr.x > -HOVER_R && ptr.x < W + HOVER_R && ptr.y > -HOVER_R && ptr.y < H + HOVER_R;
      // Entering: start the smoothed point at the pointer so the field doesn't sweep across the figure.
      if (inside && !ptr.on) {
        ptr.sx = ptr.x;
        ptr.sy = ptr.y;
      }
      ptr.on = inside;
    };
    const onLeave = () => (ptr.on = false);
    const onDown = (e: PointerEvent) => {
      if (!dots || waiting || reduceMotion) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px < 0 || px > W || py < 0 || py > H) return;
      for (let i = 0; i < dots.n; i++) {
        const dx = dots.x[i] - px;
        const dy = dots.y[i] - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= BURST_R || dist < 0.01) continue;
        const f = (1 - dist / BURST_R) * BURST_PUSH * (0.6 + Math.random() * 0.4);
        dots.vx[i] += (dx / dist) * f;
        dots.vy[i] += (dy / dist) * f;
      }
    };
    const onReplay = () => {
      waiting = true;
      scatter();
      start();
    };

    const img = new Image();
    img.onload = () => {
      dots = scan(img);
      layout();
      if (waiting) {
        scatter();
        // In case the reveal never comes (e.g. the intro was skipped), assemble anyway.
        window.setTimeout(() => waiting && assemble(), 15000);
      } else if (!reduceMotion) {
        scatter();
        assemble();
      }
      start();
    };
    img.src = SRC;

    const ro = new ResizeObserver(() => {
      layout();
      if (reduceMotion) draw(1);
    });
    ro.observe(canvas);
    // Only animate while the hero is on screen.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      dark = document.documentElement.classList.contains("dark");
      if (reduceMotion) draw(1);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener(REVEAL_EVENT, assemble);
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => {
      cancelAnimationFrame(raf);
      img.onload = null;
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener(REVEAL_EVENT, assemble);
      window.removeEventListener(REPLAY_EVENT, onReplay);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0">
      {/* Soft coloured light behind the head, in the figure's own blue-to-rose palette. */}
      <div className="pointer-events-none absolute right-1/2 bottom-[18%] translate-x-1/2 lg:right-[4%] lg:translate-x-0 aspect-square w-[min(78%,30rem)] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.22),rgba(168,85,247,0.14)_55%,transparent)] blur-2xl dark:bg-[radial-gradient(closest-side,rgba(59,130,246,0.28),rgba(217,70,239,0.16)_55%,transparent)]" />
      <div className="pointer-events-none absolute right-1/2 bottom-0 h-1/2 w-[70%] translate-x-1/2 lg:right-[-6%] lg:translate-x-0 rounded-full bg-[radial-gradient(closest-side,rgba(244,114,182,0.16),transparent)] blur-2xl" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
