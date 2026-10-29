"use client";

import { useEffect, useRef } from "react";

// Glyphs from sparse to dense; index 0 is never drawn.
const RAMP = " .·:-=+*";
const ROW = 16;
const COL = ROW * 0.62 * 1.4;
// Redraw at ~15fps; the drift is slow enough that more is wasted work.
const FRAME_MS = 66;

// Sum of a few drifting sine waves, shifted so only the crests are drawn. Returns 0–1, or <= 0 for empty cells.
function field(x: number, y: number, t: number) {
  return (
    (Math.sin(x * 0.006 + y * 0.004 + t * 0.00022) +
      Math.sin(x * 0.011 - y * 0.007 - t * 0.00017) * 0.6 +
      Math.sin(y * 0.013 + t * 0.00013) * 0.4 -
      0.55) /
    1.45
  );
}

// Full-viewport field of faint monospace glyphs that slowly drifts behind the page.
export default function AsciiBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const root = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let color = "";
    let font = "";

    const draw = (now: number) => {
      const t = reduced ? 0 : now - start;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = color;
      const cols = Math.ceil(w / COL) + 1;
      const rows = Math.ceil(h / ROW) + 1;
      for (let r = 0; r < rows; r++) {
        const y = r * ROW;
        for (let c = 0; c < cols; c++) {
          const x = c * COL;
          const v = field(x, y, t);
          if (v <= 0) continue;
          ctx.globalAlpha = 0.18 + 0.5 * v;
          ctx.fillText(RAMP[Math.min(RAMP.length - 1, 1 + Math.floor(v * (RAMP.length - 1)))], x, y);
        }
      }
      ctx.globalAlpha = 1;
    };

    const restyle = () => {
      color = root.classList.contains("dark") ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
      font = `${Math.round(ROW * 0.8)}px ${getComputedStyle(canvas).fontFamily}`;
      draw(performance.now());
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      // The canvas's own box, which excludes the scrollbar (unlike innerWidth).
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      restyle();
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden || now - last < FRAME_MS) return;
      last = now;
      draw(now);
    };

    resize();
    window.addEventListener("resize", resize);
    // ThemeToggle flips the `dark` class on <html>.
    const observer = new MutationObserver(restyle);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    if (!reduced) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 h-full w-full font-mono" />;
}
