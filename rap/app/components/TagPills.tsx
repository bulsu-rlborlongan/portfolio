// Tag pills shared by the deck cards: the first tag is drawn solid between heavy curved brackets, the rest outlined.

// Heavy curved bracket for the lead pill; `flip` turns the opening one into the closing one.
function Bracket({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 6 14" className={`h-3 w-1.5 ${flip ? "-scale-x-100" : ""}`} aria-hidden="true">
      <path d="M4.6 1.4C2.4 3.6 1.6 5.4 1.6 7s.8 3.4 3 5.6" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

const PILL =
  "flex h-5 items-center rounded-full border px-2 font-mono text-[9px] font-medium tracking-[0.04em] uppercase sm:h-[22px] sm:px-2.5 sm:text-[10.5px] sm:tracking-[0.06em]";

export default function TagPills({ tags }: { tags: string[] }) {
  const [lead, ...rest] = tags;
  return (
    <ul className="flex flex-wrap gap-1 sm:gap-1.5">
      <li
        className={`${PILL} gap-1 border-neutral-900 bg-neutral-900 text-white sm:gap-1.5 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950`}
      >
        <Bracket />
        {lead}
        <Bracket flip />
      </li>
      {rest.map((tag) => (
        <li key={tag} className={`${PILL} border-neutral-300 text-neutral-500 dark:border-[#34343b] dark:text-neutral-400`}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
