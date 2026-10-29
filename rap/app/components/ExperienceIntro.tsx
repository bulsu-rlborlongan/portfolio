import Crosshair from "./Crosshair";
import SlideButton from "./SlideButton";

// Section heading after ascii-reveal's "Loading states" block: mono eyebrow, a two-line heading with
// a gradient lead-in, and a slide-to-open pill (in its glass tray) that opens the next page.
export default function ExperienceIntro() {
  return (
    <section
      id="experience"
      className="relative flex scroll-mt-16 md:scroll-mt-44 flex-col items-center border-t border-neutral-200 px-5 py-24 text-center sm:px-14 dark:border-neutral-800"
    >
      <Crosshair className="-top-[5px] -left-[5px]" />
      <Crosshair className="-top-[5px] -right-[5px]" />

      <header className="flex max-w-[640px] flex-col items-center gap-3.5">
        <p className="font-mono text-[11.5px] font-medium tracking-[0.07em] text-neutral-400 uppercase dark:text-neutral-500">
          Experience
        </p>
        <h2 className="text-[clamp(36px,4vw,52px)] leading-[1.1] font-semibold tracking-[-0.035em] text-neutral-900 dark:text-neutral-100">
          <span className="bg-[linear-gradient(100deg,#b5657f,#8a4f6c_45%,#4d5670)] bg-clip-text text-transparent dark:bg-[linear-gradient(100deg,#f1e9df,#d9b3c3_40%,#9c6c84,#8f97ad)]">
            2x hackathons
          </span>
          <br />
          and many more.
        </h2>
      </header>

      <div data-ascii="fade" className="mt-8 inline-flex rounded-full border border-black/10 bg-black/[0.03] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:border-white/[0.11] dark:bg-[rgba(20,20,26,0.44)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
        <SlideButton href="/experience" label="View experience" />
      </div>
    </section>
  );
}
