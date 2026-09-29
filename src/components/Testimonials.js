"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/data/site";
import { QuoteIcon } from "./Icons";

export default function Testimonials() {
  return (
    <section id="words" className="section section-tight">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="eyebrow"><span className="idx">06</span> Code review</span>
          <h2 className="h-title">What my <em>reviewers</em> said.</h2>
        </motion.div>

        <div className="quotes">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              className="card quote"
              initial={{ opacity: 0, y: 30, rotateX: 12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="quote-head mono">
                <span className="q-approve">✓ approved</span>
                <span>{t.company}</span>
              </div>
              <QuoteIcon />
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className="q-av mono">{t.name.split(" ").map((w) => w[0]).join("")}</span>
                <span>
                  <b>{t.name}</b>
                  <small>{t.role}, {t.company}</small>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
