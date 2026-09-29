"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SKILLS } from "@/data/site";

const ACCENT = { ai: "var(--acid)", lang: "var(--volt)", fw: "var(--text)", cloud: "var(--coral)", tools: "var(--muted)" };

/* A double helix of skills — the stack's DNA. Spins with the cursor; hover a group to isolate it. */
function Helix({ tags, focus }) {
  const box = useRef(null);
  const items = useRef([]);
  const rungs = useRef([]);
  const speed = useRef(0.006);
  const target = useRef(0.006);

  useEffect(() => {
    const N = tags.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rot = 0, raf;
    const tick = () => {
      const W = box.current?.offsetWidth || 400, H = box.current?.offsetHeight || 560;
      const R = Math.min(W * 0.36, 190);
      speed.current += (target.current - speed.current) * 0.06;
      if (!reduced) rot += speed.current;
      for (let i = 0; i < N; i++) {
        const el = items.current[i];
        if (!el) continue;
        const strand = i % 2;
        const k = (i - strand) / 2;
        const a = k * 0.45 + strand * Math.PI + rot;
        const x = Math.cos(a) * R, z = Math.sin(a);
        const y = (k / Math.ceil(N / 2) - 0.5) * (H * 0.86);
        const depth = (z + 1) / 2;
        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${0.7 + depth * 0.45})`;
        el.style.zIndex = String(Math.round(depth * 100));
        const dim = focus && tags[i].key !== focus;
        el.style.opacity = String(dim ? 0.07 : 0.12 + depth * depth * 0.88);
        if (!strand) {
          const rg = rungs.current[k];
          if (rg) {
            rg.style.transform = `translate(-50%, -50%) translate3d(0, ${y}px, 0) scaleX(${Math.abs(Math.cos(a)) * R * 2})`;
            rg.style.opacity = focus ? "0.05" : String(0.1 + Math.abs(Math.sin(a)) * 0.25);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [tags, focus]);

  const onMove = (e) => {
    const r = box.current.getBoundingClientRect();
    target.current = ((e.clientX - r.left) / r.width - 0.5) * 0.05;
  };

  return (
    <div ref={box} className="helix" onPointerMove={onMove} onPointerLeave={() => (target.current = 0.006)}>
      <span className="helix-axis" />
      {Array.from({ length: Math.ceil(tags.length / 2) }, (_, k) => (
        <i key={k} ref={(el) => (rungs.current[k] = el)} className="helix-rung" />
      ))}
      {tags.map((t, i) => (
        <span key={t.name + i} ref={(el) => (items.current[i] = el)} className="helix-tag mono" style={{ color: ACCENT[t.key] }}>
          {t.name}
        </span>
      ))}
    </div>
  );
}

export default function Skills() {
  const [focus, setFocus] = useState(null);
  const tags = SKILLS.flatMap((g) => g.items.map((name) => ({ name, key: g.key })));

  return (
    <section id="stack" className="section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="eyebrow"><span className="idx">05</span> Stack</span>
          <h2 className="h-title">The stack&apos;s <em>DNA</em>.</h2>
          <p className="lede">Move across the helix to spin it. Hover a group to isolate its strand.</p>
        </motion.div>

        <div className="skills-grid">
          <Helix tags={tags} focus={focus} />
          <div className="skill-groups">
            {SKILLS.map((g, i) => (
              <motion.div
                key={g.group}
                className={`card skill-group ${focus === g.key ? "on" : ""}`}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                style={{ "--acc": ACCENT[g.key] }}
                onPointerEnter={() => setFocus(g.key)}
                onPointerLeave={() => setFocus(null)}
                onFocus={() => setFocus(g.key)}
                onBlur={() => setFocus(null)}
                tabIndex={0}
              >
                <h3><span className="sg-bar" />{g.group}<span className="sg-n mono">{g.items.length}</span></h3>
                <div className="sg-items">
                  {g.items.map((s) => <span key={s} className="chip">{s}</span>)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
