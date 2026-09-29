"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { TIMELINE, asset } from "@/data/site";

const LANE = { main: 0, feature: 1, ops: 2 };
const LANE_X = [18, 44, 70];

/* Career rendered as `git log --graph`: main is the spine, side branches merge back in. */
export default function Experience() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className="section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="eyebrow"><span className="idx">02</span> Experience</span>
          <h2 className="h-title"><span className="mono gitcmd">$ git log --graph</span> my <em>career</em>.</h2>
          <p className="lede">Newest commit on top. Production AI at an enterprise insurer, a startup backend, and the operations roles that taught me how real systems break.</p>
        </motion.div>

        <div className="gitlog" ref={ref}>
          <div className="gl-spine"><motion.div className="gl-fill" style={{ scaleY: line }} /></div>
          {TIMELINE.map((t, i) => {
            const lane = LANE[t.branch] ?? 0;
            return (
              <motion.div
                key={t.hash}
                className="gl-item"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.7, delay: 0.05 }}
              >
                <div className="gl-graph" aria-hidden="true">
                  {lane > 0 && (
                    <svg className="gl-branch" viewBox="0 0 90 120" preserveAspectRatio="none">
                      <path d={`M ${LANE_X[0]} 4 C ${LANE_X[0]} 34, ${LANE_X[lane]} 26, ${LANE_X[lane]} 60 C ${LANE_X[lane]} 94, ${LANE_X[0]} 86, ${LANE_X[0]} 116`} />
                    </svg>
                  )}
                  <span className={`gl-node lane-${lane} ${i === 0 ? "head" : ""}`} style={{ left: LANE_X[lane] }} />
                </div>

                <div className={`card gl-card ${i === 0 ? "gl-head" : ""}`}>
                  <div className="gl-top mono">
                    <span className="gl-hash">{t.hash}</span>
                    {i === 0 && <span className="gl-ref">(HEAD → main)</span>}
                    <span className={`gl-kind k-${t.kind.toLowerCase()}`}>{t.kind}</span>
                    <span className="gl-date">{t.date}</span>
                  </div>
                  <div className="gl-title-row">
                    {t.logo ? (
                      <span className="gl-logo"><img src={asset(t.logo)} alt="" /></span>
                    ) : (
                      <span className="gl-logo gl-logo-txt mono">{t.org.slice(0, 2).toUpperCase()}</span>
                    )}
                    <div>
                      <h3>{t.title}</h3>
                      <p className="gl-org">{t.org} · <span>{t.place}</span></p>
                    </div>
                  </div>
                  <ul>{t.points.map((p) => <li key={p}>{p}</li>)}</ul>
                  <div className="gl-tags">{t.tags.map((g) => <span key={g} className="chip">{g}</span>)}</div>
                </div>
              </motion.div>
            );
          })}
          <div className="gl-root mono"><span className="gl-node lane-0" style={{ left: LANE_X[0] }} /> initial commit — Shardayatan School, India · school topper, 10th &amp; 12th (science)</div>
        </div>
      </div>
    </section>
  );
}
