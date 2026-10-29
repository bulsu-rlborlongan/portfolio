import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import AsciiBackdrop from "./components/AsciiBackdrop";
import Intro from "./components/Intro";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rap Borlongan — Software Developer",
};

// Runs before paint so the saved theme is applied without a flash.
const themeScript = `(function(){try{var p=localStorage.getItem('theme');if(p!=='light'&&p!=='dark')p='system';var r=document.documentElement;r.classList.toggle('dark',p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches));r.dataset.theme=p;}catch(e){}})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-white font-sans text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        <Script id="theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Intro />
        <AsciiBackdrop />
        {children}
      </body>
    </html>
  );
}
