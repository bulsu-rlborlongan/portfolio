"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Certificate } from "../data/certificates";
import { hasRevealed, REVEAL_EVENT } from "./Intro";

// Glass card, framed like bryllim.com's certificate cards: an outer 18px shell with a 6px gutter around an
// inner 12px panel. The shell keeps the frosted fill, top highlight and soft diagonal sheen.
const CARD =
  "relative flex min-w-0 rounded-[18px] border p-1.5 backdrop-blur-[16px] backdrop-saturate-[1.6] " +
  "border-black/[0.07] bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_24px_48px_-28px_rgba(30,30,60,0.14)] " +
  "dark:border-white/[0.11] dark:bg-[rgba(20,20,26,0.44)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_24px_48px_-28px_rgba(0,0,0,0.6)] " +
  "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] " +
  "after:bg-[linear-gradient(150deg,rgba(255,255,255,0.1),rgba(255,255,255,0)_34%,rgba(255,255,255,0)_70%,rgba(255,255,255,0.04))]";

// Inner panel: a hairline border and a slightly lifted fill so it reads as a layer inside the shell.
const PANEL =
  "relative flex flex-1 flex-col items-center gap-3 rounded-[12px] border px-4 pt-5 pb-4 text-center " +
  "border-black/[0.06] bg-white/60 dark:border-white/[0.07] dark:bg-white/[0.025]";

// Issuer marks, drawn inline so they stay crisp on the 40px tile. All are SVG so the ASCII intro can rasterize them.
const LOGOS: Record<Certificate["logo"], ReactNode> = {
  google: (
    <svg viewBox="0 0 48 48" className="h-6 w-6">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.6C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.6C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  ),
  salesforce: (
    <svg viewBox="0 0 64 44" className="h-6 w-8" fill="#00A1E0">
      <circle cx="21" cy="17" r="11" />
      <circle cx="35" cy="14" r="12" />
      <circle cx="49" cy="20" r="11" />
      <circle cx="14" cy="27" r="10" />
      <circle cx="27" cy="30" r="11" />
      <circle cx="43" cy="30" r="11" />
    </svg>
  ),
  skillfront: (
    <svg viewBox="0 0 24 24" className="h-6 w-6">
      <rect width="24" height="24" rx="5" fill="#d4161e" />
      <text
        x="12"
        y="16.2"
        fill="#fff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="10.5"
        fontWeight="700"
        textAnchor="middle"
      >
        SF
      </text>
    </svg>
  ),
};

// ASCII intro, after ascii-reveal: the card's logo builds up out of flickering characters, holds, then breaks
// apart while the real content decodes in. It plays when the card scrolls into view, then again REST ms after
// each run ends, for as long as the card stays on screen. Times in ms.
const ASSEMBLE = 800;
const HOLD = 500;
const DISSOLVE = 700;
const FLICKER = 150; // how long a cell shows random glyphs before settling or vanishing
const STAGGER = 140; // delay between neighbouring cards on the first run
const REST = 3000; // pause between runs, with the real content showing
const RAMP = ".:-=+*#%@"; // sparse → dense, picked by how much of the cell the logo covers
const NOISE = "!<>-_\\/[]{}=+*^?#%@";
const ROWS = 16; // ASCII logo height in rows
const LINE = 6; // row height in px; the font is sized to match
const MAX_WIDTH = 168; // keep wide logos inside the panel

type Cell = { x: number; y: number; glyph: string; color: string; appear: number; vanish: number };
type Phase = "idle" | "ascii" | "reveal" | "done";

const pick = (s: string) => s[Math.floor(Math.random() * s.length)];

// Rasterize the tile's SVG and average it into a ROWS-high grid of character cells.
async function buildCells(svg: SVGSVGElement, charWidth: number) {
  const [, , vw, vh] = svg.getAttribute("viewBox")!.split(" ").map(Number);
  const cols = Math.min(Math.round((ROWS * LINE * (vw / vh)) / charWidth), Math.floor(MAX_WIDTH / charWidth));
  const sx = 6;
  const sy = Math.round((sx * LINE) / charWidth); // sample blocks share the cell's aspect ratio
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("width", String(cols * sx));
  clone.setAttribute("height", String(ROWS * sy));
  clone.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = cols * sx;
  canvas.height = ROWS * sy;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const cells: Cell[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < cols; x++) {
      let [r, g, b, a] = [0, 0, 0, 0];
      for (let py = y * sy; py < (y + 1) * sy; py++) {
        for (let px = x * sx; px < (x + 1) * sx; px++) {
          const i = (py * canvas.width + px) * 4;
          const alpha = data[i + 3];
          r += data[i] * alpha;
          g += data[i + 1] * alpha;
          b += data[i + 2] * alpha;
          a += alpha;
        }
      }
      const coverage = a / (sx * sy * 255);
      if (coverage < 0.1) continue;
      cells.push({
        x,
        y,
        glyph: RAMP[Math.min(RAMP.length - 1, Math.floor(coverage * RAMP.length))],
        color: `rgb(${Math.round(r / a)},${Math.round(g / a)},${Math.round(b / a)})`,
        // Cascade top to bottom with some jitter, then break up in random order.
        appear: (y / ROWS) * ASSEMBLE * 0.45 + Math.random() * ASSEMBLE * 0.35,
        vanish: ASSEMBLE + HOLD + Math.random() * (DISSOLVE - FLICKER),
      });
    }
  }
  return { cells, cols };
}

// Text that scrambles, then settles one character at a time. Each unsettled character keeps the real one in its
// slot (invisible) and draws the noise glyph on top, so widths and line breaks never change while it decodes.
function Decode({ text, active }: { text: string; active: boolean }) {
  const chars = [...text];
  const [noise, setNoise] = useState<(string | null)[]>(() => chars.map(() => null));

  useEffect(() => {
    if (!active) return;
    const letters = [...text];
    const settle = letters.map(() => Math.random() * (DISSOLVE - 100));
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = now - start;
      setNoise(letters.map((ch, i) => (ch === " " || t >= settle[i] ? null : pick(NOISE))));
      if (t < DISSOLVE) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, text]);

  return chars.map((ch, i) =>
    noise[i] ? (
      <span key={i} className="relative">
        <span className="invisible">{ch}</span>
        <span aria-hidden="true" className="absolute inset-0 text-center">
          {noise[i]}
        </span>
      </span>
    ) : (
      ch
    ),
  );
}

export default function CertificateCard({
  cert,
  index,
  className = "",
  style,
}: {
  cert: Certificate;
  index: number;
  className?: string;
  style?: CSSProperties;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    const svg = tileRef.current?.querySelector("svg");
    if (!card || !canvas || !svg) return;
    // Reduced motion: no intro. The motion-reduce classes below keep the content visible and the canvas hidden.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let frame = 0;
    let timer = 0;
    const ctx = canvas.getContext("2d")!;
    const font = `500 ${LINE + 1}px ${getComputedStyle(canvas).fontFamily}`;
    ctx.font = font;
    const charWidth = ctx.measureText("M").width;
    const grid = buildCells(svg, charWidth);

    const play = async () => {
      const { cells, cols } = await grid;
      if (cancelled) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.ceil(cols * charWidth * dpr);
      canvas.height = ROWS * LINE * dpr;
      canvas.style.width = `${cols * charWidth}px`;
      canvas.style.height = `${ROWS * LINE}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = font;
      ctx.textBaseline = "top";
      setPhase("ascii");

      const start = performance.now();
      let revealed = false;
      const tick = (now: number) => {
        const t = now - start;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const c of cells) {
          if (t < c.appear || t >= c.vanish + FLICKER) continue;
          const noisy = t < c.appear + FLICKER || t >= c.vanish;
          ctx.globalAlpha = noisy ? 0.55 : 1;
          ctx.fillStyle = c.color;
          ctx.fillText(noisy ? pick(NOISE) : c.glyph, c.x * charWidth, c.y * LINE);
        }
        if (!revealed && t >= ASSEMBLE + HOLD) {
          revealed = true;
          setPhase("reveal");
        }
        if (t < ASSEMBLE + HOLD + DISSOLVE) frame = requestAnimationFrame(tick);
        else {
          setPhase("done");
          running = false;
          timer = window.setTimeout(() => {
            due = true;
            maybePlay();
          }, REST);
        }
      };
      frame = requestAnimationFrame(tick);
    };

    // A run starts only when one is due and the card is on screen; one that comes due off screen waits for it.
    let visible = false;
    let due = true;
    let running = false;
    let first = true;
    const maybePlay = () => {
      if (!visible || !due || running) return;
      due = false;
      running = true;
      timer = window.setTimeout(play, first ? index * STAGGER : 0);
      first = false;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        maybePlay();
      },
      { threshold: 0.35 },
    );
    // On a fresh load the signature intro covers the page; start watching once it begins to fade.
    const watch = () => observer.observe(card);
    if (hasRevealed()) watch();
    else window.addEventListener(REVEAL_EVENT, watch, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener(REVEAL_EVENT, watch);
      observer.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [index]);

  const showContent = phase === "reveal" || phase === "done";

  return (
    <article
      ref={cardRef}
      data-ascii="surface"
      className={`${CARD} ${className}`}
      style={style}
      title={`Issued ${cert.issued} · ID ${cert.credentialId}`}
    >
      <div className={PANEL}>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          data-ascii="skip"
          className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono motion-reduce:hidden ${phase === "done" ? "hidden" : ""}`}
        />

        <div
          className={`flex flex-1 flex-col items-center gap-3 transition-[opacity,filter] ${showContent ? "opacity-100 blur-0 duration-700" : "opacity-0 blur-[2px] duration-300 motion-reduce:opacity-100 motion-reduce:blur-none"}`}
        >
          <div
            ref={tileRef}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.06] bg-white shadow-[0_6px_16px_-10px_rgba(30,30,60,0.35)] dark:border-white/[0.08] dark:bg-neutral-950"
          >
            {LOGOS[cert.logo]}
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <h3 className="text-[13px] leading-[1.3] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              <Decode text={cert.name} active={phase === "reveal"} />
            </h3>
            <p className="font-mono text-[10px] font-medium tracking-[0.08em] text-neutral-400 uppercase dark:text-neutral-500">
              <Decode text={cert.issuer} active={phase === "reveal"} />
            </p>
          </div>

          <a
            href={cert.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Verify ${cert.name} (${cert.issuer})`}
            className="group relative z-10 flex items-center gap-1 font-mono text-[10.5px] font-medium tracking-[0.1em] text-neutral-700 uppercase transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
          >
            <span className="text-[13px] transition-transform group-hover:-translate-x-0.5">(</span>
            Verify
            <span className="text-[13px] transition-transform group-hover:translate-x-0.5">)</span>
          </a>
        </div>
      </div>
    </article>
  );
}
