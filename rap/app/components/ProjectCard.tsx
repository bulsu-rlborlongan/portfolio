import Image from "next/image";
import type { Project } from "../data/projects";
import TagPills from "./TagPills";

// App card for the project deck, after the app-store spotlight: tag pills, icon and name, a short pitch,
// then the store badge.

const PLAY = (
  <svg viewBox="0 0 24 26" className="h-[18px] w-[17px] sm:h-5 sm:w-[19px]" aria-hidden="true">
    <path fill="#00D7FE" d="M1.1.6C.8.9.6 1.4.6 2v22c0 .6.2 1.1.5 1.4L13.4 13 1.1.6z" />
    <path fill="#FFCE00" d="m17.5 17.2-4.1-4.2 4.1-4.1 4.9 2.8c1.4.8 1.4 2.1 0 2.9l-4.9 2.6z" />
    <path fill="#FF3A44" d="M17.5 17.2 13.4 13 1.1 25.4c.5.5 1.2.5 2.1 0l14.3-8.2z" />
    <path fill="#00F076" d="M17.5 8.8 3.2.7C2.3.2 1.6.2 1.1.6L13.4 13l4.1-4.2z" />
  </svg>
);

const BADGE =
  "flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-[7px] border border-neutral-400/70 bg-black px-2.5 text-left text-white transition-[transform,border-color] hover:-translate-y-0.5 hover:border-neutral-200 sm:h-10 sm:gap-2 sm:px-3";

export default function ProjectCard({ project }: { project: Project }) {
  const badge = (
    <>
      {PLAY}
      <span className="flex flex-col leading-none">
        <span className="text-[7.5px] font-medium tracking-[0.02em] sm:text-[8px]">GET IT ON</span>
        <span className="text-[13px] font-semibold tracking-[-0.01em] sm:text-[15px]">Google Play</span>
      </span>
    </>
  );

  return (
    <div className="flex h-full flex-col justify-between">
      <TagPills tags={project.tags} />

      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[11px] bg-[#313439] shadow-[0_6px_16px_-10px_rgba(30,30,60,0.35)] sm:h-12 sm:w-12 sm:rounded-[12px]">
          <Image src={project.icon} alt="" fill unoptimized className="object-contain" />
        </div>
        <h3 className="text-[17px] leading-tight font-semibold tracking-[-0.02em] text-neutral-900 sm:text-[19px] dark:text-neutral-100">
          {project.name} <span className="text-neutral-400 dark:text-neutral-500">—</span> {project.tagline}
        </h3>
      </div>

      <p className="text-[12.5px] leading-[1.5] text-neutral-500 sm:text-[13.5px] dark:text-neutral-400">
        {project.description}
      </p>

      {project.playStore ? (
        <a
          href={project.playStore}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${project.name} on Google Play`}
          className={BADGE}
        >
          {badge}
        </a>
      ) : (
        // No listing yet: still a real button with the hover, it just goes nowhere.
        <button type="button" aria-label={`${project.name} on Google Play (coming soon)`} className={BADGE}>
          {badge}
        </button>
      )}
    </div>
  );
}
