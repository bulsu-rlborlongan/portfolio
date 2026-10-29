import { LINKS } from "../data/links";
import CopyEmail from "./CopyEmail";
import ParticleBust from "./ParticleBust";

// 640px tall on desktop with 120px/112px around the text, like the ascii-reveal hero.
export default function Hero() {
  return (
    <section className="relative grid overflow-hidden lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative z-10 flex flex-col justify-center px-5 pt-4 pb-6 sm:px-9 sm:pb-20 lg:pt-[120px] lg:pb-[112px] lg:pl-16">
        <h1 className="max-w-xl text-[clamp(2.5rem,6vw,4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-neutral-900 dark:text-neutral-100">
          Software Developer.
        </h1>

        <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-neutral-600 dark:text-neutral-400">
          I build and design modern web and mobile applications, and I love exploring new technologies that can be
          shaped into tools that make a meaningful difference in people&apos;s lives.
        </p>

        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px]">
          {LINKS.map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                {label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
          <li>
            <CopyEmail />
          </li>
        </ul>
      </div>

      {/* Bust sits flush against the bottom-right of the frame, like the reference figure. Phones show it first,
          above the heading. */}
      <div className="relative order-first h-[22rem] sm:h-[28rem] lg:order-none lg:h-auto">
        <ParticleBust />
      </div>
    </section>
  );
}
