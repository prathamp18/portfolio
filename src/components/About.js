"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { PROFILE, STATS, COURSEWORK, asset } from "@/data/site";
import Terminal from "./Terminal";

function CountUp({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const target = parseFloat(value);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf; const t0 = performance.now(); const dur = 1500;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref}>{Math.round(n)}</span>;
}

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <motion.div {...fadeUp}>
          <span className="eyebrow"><span className="idx">01</span> About</span>
          <h2 className="h-title">I don&apos;t just call an LLM. I make it <em>reliable</em>.</h2>
        </motion.div>

        <div className="about-grid">
          <motion.div className="about-copy" {...fadeUp}>
            <div className="about-id">
              <div className="avatar">
                {PROFILE.photo ? <img src={asset(PROFILE.photo)} alt={PROFILE.name} /> : <span className="mono">{PROFILE.initials}</span>}
                <i className="avatar-ring" />
              </div>
              <div>
                <p className="about-name">{PROFILE.name}</p>
                <p className="about-meta mono">CS @ York · Lassonde &apos;27 · {PROFILE.location}</p>
              </div>
            </div>
            <p>
              I&apos;m a Computer Science student at York University who likes the part of engineering where
              something that works in a demo has to work <strong>every time, for real users</strong>.
            </p>
            <p>
              At Aviva Canada — one of the country&apos;s largest insurers — I built LLM pipelines on AWS Bedrock that
              cut QA test-authoring time by 80%, a Copilot-style agent with 90% intent accuracy, and a full-stack
              agentic chatbot that made auto-insurance quotes 40% faster. The model was the easy part. The work was
              in the <strong>evaluation loops, context layers and guardrails</strong> around it.
            </p>
            <p>
              Outside work I go the other direction and build things from first principles: logistic regression
              with no ML libraries, A* with a great-circle heuristic that routes planes around live storms.
              Both are playable further down this page.
            </p>
            <div className="course-row">
              {COURSEWORK.map((c) => <span key={c} className="chip">{c}</span>)}
            </div>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }}>
            <Terminal />
          </motion.div>
        </div>

        <div className="stats-grid">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="card stat"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.07, duration: 0.6 }}
            >
              <span className="stat-val">
                {s.prefix}<CountUp value={s.value} /><small>{s.suffix}</small>
              </span>
              <span className="stat-lbl">{s.label}</span>            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
