"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const AStarDemo = dynamic(() => import("./AStarDemo"), { ssr: false, loading: () => <div className="demo demo-loading" /> });
const LogRegDemo = dynamic(() => import("./LogRegDemo"), { ssr: false, loading: () => <div className="demo demo-loading" /> });

const TABS = [
  { key: "astar", label: "A* pathfinding", sub: "from AeroPath AI", file: "aeropath/search.py" },
  { key: "logreg", label: "Logistic regression", sub: "from Fraud Detection", file: "fraud/model.py" },
];

export default function Playground() {
  const [tab, setTab] = useState("astar");
  const cur = TABS.find((t) => t.key === tab);

  return (
    <section id="playground" className="section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="eyebrow"><span className="idx">04</span> Playground</span>
          <h2 className="h-title">Don&apos;t take my word for it. <em>Run it</em>.</h2>
          <p className="lede">
            Two algorithms from my projects, rewritten to run in your browser. Paint storms and watch A* route around
            them, or add data points and watch gradient descent find the boundary.
          </p>
        </motion.div>

        <motion.div
          className="card lab"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8 }}
        >
          <div className="lab-bar">
            <div className="lab-tabs" role="tablist" aria-label="Choose a demo">
              {TABS.map((t) => (
                <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? "on" : ""} onClick={() => setTab(t.key)}>
                  {tab === t.key && <motion.span layoutId="lab-pill" className="lab-pill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                  <span className="lab-tl">{t.label}</span>
                  <span className="lab-ts mono">{t.sub}</span>
                </button>
              ))}
            </div>
            <span className="lab-file mono">{cur.file}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
              {tab === "astar" ? <AStarDemo /> : <LogRegDemo />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
