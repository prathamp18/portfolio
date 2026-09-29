import Intro from "@/components/Intro";
import SmoothScroll from "@/components/SmoothScroll";
import Background from "@/components/Background";
import Chrome from "@/components/Chrome";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Projects from "@/components/Projects";
import Playground from "@/components/Playground";
import Skills from "@/components/Skills";
import Testimonials from "@/components/Testimonials";
import GitHubLive from "@/components/GitHubLive";
import Contact, { Marquee } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Intro />
      <SmoothScroll>
        <Chrome />
        <Background />
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <About />
          <Experience />
          <Projects />
          <Playground />
          <Skills />
          <Testimonials />
          <GitHubLive />
          <Contact />
        </main>
      </SmoothScroll>
    </>
  );
}
