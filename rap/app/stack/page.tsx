import type { Metadata } from "next";
import Crosshair from "../components/Crosshair";
import Frame from "../components/Frame";
import { STACK } from "../data/stack";

export const metadata: Metadata = {
  title: "Tech Stack — Rap Borlongan",
};

const SMALL_CAPS = "font-mono text-[11px] tracking-wider uppercase";

// Full stack, grouped by category, with the same chips as the home page's Stack row.
export default function StackPage() {
  return (
    <Frame>
      <section className="relative flex flex-col gap-12 px-5 py-24 sm:px-14">
        <Crosshair className="-top-[5px] -left-[5px]" />
        <Crosshair className="-top-[5px] -right-[5px]" />

        <div className="flex max-w-[600px] flex-col gap-3.5">
          <h1 className="text-[clamp(36px,4vw,52px)] leading-[1.1] font-semibold tracking-[-0.035em] text-neutral-900 dark:text-neutral-100">
            Tech Stack
          </h1>
          <p className="text-[14.5px] leading-[1.6] text-neutral-500 dark:text-[#a3a3ac]">
            The tools, frameworks, and platforms I reach for — across the front end, back end, infrastructure, and AI.
          </p>
        </div>

        {Object.entries(STACK).map(([category, items]) => (
          <div key={category} className="flex flex-col gap-4">
            <h2 className={`${SMALL_CAPS} text-neutral-400`}>{category}</h2>
            <ul className="flex flex-wrap gap-2">
              {items.map((name) => (
                <li
                  key={name}
                  className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 font-mono text-[13px] text-neutral-600 dark:border-[#2a2a30] dark:bg-[#0c0c0f] dark:text-[#b8b8c0]"
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </Frame>
  );
}
