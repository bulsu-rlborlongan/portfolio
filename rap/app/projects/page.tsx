import type { Metadata } from "next";
import ComingSoon from "../components/ComingSoon";

export const metadata: Metadata = {
  title: "Projects — Rap Borlongan",
};

export default function ProjectsPage() {
  return <ComingSoon eyebrow="Projects" back="/#projects" />;
}
