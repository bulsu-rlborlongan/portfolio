"use client";

import { useEffect, useRef, useState } from "react";

const EMAIL = "raplapenaborlongan@gmail.com";
const RESET_MS = 1600;

// Older Safari and non-secure origins have no async clipboard; fall back to a hidden textarea.
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    await copy(EMAIL);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), RESET_MS);
  };

  return (
    <button
      type="button"
      title={EMAIL}
      aria-label={`Copy email address ${EMAIL}`}
      onClick={onClick}
      className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
    >
      {copied ? "copied" : "email"} <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Email copied to clipboard" : ""}
      </span>
    </button>
  );
}
