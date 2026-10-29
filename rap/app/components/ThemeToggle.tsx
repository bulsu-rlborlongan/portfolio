"use client";

import { useEffect, useSyncExternalStore, type MouseEvent } from "react";

// Same feel as bryllim.com: a circular wipe that grows from where you clicked,
// falling back to a colour crossfade when View Transitions or motion aren't available.

type Pref = "system" | "light" | "dark";

const KEY = "theme";
const REVEAL_MS = 540;
const FADE_MS = 520;

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");
const isDark = (p: Pref) => p === "dark" || (p === "system" && darkQuery().matches);

function stored(): Pref {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(p: Pref) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark(p));
  root.dataset.theme = p;
}

let fadeTimer = 0;
function crossfade(p: Pref) {
  const root = document.documentElement;
  root.classList.add("theme-anim");
  apply(p);
  clearTimeout(fadeTimer);
  fadeTimer = window.setTimeout(() => root.classList.remove("theme-anim"), FADE_MS);
}

function setTheme(p: Pref, e: MouseEvent<HTMLButtonElement>) {
  try {
    localStorage.setItem(KEY, p);
  } catch {}
  const root = document.documentElement;
  // Nothing visibly changes (e.g. system -> dark on a dark device); just sync the active option.
  if (isDark(p) === root.classList.contains("dark")) return apply(p);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !document.startViewTransition) {
    return crossfade(p);
  }

  // Keyboard presses have no pointer position, so grow from the button itself.
  const box = e.currentTarget.getBoundingClientRect();
  const x = e.clientX || box.left + box.width / 2;
  const y = e.clientY || box.top + box.height / 2;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  document
    .startViewTransition(() => apply(p))
    .ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: "cubic-bezier(.32,.08,.24,1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}

// The pre-paint script in layout.tsx sets data-theme; read the active option from there.
const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const currentPref = () => (document.documentElement.dataset.theme as Pref | undefined) ?? "system";

const OPTIONS: { value: Pref; label: string; icon: React.ReactNode }[] = [
  {
    value: "system",
    label: "System theme",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9 21h6M12 17v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
  },
  {
    value: "light",
    label: "Light theme",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    value: "dark",
    label: "Dark theme",
    icon: (
      <path
        d="M20 13.6A8 8 0 1 1 10.4 4a6.2 6.2 0 0 0 9.6 9.6z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function ThemeToggle() {
  const pref = useSyncExternalStore(subscribe, currentPref, () => null);

  // Follow the device when it flips while "system" is selected.
  useEffect(() => {
    const query = darkQuery();
    const onChange = () => stored() === "system" && crossfade("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 p-[3px] dark:border-neutral-800">
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          type="button"
          title={label.replace(" theme", "")}
          aria-label={label}
          aria-pressed={pref === value}
          onClick={(e) => setTheme(value, e)}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 ${
            pref === value
              ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
              : "text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-100"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
            {icon}
          </svg>
        </button>
      ))}
    </div>
  );
}
