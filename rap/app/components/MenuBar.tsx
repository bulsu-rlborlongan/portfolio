"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Crosshair from "./Crosshair";
import { replaySections } from "./SectionsReveal";

// Sizes follow the ascii-reveal toolbar: 11px mono label, 3px-padded pill, 13px/500 buttons at 7px 12px,
// a 110px speed slider and a solid Replay button pushed to the right.
const ITEMS = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "certificates", label: "Certificates" },
] as const;

type Item = (typeof ITEMS)[number]["id"];

const LABEL =
  "shrink-0 font-mono text-[11px] font-medium tracking-[0.08em] text-neutral-400 uppercase dark:text-neutral-500";

// Liquid pill: one indicator behind the buttons. Moving to a new item, its leading edge sets off first and the
// trailing edge follows LAG ms later, so the pill stretches across the gap and then pulls together, squashing a
// little as it goes.
const GLIDE = 520;
const LAG = 90;
const LIQUID = "cubic-bezier(0.65, 0, 0.2, 1)";

// Edges of the pill, in px from the left and right of the track.
type Edges = { left: number; right: number };

export default function MenuBar() {
  const [active, setActive] = useState<Item>("projects");
  const [speed, setSpeed] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [edges, setEdges] = useState<Edges | null>(null);
  const [heading, setHeading] = useState<"left" | "right" | null>(null);

  // Park the pill under the active button, and keep it there when the bar reflows (fonts, wrapping, resize).
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const button = track.querySelector<HTMLElement>(`[data-item="${active}"]`);
      if (!button) return;
      const left = button.offsetLeft;
      setEdges({ left, right: track.clientWidth - left - button.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [active]);

  // "R" reloads the sections below the hero, unless the key is meant for a text field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "r" || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input:not([type=range]), textarea, [contenteditable]")) return;
      replaySections(speed);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [speed]);

  const select = (id: Item) => {
    if (id !== active) {
      const order = ITEMS.map((item) => item.id);
      setHeading(order.indexOf(id) > order.indexOf(active) ? "right" : "left");
      // Squash and rebound while it travels, like a drop pulled sideways.
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        pillRef.current?.animate(
          [
            { transform: "scale(1, 1)" },
            { transform: "scale(1.04, 0.84)", offset: 0.35 },
            { transform: "scale(0.98, 1.06)", offset: 0.75 },
            { transform: "scale(1, 1)" },
          ],
          { duration: GLIDE + LAG, easing: "ease-out" },
        );
      }
    }
    setActive(id);
    // Sections land later; scroll to one once it exists.
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // The edge on the side we're heading leads; the other one lags. Before the first click nothing animates.
  const pillStyle: CSSProperties | undefined = edges
    ? {
        left: edges.left,
        right: edges.right,
        transition: heading
          ? `left ${GLIDE}ms ${LIQUID} ${heading === "left" ? 0 : LAG}ms, right ${GLIDE}ms ${LIQUID} ${heading === "right" ? 0 : LAG}ms, translate 200ms ease-out, box-shadow 200ms ease-out`
          : "translate 200ms ease-out, box-shadow 200ms ease-out",
      }
    : undefined;

  return (
    <nav
      aria-label="Sections"
      className="sticky top-16 z-40 hidden border-y border-neutral-200 bg-white/60 backdrop-blur-[18px] backdrop-saturate-[1.6] dark:border-white/[0.09] dark:bg-neutral-950/60 md:block"
    >
      {/* Phones scroll the bar sideways; wider screens wrap it like the reference. */}
      <div className="flex items-center gap-4 overflow-x-auto overscroll-x-contain px-4 py-2.5 [scrollbar-width:none] sm:flex-wrap sm:gap-x-[22px] sm:gap-y-2.5 sm:overflow-visible sm:px-8 sm:py-3.5 [&::-webkit-scrollbar]:hidden">
        <div className="flex shrink-0 items-center gap-2">
          <span className={LABEL}>Menu</span>
          <div
            ref={trackRef}
            className="group/menu relative inline-flex shrink-0 rounded-full border border-black/10 bg-black/[0.03] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-white/[0.11] dark:bg-[rgba(20,20,26,0.44)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            {/* The active pill lifts with its button on hover. */}
            <span
              ref={pillRef}
              aria-hidden="true"
              style={pillStyle}
              className={`pointer-events-none absolute inset-y-[3px] rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,1),0_0_0_1px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] group-has-[[aria-pressed=true]:hover]/menu:-translate-y-[1.5px] group-has-[[aria-pressed=true]:hover]/menu:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_0_0_1px_rgba(0,0,0,0.1),0_8px_16px_-8px_rgba(0,0,0,0.3)] motion-reduce:!transition-none dark:bg-white/[0.086] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_0_1px_rgba(255,255,255,0.11)] dark:group-has-[[aria-pressed=true]:hover]/menu:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_0_1px_rgba(255,255,255,0.11),0_8px_18px_-8px_rgba(0,0,0,0.8)] ${edges ? "" : "invisible"}`}
            />
            {ITEMS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                data-item={id}
                aria-pressed={active === id}
                onClick={() => select(id)}
                className={`relative rounded-full px-3 py-[7px] text-[13px] leading-none font-medium whitespace-nowrap transition-[color,background-color,translate,scale,box-shadow] duration-200 ease-out hover:-translate-y-[1.5px] active:translate-y-0 active:scale-[0.96] active:duration-100 motion-reduce:hover:translate-y-0 ${
                  active === id
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 hover:bg-neutral-900/[0.06] hover:text-neutral-900 hover:shadow-[0_6px_14px_-8px_rgba(0,0,0,0.3)] dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-neutral-100 dark:hover:shadow-[0_6px_14px_-8px_rgba(0,0,0,0.7)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <label htmlFor="intro-speed" className={LABEL}>
            Speed
          </label>
          <input
            id="intro-speed"
            type="range"
            min={0.4}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-[110px] touch-manipulation accent-neutral-900 dark:accent-neutral-100"
          />
          <output
            htmlFor="intro-speed"
            className="min-w-[3.5ch] font-mono text-[13px] font-medium text-neutral-900 tabular-nums dark:text-neutral-100"
          >
            {speed.toFixed(1)}×
          </output>
        </div>

        <button
          type="button"
          onClick={() => replaySections(speed)}
          aria-keyshortcuts="R"
          className="order-first inline-flex shrink-0 items-center gap-2.5 rounded-full bg-neutral-900 px-3.5 py-[9px] text-[13px] leading-none font-medium text-white transition-[background-color,box-shadow,transform,filter] duration-150 hover:bg-neutral-800 hover:shadow-[0_6px_18px_-8px_rgba(0,0,0,0.45)] active:translate-y-px active:scale-[0.98] active:brightness-[0.94] sm:order-none sm:ml-auto dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200 dark:hover:shadow-[0_6px_18px_-8px_rgba(237,237,239,0.45)]"
        >
          Replay
          <kbd className="hidden font-mono text-[11px] font-medium opacity-55 [@media(hover:hover)]:inline">R</kbd>
        </button>
      </div>
      <Crosshair className="-top-[5px] -left-[5px]" />
      <Crosshair className="-top-[5px] -right-[5px]" />
      <Crosshair className="-bottom-[5px] -left-[5px]" />
      <Crosshair className="-right-[5px] -bottom-[5px]" />
    </nav>
  );
}
