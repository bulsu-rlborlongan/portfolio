import Link from "next/link";
import type { CSSProperties } from "react";
import { CERTIFICATES, type Certificate } from "../data/certificates";
import CertificateCard from "./CertificateCard";
import Crosshair from "./Crosshair";

// Section after ascii-reveal's "loading mascots" block: a label row and a centered row of glass certificate cards.
// The intro text lives on /certificates.

const HOME_COUNT = 4; // cards shown on the home page; the rest are on /certificates

// Scattered layout (/certificates): each card gets a small tilt and vertical nudge, cycled from these lists, like
// cards dropped on a desk. Hovering one straightens it and brings it to the front.
const TILTS = [-3, 2, -1, 2.5, -2, 1.5, -1.5, 3];
const NUDGES = [4, -6, 2, -4, -2, 4, -4, 2];
const SCATTERED =
  "rotate-(--tilt) translate-y-(--nudge) transition-[rotate,translate,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "hover:z-10 hover:translate-y-0 hover:scale-[1.03] hover:rotate-0";

// Home row: straight cards that lift on hover, with a deeper drop shadow and a brighter rim so the raised one stands out.
const LIFT =
  "w-full transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[220px] " +
  "hover:-translate-y-1.5 hover:border-black/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_28px_48px_-22px_rgba(30,30,60,0.28)] " +
  "dark:hover:border-white/[0.2] dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_28px_48px_-20px_rgba(0,0,0,0.85)]";

// Cards wrap in centered rows; full width on phones, 220px from `sm` up. Used here and on /certificates, where
// `scattered` packs them into a tighter grid of tilted cards.
export function CertificateGrid({
  certificates = CERTIFICATES,
  scattered = false,
}: {
  certificates?: Certificate[];
  scattered?: boolean;
}) {
  return (
    <div
      className={
        scattered
          ? "grid w-full grid-cols-1 justify-center gap-x-2 gap-y-3 sm:grid-cols-[repeat(auto-fill,220px)]"
          : "flex flex-wrap justify-center gap-5"
      }
    >
      {certificates.map((cert, i) => (
        <CertificateCard
          key={cert.credentialId}
          cert={cert}
          index={i}
          className={scattered ? SCATTERED : LIFT}
          style={
            scattered
              ? ({
                  "--tilt": `${TILTS[i % TILTS.length]}deg`,
                  "--nudge": `${NUDGES[i % NUDGES.length]}px`,
                } as CSSProperties)
              : undefined
          }
        />
      ))}
    </div>
  );
}

// Home page section: a caps label row like Projects and Stack ("All certifications" opens /certificates), then
// the latest certificates in a centered row.
export default function Certificates() {
  return (
    <section
      id="certificates"
      aria-labelledby="certificates-label"
      className="relative isolate flex scroll-mt-16 md:scroll-mt-44 flex-col gap-10 border-t border-neutral-200 bg-[radial-gradient(120%_90%_at_70%_0%,color-mix(in_srgb,#9c6c84_10%,white)_0%,white_60%)] px-5 pt-14 pb-24 sm:px-9 lg:px-16 dark:border-neutral-800 dark:bg-[radial-gradient(120%_90%_at_70%_0%,color-mix(in_srgb,#9c6c84_10%,var(--color-neutral-950))_0%,var(--color-neutral-950)_60%)]"
    >
      <Crosshair className="-top-[5px] -left-[5px]" />
      <Crosshair className="-top-[5px] -right-[5px]" />

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-mono text-[11.5px] font-medium tracking-[0.07em] text-neutral-400 uppercase dark:text-neutral-500">
        <h2 id="certificates-label">Certificates</h2>
        <Link
          href="/certificates"
          className="text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          All certifications →
        </Link>
      </div>

      <CertificateGrid certificates={CERTIFICATES.slice(0, HOME_COUNT)} />
    </section>
  );
}
