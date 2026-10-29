import type { ReactNode } from "react";
import Header from "./Header";

// The bordered centre column with the header, shared by every page.
export default function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-svh overflow-x-clip">
      <div className="relative mx-auto min-h-svh max-w-6xl border-x border-neutral-200 dark:border-neutral-800">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
