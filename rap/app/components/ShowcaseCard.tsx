import Image from "next/image";
import type { Showcase } from "../data/projects";
import TagPills from "./TagPills";

// Website card for the project deck, after a profile card: the site's screenshot runs flush across the top, shown
// whole at its own aspect ratio, then the name, a short description, a hairline and the tag pills.
// The whole card opens the site.
export default function ShowcaseCard({ showcase }: { showcase: Showcase }) {
  return (
    // Cancel the deck's p-5 and 1px border so the screenshot covers the card's edge instead of sitting inside it.
    <a
      href={showcase.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit the ${showcase.name} website`}
      className="group/site -m-[21px] flex flex-col overflow-hidden rounded-2xl"
    >
      <div
        className="relative shrink-0 overflow-hidden rounded-2xl"
        style={{ aspectRatio: `${showcase.imageSize[0]} / ${showcase.imageSize[1]}` }}
      >
        <Image
          src={showcase.image}
          alt={`${showcase.name} website`}
          fill
          sizes="(min-width: 640px) 320px, 280px"
          className="origin-top object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/site:scale-[1.04]"
        />
      </div>

      <div className="flex flex-col gap-3 px-[21px] pt-2.5 pb-[17px]">
        <div>
          <h3 className="text-[16px] leading-tight font-semibold tracking-[-0.02em] text-neutral-900 sm:text-[17px] dark:text-neutral-100">
            {showcase.name}
          </h3>
          <p className="mt-1 text-[11.5px] leading-snug text-neutral-500 sm:text-[12px] dark:text-neutral-400">
            {showcase.description}
          </p>
        </div>

        <div className="border-t border-neutral-200 pt-3 dark:border-[#2a2a30]">
          <TagPills tags={showcase.tags} />
        </div>
      </div>
    </a>
  );
}
