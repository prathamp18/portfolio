"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PROFILE, MARQUEE, EMAILJS, asset } from "@/data/site";
import { GitHubIcon, LinkedInIcon, MailIcon, DownloadIcon } from "./Icons";

export function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((m, i) => (
          <span key={i} className="marquee-item">
            {m}<i>{"</>"}</i>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [copied, setCopied] = useState(false);

  const mailto = () => {
    const body = `${form.msg}\n\n— ${form.name}${form.email ? ` (${form.email})` : ""}`;
    window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent("Hello from your portfolio")}&body=${encodeURIComponent(body)}`;
  };

  const send = async (e) => {
    e.preventDefault();
    setState("sending");
    try {
      const r = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: EMAILJS.service,
          template_id: EMAILJS.template,
          user_id: EMAILJS.publicKey,
          template_params: { from_name: form.name, to_name: PROFILE.first, from_email: form.email, to_email: PROFILE.email, message: form.msg },
        }),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState("sent");
      setForm({ name: "", email: "", msg: "" });
    } catch (err) {
      setState("error");
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(PROFILE.email); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (e) {}
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <div className="contact-grid">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <span className="eyebrow"><span className="idx">08</span> Contact</span>
            <h2 className="h-title">Let&apos;s build something <em>intelligent</em>.</h2>
            <p className="lede">
              I&apos;m looking for Winter 2027 internships and Summer 2027 new-grad roles in software engineering,
              AI/ML engineering, data and quant — anywhere I can ship systems that need to be fast, correct and auditable.
              Toronto, remote, or relocating.
            </p>

            <button className="email-big mono" onClick={copy} aria-label="Copy email address">
              {PROFILE.email}
              <span className="email-hint">{copied ? "copied ✓" : "click to copy"}</span>
            </button>

            <div className="contact-links">
              <a className="icon-btn" href={PROFILE.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHubIcon /></a>
              <a className="icon-btn" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedInIcon /></a>
              <a className="icon-btn" href={`mailto:${PROFILE.email}`} aria-label="Email"><MailIcon /></a>
              <a className="btn btn-ghost" href={asset(PROFILE.resume)} target="_blank" rel="noopener noreferrer"><DownloadIcon size={14} /> Resume</a>
            </div>
          </motion.div>

          <motion.form
            className="card contact-form"
            onSubmit={send}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <p className="form-head mono">POST /api/hire-pratham <span>200 OK</span></p>
            <label>
              <span>Your name</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex, Engineering Manager" />
            </label>
            <label>
              <span>Your email</span>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@company.com" />
            </label>
            <label>
              <span>Message</span>
              <textarea required rows={5} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder="We're hiring for…" />
            </label>
            <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : "Send message →"}
            </button>
            {state === "sent" && <p className="form-note ok mono">✓ delivered — I&apos;ll reply soon.</p>}
            {state === "error" && (
              <p className="form-note err mono">
                Couldn&apos;t send from here. <button type="button" onClick={mailto}>Open your email app instead →</button>
              </p>
            )}
          </motion.form>
        </div>
      </div>

      <footer className="footer">
        <div className="container footer-inner mono">
          <span>© {new Date().getFullYear()} {PROFILE.name}</span>
          <span>Next.js · Three.js · Framer Motion — press <kbd>⌘K</kbd></span>
          <a href="#home">back to top ↑</a>
        </div>
      </footer>
    </section>
  );
}
