import type { Metadata } from "next";
import Crosshair from "../components/Crosshair";
import Frame from "../components/Frame";
import { EXPERIENCE } from "../data/experience";

export const metadata: Metadata = {
  title: "Experience — Rap Borlongan",
};

// Card that holds an entry's details, styled like ascii-reveal's code blocks.
const CARD =
  "relative rounded-[14px] border border-neutral-200 bg-neutral-50 p-5 font-mono text-[13px] leading-[1.75] sm:p-6 dark:border-[#2a2a30] dark:bg-[#0c0c0f]";

// After ascii-reveal's "Get started" block: a sticky intro on the left, numbered entries on the right.
export default function ExperiencePage() {
  return (
    <Frame>
      <section className="relative grid gap-14 px-5 py-24 sm:px-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)] lg:gap-16">
        <Crosshair className="-top-[5px] -left-[5px]" />
        <Crosshair className="-top-[5px] -right-[5px]" />

        <div className="flex max-w-[460px] flex-col gap-3.5 self-start lg:sticky lg:top-32">
          <p className="font-mono text-[11.5px] font-medium tracking-[0.07em] text-neutral-400 uppercase dark:text-neutral-500">
            Experience
          </p>
          <h1 className="text-[clamp(28px,2.8vw,38px)] leading-[1.15] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-neutral-100">
            Learning by building
          </h1>
          <p className="text-[14.5px] leading-[1.6] text-neutral-500 dark:text-[#a3a3ac]">
            From regional startup challenges to industry hackathons and student organizations — working in teams to
            turn ideas into products, and picking up new tools along the way.
          </p>
        </div>

        <ol className="flex flex-col">
          {EXPERIENCE.map((item, i) => (
            <li
              key={item.org}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-neutral-200 py-10 first:pt-0 last:pb-0 sm:grid-cols-[3.5rem_minmax(0,1fr)] [&:not(:last-child)]:border-b dark:border-neutral-800"
            >
              <span className="pt-1 font-mono text-[13px] text-neutral-400 dark:text-neutral-500">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="flex min-w-0 flex-col gap-2">
                <h2 className="text-[20px] leading-tight font-semibold tracking-[-0.02em] text-neutral-900 dark:text-neutral-100">
                  {item.org}
                </h2>
                <p className="text-[14.5px] leading-[1.6] text-neutral-500 dark:text-[#a3a3ac]">{item.summary}</p>

                <div className={`${CARD} mt-4`}>
                  <span className="absolute top-4 right-4 rounded-full border border-neutral-200 px-2.5 py-0.5 font-sans text-[12px] text-neutral-500 dark:border-[#2a2a30] dark:bg-[#16161a] dark:text-[#a3a3ac]">
                    {item.date}
                  </span>

                  <p className="pr-24 text-[#c0326b] dark:text-[#f472b6]">{item.role}</p>
                  <p className="text-neutral-400 italic dark:text-neutral-500"># {item.location}</p>

                  {/* Several points hang off a thin line with a dot each, like a timeline; a single point stands alone. */}
                  <ul className="mt-4 flex flex-col gap-3">
                    {item.points.map((point, j) => (
                      <li
                        key={point}
                        className={`relative text-neutral-700 dark:text-[#d4d4da] ${item.points.length > 1 ? "pl-6" : ""}`}
                      >
                        {item.points.length > 1 && (
                          <>
                            {j < item.points.length - 1 && (
                              <span
                                aria-hidden="true"
                                className="absolute top-[11px] -bottom-[23px] left-[3px] w-px bg-neutral-300 dark:bg-neutral-700"
                              />
                            )}
                            <span
                              aria-hidden="true"
                              className="absolute top-[8px] left-0 h-[7px] w-[7px] rounded-full border border-neutral-400 bg-neutral-50 dark:border-neutral-500 dark:bg-[#0c0c0f]"
                            />
                          </>
                        )}
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </Frame>
  );
}
