import CardDeck from "./components/CardDeck";
import Certificates from "./components/Certificates";
import ExperienceIntro from "./components/ExperienceIntro";
import Footer from "./components/Footer";
import Frame from "./components/Frame";
import Hero from "./components/Hero";
import MenuBar from "./components/MenuBar";
import ProjectCard from "./components/ProjectCard";
import SectionsReveal from "./components/SectionsReveal";
import ShowcaseCard from "./components/ShowcaseCard";
import Stack from "./components/Stack";
import { PROJECTS, SHOWCASES } from "./data/projects";

export default function Page() {
  return (
    <Frame>
      <Hero />
      <MenuBar />
      <SectionsReveal>
        <CardDeck
          cards={[
            ...PROJECTS.map((p) => <ProjectCard key={p.name} project={p} />),
            ...SHOWCASES.map((s) => <ShowcaseCard key={s.href} showcase={s} />),
          ]}
          fit={SHOWCASES.map((_, i) => PROJECTS.length + i)}
        />
        <ExperienceIntro />
        <Stack />
        <Certificates />
        <Footer />
      </SectionsReveal>
    </Frame>
  );
}
