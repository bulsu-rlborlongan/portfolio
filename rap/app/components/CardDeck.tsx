"use client";

import Link from "next/link";
import { useState, type KeyboardEvent, type ReactNode } from "react";

// Spotlight deck after bryllim.com: one card in front, two tilted behind it. Clicking a side
// card swaps it to the front. The first card starts in front; empty slots stay blank.

type Slot = "left" | "center" | "right";

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const SLOT_STYLES: Record<Slot, string> = {
  center:
    "z-30 [transform:translateY(0)_rotate(0deg)_scale(1)] shadow-[0_26px_55px_-22px_rgba(10,10,10,0.3)] hover:[transform:translateY(-7px)_scale(1.015)] hover:shadow-[0_34px_65px_-22px_rgba(10,10,10,0.34)]",
  left: "z-10 cursor-pointer [transform:translateX(-40%)_translateY(14px)_rotate(-16deg)_scale(0.88)] shadow-[0_16px_32px_-18px_rgba(10,10,10,0.25)] hover:z-[25] hover:[transform:translateX(-45%)_translateY(2px)_rotate(-12deg)_scale(0.92)]",
  right:
    "z-20 cursor-pointer [transform:translateX(40%)_translateY(14px)_rotate(16deg)_scale(0.88)] shadow-[0_16px_32px_-18px_rgba(10,10,10,0.25)] hover:z-[25] hover:[transform:translateX(45%)_translateY(2px)_rotate(12deg)_scale(0.92)]",
};

// Cards listed in `fit` (by index) take their content's height instead of the fixed one, e.g. a screenshot card.
export default function CardDeck({ cards = [null, null, null], fit = [] }: { cards?: ReactNode[]; fit?: number[] }) {
  const [slots, setSlots] = useState<Slot[]>(["center", "left", "right"]);

  // Swap the chosen side card with whichever card is in front.
  const bringForward = (i: number) => {
    if (slots[i] === "center") return;
    setSlots((s) => s.map((slot, j) => (j === i ? "center" : slot === "center" ? s[i] : slot)));
  };

  const onKey = (i: number) => (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    bringForward(i);
  };

  return (
    <section id="projects" aria-labelledby="projects-label" className="scroll-mt-16 md:scroll-mt-44 pt-14 pb-24">
      {/* Label row after ascii-reveal's demo header, set in the caps eyebrow style. */}
      <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-5 font-mono text-[11.5px] font-medium tracking-[0.07em] text-neutral-400 uppercase sm:px-9 lg:px-16 dark:text-neutral-500">
        <h2 id="projects-label">Projects</h2>
        <Link
          href="/projects"
          className="text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          All projects →
        </Link>
      </div>
      <div className="relative h-[18.5rem] sm:h-[20rem]">
        {cards.slice(0, 3).map((content, i) => {
          const slot = slots[i];
          const side = slot !== "center";
          return (
            <article
              key={i}
              onClick={() => bringForward(i)}
              onKeyDown={side ? onKey(i) : undefined}
              role={side ? "button" : undefined}
              tabIndex={side ? 0 : undefined}
              aria-label={side ? `Bring card ${i + 1} to the front` : undefined}
              data-ascii="surface"
              className={`group absolute top-3 left-1/2 -ml-36 w-72 origin-bottom rounded-2xl border border-neutral-200 bg-white p-5 transition-[transform,box-shadow] duration-500 will-change-transform outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 sm:-ml-[10.25rem] sm:w-[20.5rem] dark:border-[#2a2a30] dark:bg-[#0c0c0f] ${fit.includes(i) ? "" : "h-[15rem] sm:h-[16.5rem]"} ${EASE} ${SLOT_STYLES[slot]}`}
            >
              {/* Links in a side card stay out of reach until it's brought forward. */}
              <div inert={side} className="h-full">
                {content}
              </div>
              {/* Side cards sit dimmed behind the front one until hovered. */}
              {side && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/40 transition-colors duration-300 group-hover:bg-transparent dark:bg-neutral-950/40"
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
