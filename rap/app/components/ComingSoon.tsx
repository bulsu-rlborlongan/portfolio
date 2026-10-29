import Link from "next/link";
import Frame from "./Frame";

// Placeholder for pages whose content isn't ready yet.
export default function ComingSoon({ eyebrow, back }: { eyebrow: string; back: string }) {
  return (
    <Frame>
      <section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-3.5 px-5 py-24 text-center sm:px-14">
        <p className="font-mono text-[11.5px] font-medium tracking-[0.07em] text-neutral-400 uppercase dark:text-neutral-500">
          {eyebrow}
        </p>
        <h1 className="text-[clamp(36px,4vw,52px)] leading-[1.1] font-semibold tracking-[-0.035em] text-neutral-900 dark:text-neutral-100">
          Coming soon.
        </h1>
        <Link
          href={back}
          className="mt-6 font-mono text-[13px] text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          ← back home
        </Link>
      </section>
    </Frame>
  );
}
