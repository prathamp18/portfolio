"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROFILE } from "@/data/site";

/* Boot sequence: a terminal compiles the portfolio, then the name decodes out of noise. */

const BOOT = [
  { t: "$ ssh visitor@pratham.dev", c: "cmd" },
  { t: "[ ok ] connecting to bedrock/claude ........ 38ms", c: "ok" },
  { t: "[ ok ] warming redis cache ................ hit", c: "ok" },
  { t: "[ ok ] compiling projects ................. done", c: "ok" },
  { t: "[ ok ] running 200+ regression tests ...... pass", c: "ok" },
];

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01<>/{}[]#$%&*+=";

function Scramble({ text, start }) {
  const [out, setOut] = useState(() => text.replace(/[^ ]/g, " "));
  useEffect(() => {
    let raf, t0;
    const dur = 900;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const done = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") s += " ";
        else if (i < done) s += text[i];
        else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const to = setTimeout(() => (raf = requestAnimationFrame(tick)), start);
    return () => { clearTimeout(to); cancelAnimationFrame(raf); };
  }, [text, start]);
  return <>{out}</>;
}

export default function Intro() {
  const [show, setShow] = useState(null);
  const [lines, setLines] = useState(0);

  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem("introSeen"); sessionStorage.setItem("introSeen", "1"); } catch (e) {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShow(false); return; }
    setShow(true);
    document.documentElement.style.overflow = "hidden";
    const timers = BOOT.map((_, i) => setTimeout(() => setLines(i + 1), 120 + i * 230));
    const end = setTimeout(() => setShow(false), 3700);
    return () => { timers.forEach(clearTimeout); clearTimeout(end); document.documentElement.style.overflow = ""; };
  }, []);

  if (show === null) return <div className="intro-blank" />;

  return (
    <AnimatePresence onExitComplete={() => (document.documentElement.style.overflow = "")}>
      {show && (
        <motion.div
          className="intro"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
          onClick={() => setShow(false)}
        >
          <div className="intro-grid" />
          <div className="intro-inner">
            <div className="intro-term mono" aria-hidden="true">
              {BOOT.slice(0, lines).map((l, i) => (
                <motion.div key={i} className={`it-line it-${l.c}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                  {l.t}
                </motion.div>
              ))}
              {lines < BOOT.length && <span className="it-caret" />}
            </div>

            <h1 className="intro-name">
              <Scramble text={PROFILE.name.toUpperCase()} start={1350} />
            </h1>
            <motion.span
              className="intro-rule"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.1, duration: 0.7, ease: "easeInOut" }}
            />
            <motion.p
              className="intro-line"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.35, duration: 0.6 }}
            >
              Software that <em>thinks</em>. Systems that <em>ship</em>.
            </motion.p>
            <motion.p className="intro-skip mono" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 0.8 }}>
              click anywhere to skip
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
