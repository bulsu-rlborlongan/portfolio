"use client";

import { AsciiReveal, AsciiSkeleton } from "ascii-reveal";
import { useEffect, useRef, useState, type ReactNode } from "react";

// How long the skeletons stand in before the content decodes back in, at speed 1.
const LOAD_MS = 1200;

const REPLAY_EVENT = "sections:replay";

// Reload the sections below the hero, at the given speed multiplier (1 = normal).
export const replaySections = (speed = 1) =>
  window.dispatchEvent(new CustomEvent<number>(REPLAY_EVENT, { detail: speed }));

// Where each section sat when the reload started, so its skeleton covers the same space.
type Box = { key: string; top: number; height: number };

const EYEBROW = "text-[11.5px]";
const PAD = "px-5 sm:px-9 lg:px-16";

// A rough outline of each section, drawn in ASCII.
function Outline({ section }: { section: string }) {
  switch (section) {
    case "projects":
      return (
        <div className="pt-14">
          <div className={`flex justify-between ${PAD}`}>
            <AsciiSkeleton lines={1} widths={["9ch"]} className={EYEBROW} />
            <AsciiSkeleton lines={1} widths={["14ch"]} seed={2} className={EYEBROW} />
          </div>
          <div className="mt-[3.25rem] flex justify-center">
            <div className="flex h-[15rem] w-72 flex-col gap-5 rounded-2xl border border-neutral-200 p-5 sm:h-[16.5rem] sm:w-[20.5rem] dark:border-[#2a2a30]">
              <AsciiSkeleton rows={6} width="100%" seed={3} />
              <AsciiSkeleton lines={3} seed={4} className="text-[13px]" />
            </div>
          </div>
        </div>
      );
    case "experience":
      return (
        <div className="flex flex-col items-center gap-4 border-t border-neutral-200 px-5 py-24 dark:border-neutral-800">
          <AsciiSkeleton lines={1} widths={["11ch"]} className={EYEBROW} />
          <AsciiSkeleton lines={2} widths={["14ch", "16ch"]} seed={5} className="text-[clamp(28px,3.2vw,40px)]" />
          <AsciiSkeleton rows={2} width="13rem" seed={6} className="mt-6 text-[13px]" />
        </div>
      );
    case "stack":
      return (
        <div className={`border-t border-neutral-200 py-14 dark:border-neutral-800 ${PAD}`}>
          <div className="mb-4 flex justify-between">
            <AsciiSkeleton lines={1} widths={["6ch"]} className="text-[11px]" />
            <AsciiSkeleton lines={1} widths={["10ch"]} seed={7} className="text-[11px]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[9, 7, 11, 6, 10, 8, 12, 7].map((w, i) => (
              <AsciiSkeleton key={i} rows={1} width={`${w}ch`} seed={8 + i} className="text-[12px]" />
            ))}
          </div>
        </div>
      );
    case "certificates":
      return (
        <div className={`flex flex-col gap-10 border-t border-neutral-200 pt-14 pb-24 dark:border-neutral-800 ${PAD}`}>
          <div className="flex justify-between">
            <AsciiSkeleton lines={1} widths={["12ch"]} className={EYEBROW} />
            <AsciiSkeleton lines={1} widths={["20ch"]} seed={20} className={EYEBROW} />
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex w-full flex-col items-center gap-3 rounded-[18px] border border-black/[0.07] px-4 pt-6 pb-5 sm:w-[220px] dark:border-white/[0.11]"
              >
                <AsciiSkeleton rows={3} width={40} height={40} seed={21 + i} />
                <AsciiSkeleton lines={2} widths={["80%", "50%"]} seed={30 + i} className="w-full text-center text-[12px]" />
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className={`flex flex-col gap-4 border-t border-neutral-200 pt-16 pb-10 dark:border-neutral-800 ${PAD}`}>
          <AsciiSkeleton lines={1} widths={["8ch"]} className={EYEBROW} />
          <AsciiSkeleton lines={2} widths={["18ch", "13ch"]} seed={40} className="text-[clamp(1.5rem,3vw,2.1rem)]" />
          <AsciiSkeleton lines={1} widths={["30ch"]} seed={41} className="text-[13px]" />
        </div>
      );
  }
}

// Wraps the sections below the hero. Replay (see MenuBar) blanks them out behind ASCII skeletons for a moment,
// then decodes the real content back into place. The first page load is left alone.
export default function SectionsReveal({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState(1);
  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const loading = boxes !== null;

  useEffect(() => {
    let timer = 0;
    const onReplay = (e: Event) => {
      const content = contentRef.current;
      if (!content) return;
      const s = (e as CustomEvent<number>).detail;
      setSpeed(s);
      setBoxes(
        Array.from(content.children as HTMLCollectionOf<HTMLElement>, (el, i) => ({
          key: el.id || `${el.tagName.toLowerCase()}-${i}`,
          top: el.offsetTop,
          height: el.offsetHeight,
        })),
      );
      clearTimeout(timer);
      timer = window.setTimeout(() => setBoxes(null), LOAD_MS / s);
    };
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => {
      window.removeEventListener(REPLAY_EVENT, onReplay);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative">
      <AsciiReveal loading={loading} shimmer={false} revealOnMount={false} speed={speed}>
        {/* Kept in the layout while loading so nothing below shifts; the skeletons sit on top. */}
        <div ref={contentRef} inert={loading} className={loading ? "invisible" : undefined}>
          {children}
        </div>
      </AsciiReveal>
      {boxes && (
        <div aria-busy="true" aria-label="Loading sections" className="absolute inset-0 overflow-hidden">
          {boxes.map(({ key, top, height }) => (
            <div key={key} className="absolute inset-x-0 overflow-hidden" style={{ top, height }}>
              <Outline section={key} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
