"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROFILE, asset } from "@/data/site";
import { SunIcon, MoonIcon, DownloadIcon } from "./Icons";

const LINKS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "playground", label: "Playground" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
];

function flipTheme() {
  const cur = document.documentElement.dataset.theme || "dark";
  const next = cur === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
  window.dispatchEvent(new Event("themechange"));
  return next;
}

function ThemeToggle() {
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme || "dark");
    read();
    window.addEventListener("themechange", read);
    return () => window.removeEventListener("themechange", read);
  }, []);
  return (
    <button className="icon-btn nav-theme" onClick={flipTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

const go = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: "smooth" });
};

/* ⌘K command palette — jump anywhere, copy the email, grab the resume. */
function CommandPalette({ open, onClose }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef(null);

  const cmds = useMemo(
    () => [
      ...LINKS.map((l) => ({ label: `Go to ${l.label}`, hint: `#${l.id}`, run: () => go(l.id) })),
      { label: "Open resume (PDF)", hint: "pdf", run: () => window.open(asset(PROFILE.resume), "_blank") },
      { label: "Copy email address", hint: PROFILE.email, run: () => navigator.clipboard?.writeText(PROFILE.email) },
      { label: "Open GitHub", hint: "github", run: () => window.open(PROFILE.github, "_blank") },
      { label: "Open LinkedIn", hint: "linkedin", run: () => window.open(PROFILE.linkedin, "_blank") },
      { label: "Toggle light / dark", hint: "theme", run: flipTheme },
      { label: "Run A* pathfinding demo", hint: "playground", run: () => go("playground") },
    ],
    []
  );
  const list = cmds.filter((c) => (c.label + c.hint).toLowerCase().includes(q.toLowerCase()));

  useEffect(() => {
    if (open) { setQ(""); setSel(0); setTimeout(() => input.current?.focus(), 30); }
  }, [open]);

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(list.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter" && list[sel]) { list[sel].run(); onClose(); }
    else if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cmdk-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="cmdk card"
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmdk-in">
              <span className="mono">&gt;</span>
              <input ref={input} autoFocus value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey} placeholder="Type a command or section…" />
              <kbd className="mono">esc</kbd>
            </div>
            <ul className="cmdk-list">
              {list.map((c, i) => (
                <li key={c.label}>
                  <button className={i === sel ? "on" : ""} onMouseEnter={() => setSel(i)} onClick={() => { c.run(); onClose(); }}>
                    <span>{c.label}</span>
                    <span className="mono">{c.hint}</span>
                  </button>
                </li>
              ))}
              {!list.length && <li className="cmdk-empty mono">no matches — try “projects”</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const [cmd, setCmd] = useState(false);
  const [mac, setMac] = useState(true);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      let cur = "";
      for (const l of LINKS) {
        const el = document.getElementById(l.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) cur = l.id;
      }
      setActive(cur);
    };
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setCmd((c) => !c); }
    };
    const onOpen = () => setCmd(true);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-cmdk", onOpen);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-cmdk", onOpen);
    };
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="#home" className="nav-logo" aria-label="Back to top">
          <span className="nav-mark mono">&lt;pp/&gt;</span>
          <span className="nav-name">{PROFILE.name}</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className={active === l.id ? "is-active" : ""}>
              {l.label}
              {active === l.id && <motion.span layoutId="nav-pill" className="nav-pill" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="nav-k mono" onClick={() => setCmd(true)} aria-label="Open command palette">
            <kbd>{mac ? "⌘" : "Ctrl"}</kbd><kbd>K</kbd>
          </button>
          <ThemeToggle />
          <a className="btn btn-primary nav-cta" href={asset(PROFILE.resume)} target="_blank" rel="noopener noreferrer">
            <DownloadIcon size={13} /> Resume
          </a>
          <button className={`nav-burger ${open ? "open" : ""}`} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <span /><span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            {LINKS.map((l, i) => (
              <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>
                <span className="mono">0{i + 1}</span> {l.label}
              </a>
            ))}
            <a href={asset(PROFILE.resume)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
              <span className="mono">↓</span> Resume (PDF)
            </a>
          </motion.nav>
        )}
      </AnimatePresence>

      <CommandPalette open={cmd} onClose={() => setCmd(false)} />
    </header>
  );
}
