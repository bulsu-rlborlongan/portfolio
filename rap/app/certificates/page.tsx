import type { Metadata } from "next";
import { CertificateGrid } from "../components/Certificates";
import Crosshair from "../components/Crosshair";
import Frame from "../components/Frame";

export const metadata: Metadata = {
  title: "Certificates — Rap Borlongan",
};

// Every certificate, under the intro that used to sit on the home page's Certificates section.
export default function CertificatesPage() {
  return (
    <Frame>
      <section className="relative isolate flex flex-col items-center gap-12 overflow-x-clip bg-[radial-gradient(120%_90%_at_70%_0%,color-mix(in_srgb,#9c6c84_10%,white)_0%,white_60%)] px-5 py-24 text-center sm:px-14 dark:bg-[radial-gradient(120%_90%_at_70%_0%,color-mix(in_srgb,#9c6c84_10%,var(--color-neutral-950))_0%,var(--color-neutral-950)_60%)]">
        <Crosshair className="-top-[5px] -left-[5px]" />
        <Crosshair className="-top-[5px] -right-[5px]" />

        <div className="flex max-w-[600px] flex-col items-center gap-3.5">
          <p className="font-mono text-[11.5px] font-medium tracking-[0.07em] text-neutral-400 uppercase dark:text-neutral-500">
            Certificates
          </p>
          <h1 className="text-[clamp(36px,4vw,52px)] leading-[1.1] font-semibold tracking-[-0.035em] text-neutral-900 dark:text-neutral-100">
            Always leveling up.
          </h1>
          <p className="text-[14.5px] leading-[1.6] text-neutral-500 dark:text-[#a3a3ac]">
            Courses and certifications I&apos;ve earned while learning new tools, from web and mobile development to
            DevOps and the cloud.
          </p>
        </div>

        <CertificateGrid scattered />
      </section>
    </Frame>
  );
}
