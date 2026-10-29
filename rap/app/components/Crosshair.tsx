// A small "+" that marks where a horizontal rule meets the frame lines.
// Position it with className, e.g. "-bottom-[5px] -left-[5px]".
export default function Crosshair({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute h-[9px] w-[9px] ${className}`}>
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-neutral-400 dark:bg-neutral-600" />
      <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-neutral-400 dark:bg-neutral-600" />
    </span>
  );
}
