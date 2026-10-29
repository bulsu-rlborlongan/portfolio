import Link from "next/link";
import { FEATURED } from "../data/stack";
import Crosshair from "./Crosshair";

// Chip row after bryllim.com's stack block. The list lives in data/stack.ts; "+ more" and "view all" open /stack.
const SMALL_CAPS = "font-mono text-[11px] tracking-wider uppercase";

export default function Stack() {
  return (
    <section
      id="stack"
      className="relative scroll-mt-16 md:scroll-mt-44 border-t border-neutral-200 px-5 py-14 sm:px-9 lg:px-16 dark:border-neutral-800"
    >
      <Crosshair className="-top-[5px] -left-[5px]" />
      <Crosshair className="-top-[5px] -right-[5px]" />

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className={`${SMALL_CAPS} text-neutral-400`}>Stack</h2>
        <Link
          href="/stack"
          className={`${SMALL_CAPS} text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100`}
        >
          view all →
        </Link>
      </div>

      <ul className="flex flex-wrap gap-2">
        {FEATURED.map((name) => (
          <li
            key={name}
            data-ascii="fade"
            className="rounded-md border border-neutral-200 bg-white px-2.5 py-1 font-mono text-[12px] text-neutral-600 dark:border-[#2a2a30] dark:bg-[#0c0c0f] dark:text-[#b8b8c0]"
          >
            {name}
          </li>
        ))}
        <li>
          <Link
            href="/stack"
            className="block rounded-md border border-dashed border-neutral-300 px-2.5 py-1 font-mono text-[12px] text-neutral-500 transition-colors hover:border-neutral-500 hover:text-neutral-900 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
          >
            + more
          </Link>
        </li>
      </ul>
    </section>
  );
}
