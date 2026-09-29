"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { PROFILE, asset } from "@/data/site";
import { GitHubIcon, LinkedInIcon, MailIcon, DownloadIcon } from "./Icons";

const NeuralCore = dynamic(() => import("./NeuralCore"), { ssr: false, loading: () => <div className="nc-wrap" /> });

function useTypewriter(words, type = 65, del = 32, pause = 1700) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const w = words[i];
    let t;
    if (!deleting && text.length < w.length) t = setTimeout(() => setText(w.slice(0, text.length + 1)), type);
    else if (!deleting) t = setTimeout(() => setDeleting(true), pause);
    else if (text.length > 0) t = setTimeout(() => setText(w.slice(0, text.length - 1)), del);
    else { setDeleting(false); setI((i + 1) % words.length); }
    return () => clearTimeout(t);
  }, [text, deleting, i, words, type, del, pause]);
  return text;
}

const rise = (d) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: d, duration: 0.85, ease: [0.22, 1, 0.36, 1] },
});


export default function Hero() {
  const role = useTypewriter(PROFILE.roles);
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 520], [1, 0]);
  const drift = useTransform(scrollY, [0, 520], [0, 80]);

  const socials = [
    { label: "GitHub", href: PROFILE.github, icon: <GitHubIcon /> },
    { label: "LinkedIn", href: PROFILE.linkedin, icon: <LinkedInIcon /> },
    { label: "Email", href: `mailto:${PROFILE.email}`, icon: <MailIcon /> },
  ];

  return (
    <section id="home" className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.div className="hero-status mono" {...rise(0.1)}>
            <span className="status-dot" /> Open to {PROFILE.openTo}
          </motion.div>

          <h1 className="hero-title">
            <motion.span className="hero-hi" {...rise(0.18)}>Hi, I&apos;m</motion.span>
            <span className="hero-name">
              {PROFILE.name.split(" ").map((w, i) => (
                <span key={w} className="hw-mask">
                  <motion.span
                    className={`hw ${i === 1 ? "hw-accent" : ""}`}
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{ delay: 0.28 + i * 0.12, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
            <motion.span className="hero-motto" {...rise(0.6)}>
              Software that <em>thinks</em>. Systems that <em>ship</em>.
            </motion.span>
          </h1>

          <motion.div className="hero-role mono" {...rise(0.8)}>
            <span className="prompt">~/pratham $</span> {role}
            <span className="caret" />
          </motion.div>

          <motion.p className="hero-tag" {...rise(0.9)}>{PROFILE.tagline}</motion.p>

          <motion.div className="hero-ctas" {...rise(1)}>
            <a href="#projects" className="btn btn-primary">See what I&apos;ve shipped →</a>
            <a href={asset(PROFILE.resume)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <DownloadIcon size={14} /> Resume
            </a>
          </motion.div>

          <motion.div className="hero-socials" {...rise(1.1)}>
            {socials.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="icon-btn">
                {s.icon}
              </a>
            ))}
            <span className="hero-focus mono">prev. <b>AI @ Aviva</b> · York CS &apos;27</span>
          </motion.div>
        </div>

        <motion.div className="hero-visual" style={{ opacity: fade, y: drift }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="hero-visual-inner"
          >
            <div className="hero-halo" />
            <NeuralCore />
                      </motion.div>
        </motion.div>
      </div>

      <a href="#about" className="scroll-cue mono" aria-label="Scroll to About">
        <span>scroll</span>
        <i />
      </a>
    </section>
  );
}
