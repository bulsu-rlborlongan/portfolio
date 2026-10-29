import Image from "next/image";
import { LINKS } from "../data/links";
import CopyEmail from "./CopyEmail";
import Crosshair from "./Crosshair";

const SECTIONS = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "certificates", label: "Certificates" },
];

const LABEL = "font-mono text-[11.5px] font-medium tracking-[0.07em] text-neutral-400 uppercase dark:text-neutral-500";
const LINK = "text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100";

// Closing block for the home page: a sign-off with the profile links, the section shortcuts, then a copyright row,
// all over an oversized, faded copy of the signature.
export default function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-neutral-200 dark:border-neutral-800">
      <Crosshair className="-top-[5px] -left-[5px]" />
      <Crosshair className="-top-[5px] -right-[5px]" />

      {/* White ink like the header's; inverted for the light theme. The stacked phone footer is much taller, so
          there it sits higher and wider to stay in view instead of sinking under the bottom edge. */}
      <Image
        src="/signature.png"
        alt=""
        width={940}
        height={345}
        className="pointer-events-none absolute right-[-10%] bottom-8 -z-10 w-[110%] max-w-[760px] lg:right-[-6%] lg:bottom-[-18%] lg:w-[85%] opacity-[0.07] invert select-none dark:opacity-[0.09] dark:invert-0"
      />

      <div className="flex flex-col gap-12 px-5 pt-16 pb-10 sm:px-9 lg:flex-row lg:items-start lg:justify-between lg:px-16">
        <div className="max-w-md">
          <p className={LABEL}>Contact</p>
          <h2 className="mt-4 text-[clamp(1.75rem,3.6vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-neutral-900 dark:text-neutral-100">
            Let&apos;s build something people use.
          </h2>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px]">
            {LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
                  {label} <span aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
            <li>
              <CopyEmail />
            </li>
          </ul>
        </div>

        <nav aria-label="Footer">
          <p className={LABEL}>Sections</p>
          <ul className="mt-4 grid w-fit grid-cols-[auto_auto] gap-x-10 gap-y-2.5 text-[14px] font-medium lg:grid-cols-1">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className={LINK}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-neutral-200 px-5 py-5 font-mono text-[11.5px] text-neutral-400 sm:px-9 lg:px-16 dark:border-neutral-800 dark:text-neutral-500">
        <p>© 2026 Rap Borlongan</p>
        <a href="#" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
