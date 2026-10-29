// Experience, from the "Activities" section of the résumé plus the Philippine Startup Challenge and the
// Salesforce internship.
export type Experience = {
  org: string;
  summary: string;
  role: string;
  location: string;
  date: string;
  points: string[];
};

export const EXPERIENCE: Experience[] = [
  {
    org: "Philippine Startup Challenge 2026",
    summary: "One of the top 20 teams in Region 3.",
    role: "Top 20 · Region 3",
    location: "Central Luzon",
    date: "2026",
    points: ["Placed among the top 20 teams in Region 3 of the Philippine Startup Challenge 2026."],
  },
  {
    org: "IT & Business Process Association of the Philippines",
    summary: "Represented Bulacan State University at Can You HackIT.",
    role: "Developer",
    location: "Clark City, Pampanga",
    date: "2026",
    points: [
      "Selected to participate in Can You HackIT, representing Bulacan State University.",
      "Collaborating with a team to develop and present TrAIce — an AI-powered government transaction platform.",
    ],
  },
  {
    org: "Society for the Welfare of Information Technology Students",
    summary: "Training in the essential tools of modern software development.",
    role: "Member",
    location: "Malolos City, Bulacan",
    date: "2025 – 2026",
    points: ["Attended a 3-day training program to master essential tools for modern software development."],
  },
  {
    org: "Salesforce Supported Virtual Internship Program 2025",
    summary: "An 8-week virtual internship with Salesforce in the Philippines.",
    role: "Virtual Intern",
    location: "Remote · Philippines",
    date: "2025",
    points: ["Completed the 8-week Salesforce Supported Virtual Internship Program (September – November 2025)."],
  },
];
