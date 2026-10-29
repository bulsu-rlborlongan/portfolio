"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LINKS } from "../data/links";
import CopyEmail from "./CopyEmail";
import SoundToggle from "./SoundToggle";
import ThemeToggle from "./ThemeToggle";

// Phone navigation: the burger morphs into an X while a sheet drops down behind the header like a curtain, then
// its rows rise in one after another. Closing runs it back, quicker. From `md` up the MenuBar and the header
// toggles take over, and all of this is hidden.

const SECTIONS = [
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "stack", label: "Stack" },
  { id: "certificates", label: "Certificates" },
];

const CURTAIN = "cubic-bezier(0.76, 0, 0.24, 1)";
const RISE = "cubic-bezier(0.22, 1, 0.36, 1)";
const OPEN_MS = 700;
const CLOSE_MS = 480;
const FIRST_DELAY = 180; // rows start rising once the curtain is partway down
const STAGGER = 50;

const noop = () => () => {};

const LABEL = "font-mono text-[11px] font-medium tracking-[0.08em] text-neutral-400 uppercase dark:text-neutral-500";
const RULE = "h-px bg-neutral-200 dark:bg-neutral-800";
const LINK = "text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100";

// Burger lines: top and bottom swing into an X around the middle one, which shrinks away.
const LINE =
  "absolute left-0 h-[1.5px] w-full rounded-full bg-current transition-[translate,rotate,scale,opacity] duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] motion-reduce:transition-none";

// One row of the sheet. It rises and unblurs on its own delay when the menu opens; on close every row drops out
// at once so the curtain isn't kept waiting.
function Rise({ open, step, className = "", children }: { open: boolean; step: number; className?: string; children: ReactNode }) {
  const style: CSSProperties = {
    transitionTimingFunction: RISE,
    transitionDelay: open ? `${FIRST_DELAY + step * STAGGER}ms` : "0ms",
  };
  return (
    <div
      style={style}
      className={`transition-[opacity,translate,filter] motion-reduce:transition-none ${
        open ? "translate-y-0 opacity-100 blur-none duration-700" : "translate-y-5 opacity-0 blur-[6px] duration-200"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // The sheet is portalled to <body> (the header's backdrop blur would otherwise trap a fixed child inside it),
  // so it only renders once there is a document.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  // While open: hold the page still, take the page out of the tab order, close on Escape, and close if the
  // screen grows past the phone layout.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const main = document.querySelector("main");
    root.style.overflow = "hidden";
    main?.setAttribute("inert", "");

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus({ preventScroll: true });
    };
    const wide = window.matchMedia("(min-width: 48rem)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);

    return () => {
      root.style.overflow = "";
      main?.removeAttribute("inert");
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  // Navigating away (e.g. a section link from another page) closes the sheet.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // On the home page, close first so the page can scroll again, then glide to the section.
  const goTo = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname !== "/") return;
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `#${id}`);
    });
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative -mr-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-900 transition-[background-color,scale] duration-200 hover:bg-neutral-900/[0.05] active:scale-90 md:hidden dark:text-neutral-100 dark:hover:bg-white/[0.06]"
      >
        <span aria-hidden="true" className="relative block h-3 w-[18px]">
          <span className={`${LINE} top-0 ${open ? "translate-y-[5.25px] rotate-45" : ""}`} />
          <span className={`${LINE} top-[5.25px] ${open ? "scale-x-0 opacity-0" : ""}`} />
          <span className={`${LINE} top-[10.5px] ${open ? "-translate-y-[5.25px] -rotate-45" : ""}`} />
        </span>
      </button>

      {mounted &&
        createPortal(
          <div
            id="mobile-menu"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            inert={!open}
            style={{ transitionTimingFunction: CURTAIN, transitionDuration: `${open ? OPEN_MS : CLOSE_MS}ms` }}
            className={`fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-white/85 pt-16 backdrop-blur-xl backdrop-saturate-150 transition-[clip-path,visibility] motion-reduce:transition-none md:hidden dark:bg-neutral-950/85 ${
              open ? "visible [clip-path:inset(0_0_0_0)]" : "invisible [clip-path:inset(0_0_100%_0)]"
            }`}
          >
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 pt-8 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-9">
              <Rise open={open} step={0}>
                <p className={LABEL}>Menu</p>
              </Rise>

              <nav aria-label="Sections" className="mt-4">
                <ul>
                  {SECTIONS.map(({ id, label }, i) => (
                    <li key={id}>
                      <Rise open={open} step={i + 1}>
                        <a
                          href={`/#${id}`}
                          onClick={(e) => goTo(e, id)}
                          className="group flex items-baseline gap-4 py-2.5 text-[34px] leading-[1.05] font-semibold tracking-[-0.04em] text-neutral-900 transition-[color,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-x-1.5 dark:text-neutral-100"
                        >
                          <span className="w-6 font-mono text-[11px] font-medium tracking-normal text-neutral-400 tabular-nums dark:text-neutral-600">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {label}
                          <span
                            aria-hidden="true"
                            className="ml-auto self-center text-[18px] text-neutral-300 transition-[translate,color] duration-300 group-hover:translate-x-1 group-hover:text-neutral-900 dark:text-neutral-700 dark:group-hover:text-neutral-100"
                          >
                            →
                          </span>
                        </a>
                      </Rise>
                    </li>
                  ))}
                </ul>
              </nav>

              <Rise open={open} step={5} className="mt-6">
                <div className={RULE} />
              </Rise>

              <Rise open={open} step={6} className="mt-6">
                <p className={LABEL}>Elsewhere</p>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px]">
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
              </Rise>

              <Rise open={open} step={7} className="mt-auto pt-10">
                <div className={RULE} />
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <ThemeToggle />
                    <SoundToggle slider="above" />
                  </div>
                  <p className="font-mono text-[11px] text-neutral-400 dark:text-neutral-500">© 2026 Rap Borlongan</p>
                </div>
              </Rise>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
