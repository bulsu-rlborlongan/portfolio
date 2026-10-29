import Image from "next/image";
import Link from "next/link";
import Crosshair from "./Crosshair";
import MobileMenu from "./MobileMenu";
import SoundToggle from "./SoundToggle";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="flex h-16 items-center justify-between px-5 sm:px-9">
        <Link href="/" aria-label="Rap Borlongan — home" className="-ml-1 inline-flex items-center">
          {/* The signature is white ink; invert it so it reads on the light theme. */}
          {/* data-intro-target: where the intro signature lands. */}
          <Image
            src="/signature.png"
            alt="Rap"
            width={940}
            height={345}
            priority
            data-intro-target
            className="h-10 w-auto invert dark:invert-0"
          />
        </Link>
        {/* Phones get the burger menu instead; the toggles move into its sheet. */}
        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <SoundToggle />
        </div>
        <MobileMenu />
      </div>
      <Crosshair className="-bottom-[5px] -left-[5px]" />
      <Crosshair className="-right-[5px] -bottom-[5px]" />
    </header>
  );
}
