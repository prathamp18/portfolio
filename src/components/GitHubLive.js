"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PROFILE, LANG_COLORS } from "@/data/site";
import { GitHubIcon, ArrowUpRight, StarIcon } from "./Icons";

const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

/* Pulls public repos straight from the GitHub API in the visitor's browser,
   so this section stays current without redeploying. */
export default function GitHubLive() {
  const [repos, setRepos] = useState(null);
  const [err, setErr] = useState(false);
  const [chart, setChart] = useState(true);

  useEffect(() => {
    let dead = false;
    const key = "gh-repos-" + PROFILE.githubUser;
    try {
      const c = JSON.parse(sessionStorage.getItem(key) || "null");
      if (c && Date.now() - c.t < 30 * 60 * 1000) { setRepos(c.d); return; }
    } catch (e) {}
    fetch(`https://api.github.com/users/${PROFILE.githubUser}/repos?per_page=100&sort=updated`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (dead) return;
        const list = d
          .filter((r) => !r.fork && r.name.toLowerCase() !== PROFILE.githubUser.toLowerCase())
          .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
          .slice(0, 9);
        setRepos(list);
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: list })); } catch (e) {}
      })
      .catch(() => !dead && setErr(true));
    return () => { dead = true; };
  }, []);

  return (
    <section id="github" className="section">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <span className="eyebrow"><span className="idx">07</span> Open source</span>
          <h2 className="h-title">Live from <em>GitHub</em>.</h2>
          <p className="lede">Fetched from the GitHub API as the page loads — always in sync with what I&apos;m pushing.</p>
        </motion.div>

        {chart && (
          <motion.div className="card gh-chart" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="gh-chart-head mono"><GitHubIcon size={14} /> contributions · last 12 months</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://ghchart.rshah.org/7a7dff/${PROFILE.githubUser}`} alt={`${PROFILE.githubUser} GitHub contribution chart`} loading="lazy" onError={() => setChart(false)} />
          </motion.div>
        )}

        <div className="repo-grid">
          {!repos && !err && Array.from({ length: 6 }, (_, i) => <div key={i} className="card repo repo-skel" />)}
          {err && (
            <div className="card repo-err mono">
              GitHub&apos;s API is rate-limiting this browser right now. <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">See every repo on github.com/{PROFILE.githubUser} ↗</a>
            </div>
          )}
          {repos?.map((r, i) => (
            <motion.div
              key={r.id}
              className="card repo"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <a className="repo-hit" href={r.html_url} target="_blank" rel="noopener noreferrer" aria-label={`${r.name} on GitHub`} />
              <div className="repo-top"><GitHubIcon size={18} /><ArrowUpRight size={14} /></div>
              <h3 className="repo-name mono">{r.name}</h3>
              <p className="repo-desc">{r.description || "No description yet."}</p>
              <div className="repo-foot mono">
                {r.language && <span className="repo-lang"><i style={{ background: LANG_COLORS[r.language] || "var(--faint)" }} />{r.language}</span>}
                {r.stargazers_count > 0 && <span className="repo-star"><StarIcon /> {r.stargazers_count}</span>}
                <span>Updated {fmt(r.pushed_at)}</span>
                {r.homepage && <a className="repo-demo" href={r.homepage} target="_blank" rel="noopener noreferrer">demo ↗</a>}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="center-row">
          <a className="btn btn-ghost" href={PROFILE.github} target="_blank" rel="noopener noreferrer">
            <GitHubIcon size={15} /> github.com/{PROFILE.githubUser}
          </a>
        </div>
      </div>
    </section>
  );
}
