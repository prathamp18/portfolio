"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE, PROJECTS, SKILLS, TIMELINE, asset } from "@/data/site";

/* A tiny shell. Visitors can type real commands; output is built from site data. */

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: "smooth" });
};

function run(raw) {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  const c = (cmd || "").toLowerCase();
  const arg = args.join(" ").toLowerCase();

  switch (c) {
    case "":
      return [];
    case "help":
      return [
        { k: "dim", t: "available commands:" },
        { t: "  whoami        who is this guy" },
        { t: "  neofetch      system info, but it's me" },
        { t: "  experience    git log of my career" },
        { t: "  projects      ls ~/projects" },
        { t: "  skills        cat stack.json" },
        { t: "  open <x>      resume | github | linkedin" },
        { t: "  contact       how to reach me" },
        { t: "  goto <x>      scroll to a section" },
        { t: "  clear         clear the screen" },
        { k: "dim", t: "  (there may be an easter egg or two)" },
      ];
    case "whoami":
      return [
        { k: "acid", t: `${PROFILE.name} — ${PROFILE.roles[0]} / ${PROFILE.roles[1]}` },
        { t: "B.Sc. Hons Computer Science @ York University (Lassonde), class of 2027." },
        { t: "Prev. SWE Intern, AI & Automation @ Aviva Canada — LLM systems on AWS Bedrock." },
        { t: `Open to: ${PROFILE.openTo}.` },
      ];
    case "neofetch":
      return [
        { k: "neo", t: "   ____  ____     pratham@york" },
        { k: "neo", t: "  / __ \\/ __ \\    ------------" },
        { k: "neo", t: " / /_/ / /_/ /    OS: Computer Science, Lassonde '27" },
        { k: "neo", t: "/ ____/ ____/     Kernel: Python · Java · TypeScript" },
        { k: "neo", t: "/_/   /_/         Uptime: shipping since 2022" },
        { k: "neo", t: "                  Shell: AWS Bedrock · RAG · Spring Boot" },
        { k: "neo", t: "                  Packages: A*, RAG, Spring Boot, 200+ tests" },
        { k: "neo", t: "                  Locale: en · gu · hi — Toronto, ON" },
      ];
    case "experience":
    case "git":
      return TIMELINE.map((t) => ({ t: `${t.hash}  ${t.date.padEnd(28)} ${t.title} @ ${t.org.split(" —")[0]}` })).concat([{ k: "dim", t: "→ full log in the Experience section (goto experience)" }]);
    case "projects":
    case "ls":
      return PROJECTS.map((p) => ({ t: `${p.metric.value.padEnd(6)} ${p.title}  ${p.where === "Personal project" ? "" : `(${p.where})`}` }));
    case "skills":
    case "stack":
      return SKILLS.map((s) => ({ t: `"${s.group}": [${s.items.slice(0, 6).join(", ")}${s.items.length > 6 ? ", …" : ""}]` }));
    case "contact":
      return [
        { t: `email     ${PROFILE.email}` },
        { t: `github    ${PROFILE.github}` },
        { t: `linkedin  ${PROFILE.linkedin}` },
      ];
    case "open": {
      const map = { resume: asset(PROFILE.resume), github: PROFILE.github, linkedin: PROFILE.linkedin };
      if (!map[arg]) return [{ k: "err", t: "usage: open resume | github | linkedin" }];
      window.open(map[arg], "_blank");
      return [{ k: "acid", t: `opening ${arg}…` }];
    }
    case "goto":
    case "cd": {
      const ok = ["about", "experience", "projects", "playground", "stack", "contact"];
      const id = arg.replace(/^[#~/.]+/, "");
      if (!ok.includes(id)) return [{ k: "err", t: `goto: no such section. try: ${ok.join(", ")}` }];
      setTimeout(() => scrollTo(id), 150);
      return [{ k: "acid", t: `→ ${id}` }];
    }
    case "sudo":
      if (arg.includes("hire"))
        return [
          { k: "acid", t: "[sudo] password for recruiter: ********" },
          { k: "acid", t: "✓ permission granted. offer letter → " + PROFILE.email },
        ];
      return [{ k: "err", t: "nice try. (hint: sudo hire pratham)" }];
    case "rm":
      return [{ k: "err", t: "rm: refusing to delete production. I write tests for a reason." }];
    case "ping":
      return [{ t: "PONG — Redis cache is warm. 0.3 ms" }];
    case "exit":
      return [{ k: "dim", t: "there is no exit. only more projects. (scroll down)" }];
    default:
      return [{ k: "err", t: `command not found: ${cmd}. type 'help'` }];
  }
}

export default function Terminal() {
  const [hist, setHist] = useState([
    { k: "dim", t: "pratham-sh 2.0 — type 'help' to get started" },
  ]);
  const [val, setVal] = useState("");
  const [past, setPast] = useState([]);
  const [pi, setPi] = useState(-1);
  const body = useRef(null);
  const input = useRef(null);
  const typed = useRef(false);
  const touched = useRef(false);

  // auto-type a first command once, so the terminal shows something alive
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || typed.current) return;
      typed.current = true;
      obs.disconnect();
      const demo = "whoami";
      let i = 0;
      const id = setInterval(() => {
        if (touched.current) { clearInterval(id); return; }
        i++;
        setVal(demo.slice(0, i));
        if (i >= demo.length) {
          clearInterval(id);
          setTimeout(() => {
            if (touched.current) return;
            setHist((h) => [...h, { k: "cmd", t: demo }, ...run(demo)]);
            setVal("");
          }, 350);
        }
      }, 90);
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = body.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [hist]);

  const submit = (e) => {
    e.preventDefault();
    touched.current = true;
    const v = val;
    setVal("");
    setPi(-1);
    if (v.trim()) setPast((p) => [v, ...p].slice(0, 30));
    if (v.trim().toLowerCase() === "clear") { setHist([]); return; }
    setHist((h) => [...h, { k: "cmd", t: v }, ...run(v)]);
  };

  const onKey = (e) => {
    if (e.key === "ArrowUp" && past.length) {
      e.preventDefault();
      const n = Math.min(past.length - 1, pi + 1); setPi(n); setVal(past[n]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = pi - 1; setPi(Math.max(-1, n)); setVal(n < 0 ? "" : past[n]);
    }
  };

  return (
    <div className="term card" onClick={() => input.current?.focus({ preventScroll: true })}>
      <div className="term-bar">
        <span className="dot r" /><span className="dot y" /><span className="dot g" />
        <span className="term-title mono">pratham@york: ~</span>
      </div>
      <div className="term-body mono" ref={body} data-lenis-prevent>
        {hist.map((l, i) =>
          l.k === "cmd" ? (
            <div key={i} className="tl-cmd"><span className="tp">➜ ~</span> {l.t}</div>
          ) : (
            <div key={i} className={`tl-out ${l.k || ""}`}>{l.t}</div>
          )
        )}
        <form onSubmit={submit} className="term-in">
          <span className="tp">➜ ~</span>
          <input
            ref={input}
            value={val}
            onChange={(e) => { touched.current = true; setVal(e.target.value); }}
            onKeyDown={onKey}
            aria-label="Terminal input"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </form>
      </div>
      <div className="term-chips">
        {["help", "neofetch", "projects", "sudo hire pratham"].map((c) => (
          <button
            key={c}
            className="chip"
            onClick={(e) => { e.stopPropagation(); touched.current = true; setVal(""); setHist((h) => [...h, { k: "cmd", t: c }, ...run(c)]); }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
