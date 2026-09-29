"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS, CATEGORIES } from "@/data/site";
import ProjectCover from "./ProjectCover";
import { GitHubIcon, ArrowUpRight, PlayIcon, CloseIcon } from "./Icons";

const CAT_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]));

function Pipeline({ steps }) {
  return (
    <div className="pipe">
      {steps.map((s, i) => (
        <div key={s} className="pipe-step">
          <motion.span
            className="pipe-box mono"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.09 }}
          >
            <b>{String(i + 1).padStart(2, "0")}</b>{s}
          </motion.span>
          {i < steps.length - 1 && (
            <span className="pipe-link" aria-hidden="true"><i style={{ animationDelay: `${i * 0.25}s` }} /></span>
          )}
        </div>
      ))}
    </div>
  );
}

function CaseStudy({ p, onClose }) {
  useEffect(() => {
    window.__lenis?.stop();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { window.__lenis?.start(); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  return (
    <motion.div className="cs-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.article
        className="cs card"
        role="dialog"
        aria-modal="true"
        aria-label={`${p.title} case study`}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        <button className="icon-btn cs-close" onClick={onClose} aria-label="Close case study"><CloseIcon /></button>
        <div className="cs-cover"><ProjectCover type={p.cover} live /></div>
        <div className="cs-body">
          <p className="cs-kicker mono">{CAT_LABEL[p.category]} · {p.where} · {p.date}</p>
          <h3 className="cs-title">{p.title}</h3>
          <p className="cs-tag">{p.tagline}</p>

          <div className="cs-metric">
            <span className="cs-mv">{p.metric.value}</span>
            <span className="cs-ml">{p.metric.label}</span>
          </div>

          <h4 className="mono">// the problem</h4>
          <p className="cs-problem">{p.problem}</p>

          <h4 className="mono">// architecture</h4>
          <Pipeline steps={p.arch} />

          <h4 className="mono">// what I built</h4>
          <ul className="cs-points">{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>

          <div className="pcard-stack">{p.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>

          <div className="pcard-links">
            {p.repo ? (
              <a href={p.repo} target="_blank" rel="noopener noreferrer" className="plink"><GitHubIcon size={15} /> Code <ArrowUpRight size={12} /></a>
            ) : (
              <span className="plink plink-muted mono">{p.note?.includes("internal") ? "built at " + p.where + " — code is proprietary" : "code on request"}</span>
            )}
            {p.demo && (
              <a href={p.demo} onClick={onClose} className="plink plink-demo"><PlayIcon size={11} /> {p.demoLabel || "Live demo"}</a>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function TiltCard({ project, index, onOpen }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);

  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${(px - 0.5) * 9}deg`);
    el.style.setProperty("--rx", `${(0.5 - py) * 7}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current; setHover(false); if (!el) return;
    el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg");
  };

  const p = project;
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={`pcard-shell ${p.featured ? "pcard-feat" : ""}`}
    >
      <div
        ref={ref}
        className={`pcard cat-${p.category}`}
        onPointerMove={onMove}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={onLeave}
      >
        <div className="pcard-glare" />
        <button className="pcard-cover" onClick={() => onOpen(p)} aria-label={`Open ${p.title} case study`}>
          <ProjectCover type={p.cover} live={hover} />
          <div className="pcard-badges">
            <span className="chip chip-cat">{CAT_LABEL[p.category]}</span>
            {p.note && <span className="chip chip-note">{p.note}</span>}
          </div>
          <div className="pcard-metric">
            <span>{p.metric.value}</span>
            <small>{p.metric.label}</small>
          </div>
        </button>

        <div className="pcard-body">
          <div className="pcard-meta mono"><span>{p.where}</span><span>· {p.date}</span></div>
          <h3 className="pcard-title">{p.title}</h3>
          <p className="pcard-tag">{p.tagline}</p>
          {p.featured && <ul className="pcard-points">{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>}
          <div className="pcard-stack">{p.stack.slice(0, 5).map((s) => <span key={s} className="chip">{s}</span>)}</div>
          <div className="pcard-links">
            <button className="plink plink-case" onClick={() => onOpen(p)}>Case study <ArrowUpRight size={12} /></button>
            {p.repo && (
              <a href={p.repo} target="_blank" rel="noopener noreferrer" className="plink"><GitHubIcon size={14} /> Code</a>
            )}
            {p.demo && (
              <a href={p.demo} className="plink plink-demo"><PlayIcon size={10} /> {p.demoLabel || "Demo"}</a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function Projects() {
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const list = PROJECTS;

  return (
    <section id="projects" className="section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="eyebrow"><span className="idx">03</span> Projects</span>
          <h2 className="h-title">Shipped, measured, <em>explained</em>.</h2>
          <p className="lede">
            Things I&apos;ve built on my own, from first principles. Every card opens a case study — the problem,
            the architecture, and the number it moved. My production work at Aviva and TourWalk lives under{" "}
            <a href="#experience" className="inline-link">Experience</a>.
          </p>
        </motion.div>

        <motion.div layout className="pgrid">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => <TiltCard key={p.id} project={p} index={i} onOpen={setOpen} />)}
          </AnimatePresence>
        </motion.div>
      </div>

      {mounted && createPortal(<AnimatePresence>{open && <CaseStudy p={open} onClose={close} />}</AnimatePresence>, document.body)}
    </section>
  );
}
