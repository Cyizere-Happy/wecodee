import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Possibility } from "@/components/sections/Possibility";
import { Journey } from "@/components/sections/Journey";
import { LearningWithAI } from "@/components/sections/LearningWithAI";
import { Finale } from "@/components/sections/Finale";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-white"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Possibility />
        <Journey />
        <LearningWithAI />
        <Finale />
      </main>
      <Footer />
    </>
  );
}
