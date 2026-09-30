"use client";

import { useEffect, useRef } from "react";

/*
  Generative cover art — one small, honest diagram per project, drawn on canvas.
  Static by default; animates while the card is hovered (`live`).
*/

function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const g = (v, f) => cs.getPropertyValue(v).trim() || f;
  return {
    acid: g("--acid", "#c4ff4d"),
    volt: g("--volt", "#7a7dff"),
    coral: g("--coral", "#ff6b5e"),
    text: g("--text", "#ececf3"),
    faint: g("--faint", "#5a5e70"),
    line: g("--line-strong", "rgba(190,200,255,.26)"),
    bg: g("--bg-2", "#0c0c13"),
  };
}

const DRAW = {
  // token stream: a Jira card on the left becomes rows of structured test cases
  llm(ctx, W, H, c, t) {
    const r = rng(3);
    ctx.strokeStyle = c.line; ctx.lineWidth = 1;
    ctx.strokeRect(W * 0.07, H * 0.25, W * 0.22, H * 0.5);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = c.faint; ctx.fillRect(W * 0.09, H * (0.31 + i * 0.08), W * (0.1 + r() * 0.08), 3); }
    // flowing tokens
    for (let i = 0; i < 26; i++) {
      const p = ((i / 26 + t * 0.25) % 1);
      const x = W * 0.3 + p * W * 0.34;
      const y = H * 0.5 + Math.sin(p * Math.PI * 2 + i) * H * 0.12 * (1 - p);
      ctx.fillStyle = i % 3 ? c.volt : c.acid;
      ctx.globalAlpha = 0.35 + 0.65 * Math.sin(p * Math.PI);
      ctx.fillRect(x, y, 6, 3);
    }
    ctx.globalAlpha = 1;
    // test case rows with checkmarks
    for (let i = 0; i < 6; i++) {
      const y = H * (0.2 + i * 0.11);
      const show = Math.min(1, Math.max(0, (t * 0.6 % 1.4) * 6 - i)) || (t === 0 ? 1 : 0);
      ctx.globalAlpha = 0.25 + 0.75 * show;
      ctx.strokeStyle = c.acid; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(W * 0.68, y + 4); ctx.lineTo(W * 0.69 + 2, y + 7); ctx.lineTo(W * 0.7 + 4, y); ctx.stroke();
      ctx.fillStyle = c.faint; ctx.fillRect(W * 0.73, y + 2, W * (0.12 + r() * 0.1), 3);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.volt; ctx.font = `600 ${Math.round(H * 0.07)}px "IBM Plex Mono", monospace`;
    ctx.fillText("{ }", W * 0.43, H * 0.86);
  },

  // vector store: document clusters, a query vector, nearest neighbours highlighted
  rag(ctx, W, H, c, t) {
    const r = rng(9);
    const cents = [[0.25, 0.35], [0.7, 0.3], [0.55, 0.72], [0.22, 0.75], [0.85, 0.7]];
    const pts = [];
    cents.forEach(([cx, cy], k) => {
      for (let i = 0; i < 26; i++) {
        const a = r() * 6.28, d = Math.sqrt(r()) * 0.09;
        pts.push([W * (cx + Math.cos(a) * d * 1.3), H * (cy + Math.sin(a) * d * 1.6), k]);
      }
    });
    const qa = t * 0.6;
    const q = [W * (0.52 + Math.cos(qa) * 0.08), H * (0.48 + Math.sin(qa) * 0.08)];
    const near = pts.map((p) => [Math.hypot(p[0] - q[0], p[1] - q[1]), p]).sort((a, b) => a[0] - b[0]).slice(0, 5);
    ctx.strokeStyle = c.acid; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
    near.forEach(([, p]) => { ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); });
    ctx.globalAlpha = 1;
    pts.forEach((p) => {
      const isN = near.some((n) => n[1] === p);
      ctx.fillStyle = isN ? c.acid : p[2] % 2 ? c.volt : c.faint;
      ctx.beginPath(); ctx.arc(p[0], p[1], isN ? 3.2 : 2, 0, 6.28); ctx.fill();
    });
    ctx.fillStyle = c.coral; ctx.beginPath(); ctx.arc(q[0], q[1], 5, 0, 6.28); ctx.fill();
    ctx.strokeStyle = c.coral; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(q[0], q[1], 14 + Math.sin(t * 3) * 3, 0, 6.28); ctx.stroke();
    ctx.globalAlpha = 1;
  },

  // multi-turn chat bubbles with a validation tick on each answer
  chat(ctx, W, H, c, t) {
    const rows = [[0, 0.46], [1, 0.34], [0, 0.4], [1, 0.3], [0, 0.26]];
    const shown = t === 0 ? rows.length : Math.floor((t * 1.2) % (rows.length + 2));
    rows.slice(0, Math.max(1, shown)).forEach(([side, w], i) => {
      const y = H * (0.12 + i * 0.16), h = H * 0.1, bw = W * w;
      const x = side ? W * 0.9 - bw : W * 0.1;
      ctx.fillStyle = side ? c.volt : "transparent";
      ctx.strokeStyle = side ? c.volt : c.line;
      ctx.globalAlpha = side ? 0.28 : 1;
      ctx.beginPath(); ctx.roundRect(x, y, bw, h, h / 2); side ? ctx.fill() : ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = side ? c.text : c.faint;
      ctx.fillRect(x + 12, y + h / 2 - 1.5, bw * 0.55, 3);
      if (side) {
        ctx.strokeStyle = c.acid; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x - 20, y + h / 2); ctx.lineTo(x - 15, y + h / 2 + 4); ctx.lineTo(x - 8, y + h / 2 - 4); ctx.stroke();
        ctx.lineWidth = 1;
      }
    });
  },

  // A* on a grid: storm cells, explored frontier, path hugging around them
  astar(ctx, W, H, c, t) {
    const cols = 22, rows = 12, cw = W / cols, ch = H / rows;
    const r = rng(5);
    const wall = new Set();
    [[8, 3, 2.6], [14, 8, 2.2], [5, 9, 1.6]].forEach(([x, y, rad]) => {
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) if (Math.hypot(i - x, j - y) < rad + r() * 0.6) wall.add(i + "," + j);
    });
    wall.forEach((k) => {
      const [i, j] = k.split(",").map(Number);
      ctx.fillStyle = c.coral; ctx.globalAlpha = 0.28; ctx.fillRect(i * cw + 1, j * ch + 1, cw - 2, ch - 2);
    });
    ctx.globalAlpha = 1;
    // a hand-planned path around the storms
    const path = [[1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 7], [9, 8], [10, 9], [11, 10], [12, 11], [13, 11], [14, 11], [15, 11], [16, 10], [17, 9], [18, 8], [19, 7], [20, 6]];
    const upto = t === 0 ? path.length : Math.floor(((t * 0.5) % 1.3) * path.length);
    ctx.fillStyle = c.volt; ctx.globalAlpha = 0.18;
    path.slice(0, upto).forEach(([i, j]) => { for (let d = -1; d <= 1; d++) if (!wall.has(i + "," + (j + d))) ctx.fillRect(i * cw + 1, (j + d) * ch + 1, cw - 2, ch - 2); });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = c.acid; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
    ctx.beginPath();
    path.slice(0, Math.max(2, upto)).forEach(([i, j], k) => (k ? ctx.lineTo : ctx.moveTo).call(ctx, i * cw + cw / 2, j * ch + ch / 2));
    ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = c.acid; ctx.beginPath(); ctx.arc(1 * cw + cw / 2, 6 * ch + ch / 2, 5, 0, 6.28); ctx.fill();
    ctx.strokeStyle = c.acid; ctx.beginPath(); ctx.arc(20 * cw + cw / 2, 6 * ch + ch / 2, 6, 0, 6.28); ctx.stroke();
  },

  // imbalanced scatter + sigmoid decision boundary
  fraud(ctx, W, H, c, t) {
    const r = rng(11);
    for (let i = 0; i < 180; i++) {
      const x = W * (0.08 + r() * 0.62), y = H * (0.2 + r() * 0.7);
      ctx.fillStyle = c.faint; ctx.globalAlpha = 0.7; ctx.fillRect(x, y, 2.4, 2.4);
    }
    for (let i = 0; i < 9; i++) {
      const x = W * (0.72 + r() * 0.2), y = H * (0.15 + r() * 0.35);
      ctx.fillStyle = c.coral; ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 6.28); ctx.fill();
    }
    ctx.globalAlpha = 1;
    const k = 14 + Math.sin(t * 1.5) * 4;
    ctx.strokeStyle = c.acid; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const u = i / 60, s = 1 / (1 + Math.exp(-k * (u - 0.68)));
      const x = W * (0.06 + u * 0.88), y = H * (0.88 - s * 0.72);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke(); ctx.lineWidth = 1;
    ctx.fillStyle = c.volt; ctx.font = `500 ${Math.round(H * 0.075)}px "IBM Plex Mono", monospace`;
    ctx.fillText("σ(wᵀx + b)", W * 0.08, H * 0.16);
  },

  // CI grid: rows of parallel test runs going green
  tests(ctx, W, H, c, t) {
    const cols = 20, rows = 8, gx = W * 0.08, gy = H * 0.18, cw = (W * 0.84) / cols, ch = (H * 0.64) / rows;
    const r = rng(21);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const done = t === 0 ? 1 : ((t * 0.7 - i * 0.03 - r() * 0.2) % 1.4 > 0 ? 1 : 0);
      const fail = (i * 7 + j * 3) % 37 === 0;
      ctx.fillStyle = fail ? c.coral : done ? c.acid : c.faint;
      ctx.globalAlpha = fail ? 0.9 : done ? 0.55 : 0.25;
      ctx.fillRect(gx + i * cw + 1.5, gy + j * ch + 1.5, cw - 3, ch - 3);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = c.text; ctx.font = `500 ${Math.round(H * 0.065)}px "IBM Plex Mono", monospace`;
    ctx.fillText("200+ passed · parallel", gx, H * 0.12);
  },

  // map route between two cities with cache hits along it
  booking(ctx, W, H, c, t) {
    const r = rng(33);
    ctx.strokeStyle = c.line;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 10) { const y = H * (0.12 + i * 0.13) + Math.sin(x * 0.02 + i) * 6; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.globalAlpha = 0.5; ctx.stroke();
    }
    ctx.globalAlpha = 1;
    const A = [W * 0.14, H * 0.72], B = [W * 0.84, H * 0.3], M = [W * 0.46, H * 0.02];
    ctx.strokeStyle = c.acid; ctx.setLineDash([6, 6]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(...A); ctx.quadraticCurveTo(...M, ...B); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 1;
    [A, B].forEach((p) => { ctx.fillStyle = c.volt; ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 6.28); ctx.fill(); });
    for (let i = 0; i < 4; i++) {
      const x = W * (0.2 + r() * 0.6), y = H * (0.55 + r() * 0.3);
      ctx.strokeStyle = c.coral; ctx.globalAlpha = 0.8; ctx.strokeRect(x, y, 26, 14);
      ctx.fillStyle = c.coral; ctx.font = `500 9px "IBM Plex Mono", monospace`; ctx.fillText("HIT", x + 4, y + 10);
    }
    ctx.globalAlpha = 1;
  },

  // transit map: a line closure, and the agent's detour around it
  transit(ctx, W, H, c, t) {
    const X = (u) => W * u, Y = (v) => H * v;
    const line = (pts, col, w = 5, dash = null) => {
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = "round"; ctx.lineCap = "round";
      if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = -t * 40; }
      ctx.beginPath(); pts.forEach(([u, v], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, X(u), Y(v))); ctx.stroke();
      ctx.setLineDash([]); ctx.lineWidth = 1;
    };
    const stn = (u, v, col = c.text) => { ctx.fillStyle = c.bg || "#0c0c13"; ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(X(u), Y(v), 5, 0, 6.283); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1; };
    // Line 1 (U-shape) and Line 2 (east-west)
    const l1 = [[0.3, 0.12], [0.3, 0.72], [0.5, 0.86], [0.7, 0.72], [0.7, 0.12]];
    line(l1, "#e8c33b", 5);
    line([[0.06, 0.5], [0.94, 0.5]], "#3fa45a", 5);
    // closed segment
    ctx.globalAlpha = 0.9; line([[0.3, 0.2], [0.3, 0.42]], c.coral, 7); ctx.globalAlpha = 1;
    const xm = X(0.3), ym = Y(0.31), r = 8;
    ctx.strokeStyle = c.coral; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xm - r, ym - r); ctx.lineTo(xm + r, ym + r); ctx.moveTo(xm + r, ym - r); ctx.lineTo(xm - r, ym + r); ctx.stroke(); ctx.lineWidth = 1;
    // agent's detour (shuttle bus around the closure)
    line([[0.3, 0.12], [0.18, 0.18], [0.16, 0.38], [0.3, 0.5]], c.acid, 3, [8, 6]);
    [[0.3, 0.12], [0.3, 0.5], [0.3, 0.72], [0.5, 0.86], [0.7, 0.72], [0.7, 0.5], [0.7, 0.12], [0.06, 0.5], [0.94, 0.5]].forEach(([u, v]) => stn(u, v));
    stn(0.3, 0.12, c.acid); stn(0.3, 0.5, c.acid);
    // alert card, inside the U below Line 2
    const fs = Math.round(Math.min(13, Math.max(10, H * 0.05)));
    ctx.font = `600 ${fs}px "IBM Plex Mono", monospace`;
    const msg = "⚠ Line 1 closed · shuttles";
    const tw = ctx.measureText(msg).width;
    const bx = X(0.5) - tw / 2 - 10, by = Y(0.55);
    ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.roundRect(bx, by, tw + 20, fs * 3.4, 8); ctx.fill();
    ctx.fillStyle = c.coral; ctx.fillText(msg, bx + 10, by + fs * 1.4);
    ctx.fillStyle = c.acid; ctx.fillText("↻ agent re-planned", bx + 10, by + fs * 2.8);
  },

  // candlesticks
  ticker(ctx, W, H, c, t) {
    const r = rng(44);
    let p = H * 0.55;
    const n = 26, w = (W * 0.84) / n;
    for (let i = 0; i < n; i++) {
      const o = p, cl = p + (r() - 0.48) * H * 0.12 + Math.sin(t + i * 0.4) * 2;
      const hi = Math.min(o, cl) - r() * H * 0.05, lo = Math.max(o, cl) + r() * H * 0.05;
      const up = cl < o;
      const x = W * 0.08 + i * w;
      ctx.strokeStyle = ctx.fillStyle = up ? c.acid : c.coral;
      ctx.beginPath(); ctx.moveTo(x + w / 2, hi); ctx.lineTo(x + w / 2, lo); ctx.stroke();
      ctx.globalAlpha = 0.85; ctx.fillRect(x + 2, Math.min(o, cl), w - 4, Math.max(2, Math.abs(cl - o))); ctx.globalAlpha = 1;
      p = Math.min(H * 0.85, Math.max(H * 0.15, cl));
    }
  },
};

export default function ProjectCover({ type, live = false }) {
  const ref = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let colors = readColors();
    let raf, last;
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = cv.offsetWidth, H = cv.offsetHeight;
      if (!W || !H) return;
      if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      (DRAW[type] || DRAW.llm)(ctx, W, H, colors, tRef.current);
    };
    const loop = (ts) => {
      if (last) tRef.current += (ts - last) / 1000;
      last = ts;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (live && !reduced) raf = requestAnimationFrame(loop);
    else { tRef.current = 0; draw(); }

    const obs = new MutationObserver(() => { colors = readColors(); draw(); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const ro = new ResizeObserver(draw);
    ro.observe(cv);
    return () => { cancelAnimationFrame(raf); obs.disconnect(); ro.disconnect(); };
  }, [type, live]);

  return <canvas ref={ref} className="cover-canvas" aria-hidden="true" />;
}
