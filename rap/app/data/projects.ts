// Featured projects for the home deck.

export type Project = {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  // The first tag is drawn as the highlighted pill.
  tags: string[];
  // Store listing; without one the badge is a button that goes nowhere.
  playStore?: string;
};

// Website showcase cards: a screenshot on top, then the name, description and tag pills. The whole card links out.
export type Showcase = {
  name: string;
  description: string;
  image: string;
  // Screenshot's pixel size, so the card can show it whole at its own aspect ratio.
  imageSize: [number, number];
  href: string;
  // The first tag is drawn as the highlighted pill.
  tags: string[];
};

export const SHOWCASES: Showcase[] = [
  {
    name: "PulseChain",
    description: "A web blood donation management system secured on Hyperledger Fabric.",
    image: "/pulsechain-landing.webp",
    imageSize: [1836, 876],
    href: "https://pulsechain.website/landing",
    tags: ["Blockchain", "React", "Node.js"],
  },
  {
    name: "TrAIcePH",
    description: "Traces public funds and surfaces evidence-backed signals for citizens and auditors.",
    image: "/traiceph-landing.webp",
    imageSize: [1838, 878],
    href: "https://traiceph.website/",
    tags: ["AI", "Next.js", "MapLibre GL JS"],
  },
];

export const PROJECTS: Project[] = [
  {
    name: "PulseChain",
    tagline: "Blood Donation",
    description: "Mobile blood donation application secured on Hyperledger Fabric.",
    icon: "/pulsechain-logo.png",
    tags: ["Blockchain", "React Native", "Expo"],
  },
];
