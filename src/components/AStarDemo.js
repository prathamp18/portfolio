"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
  Interactive A* — the same algorithm behind AeroPath, on a grid.
  Paint storm cells, drag the plane or the destination, and compare against Dijkstra.
  8-directional moves, no corner-cutting, octile / euclidean / manhattan heuristics.
*/

class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(n, f) {
    const a = this.a; a.push([f, n]);
    let i = a.length - 1;
    while (i > 0) { const p = (i - 1) >> 1; if (a[p][0] <= a[i][0]) break; [a[p], a[i]] = [a[i], a[p]]; i = p; }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last; let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1; let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break; [a[m], a[i]] = [a[i], a[m]]; i = m;
      }
    }
    return top[1];
  }
}

const H = {
  octile: (dx, dy) => (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy),
  euclidean: (dx, dy) => Math.hypot(dx, dy),
  manhattan: (dx, dy) => dx + dy,
  none: () => 0,
};

function search(cols, rows, walls, s, g, heur) {
  const N = cols * rows;
  const gScore = new Float64Array(N).fill(Infinity);
  const came = new Int32Array(N).fill(-1);
  const closed = new Uint8Array(N);
  const order = [];
  const h = H[heur];
  const gx = g % cols, gy = (g / cols) | 0;
  const heap = new Heap();
  gScore[s] = 0;
  heap.push(s, h(Math.abs(s % cols - gx), Math.abs(((s / cols) | 0) - gy)));
  while (heap.size) {
    const cur = heap.pop();
    if (closed[cur]) continue;
    closed[cur] = 1; order.push(cur);
    if (cur === g) break;
    const cx = cur % cols, cy = (cur / cols) | 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const n = ny * cols + nx;
      if (walls[n] || closed[n]) continue;
      if (dx && dy && (walls[cy * cols + nx] || walls[ny * cols + cx])) continue; // no corner cutting
      const t = gScore[cur] + (dx && dy ? Math.SQRT2 : 1);
      if (t < gScore[n]) {
        gScore[n] = t; came[n] = cur;
        heap.push(n, t + h(Math.abs(nx - gx), Math.abs(ny - gy)));
      }
    }
  }
  const path = [];
  if (came[g] !== -1 || s === g) { let c = g; while (c !== -1) { path.push(c); c = came[c]; } path.reverse(); }
  return { order, path, cost: gScore[g] };
}

function colors() {
  const cs = getComputedStyle(document.documentElement);
  const g = (v) => cs.getPropertyValue(v).trim();
  return { acid: g("--acid"), volt: g("--volt"), coral: g("--coral"), line: g("--line"), faint: g("--faint"), bg: g("--bg-2") };
}

export default function AStarDemo() {
  const cv = useRef(null);
  const st = useRef(null);
  const anim = useRef(0);
  const [heur, setHeur] = useState("octile");
  const [stats, setStats] = useState(null);
  const [cmp, setCmp] = useState(null);
  const [running, setRunning] = useState(false);

  const draw = useCallback(() => {
    const c = cv.current, s = st.current; if (!c || !s) return;
    const ctx = c.getContext("2d");
    const { cols, rows, cell, walls, start, goal, visited, path, shown, pathShown } = s;
    const col = colors();
    const W = c.offsetWidth, Hh = c.offsetHeight;
    ctx.clearRect(0, 0, W, Hh);
    ctx.strokeStyle = col.line; ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) { ctx.beginPath(); ctx.moveTo(x * cell + 0.5, 0); ctx.lineTo(x * cell + 0.5, rows * cell); ctx.stroke(); }
    for (let y = 0; y <= rows; y++) { ctx.beginPath(); ctx.moveTo(0, y * cell + 0.5); ctx.lineTo(cols * cell, y * cell + 0.5); ctx.stroke(); }
    // visited
    for (let i = 0; i < Math.min(shown, visited.length); i++) {
      const n = visited[i], x = n % cols, y = (n / cols) | 0;
      const age = (shown - i) / 60;
      ctx.fillStyle = col.volt; ctx.globalAlpha = Math.max(0.16, 0.55 - age * 0.4);
      ctx.fillRect(x * cell + 1.5, y * cell + 1.5, cell - 3, cell - 3);
    }
    ctx.globalAlpha = 1;
    // storms
    for (let i = 0; i < walls.length; i++) if (walls[i]) {
      const x = i % cols, y = (i / cols) | 0;
      ctx.fillStyle = col.coral; ctx.globalAlpha = 0.75;
      ctx.beginPath(); ctx.roundRect(x * cell + 2, y * cell + 2, cell - 4, cell - 4, 4); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // path
    if (path.length && pathShown > 0) {
      ctx.strokeStyle = col.acid; ctx.lineWidth = Math.max(3, cell * 0.2); ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.shadowColor = col.acid; ctx.shadowBlur = 12;
      ctx.beginPath();
      path.slice(0, pathShown).forEach((n, k) => {
        const x = (n % cols) * cell + cell / 2, y = ((n / cols) | 0) * cell + cell / 2;
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      });
      ctx.stroke(); ctx.shadowBlur = 0; ctx.lineWidth = 1;
    }
    // endpoints
    const dot = (n, fill) => {
      const x = (n % cols) * cell + cell / 2, y = ((n / cols) | 0) * cell + cell / 2;
      ctx.fillStyle = col.acid; ctx.strokeStyle = col.acid; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(x, y, cell * 0.36, 0, 6.283);
      fill ? ctx.fill() : ctx.stroke();
      if (!fill) { ctx.beginPath(); ctx.arc(x, y, cell * 0.14, 0, 6.283); ctx.fill(); }
      ctx.lineWidth = 1;
    };
    dot(start, true); dot(goal, false);
    // plane glyph on start
    const sx = (start % cols) * cell + cell / 2, sy = ((start / cols) | 0) * cell + cell / 2;
    ctx.fillStyle = col.bg; ctx.font = `700 ${Math.round(cell * 0.5)}px system-ui`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("✈", sx, sy + 1); ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";
  }, []);

  const layout = useCallback(() => {
    const c = cv.current; if (!c) return;
    const W = c.parentElement.offsetWidth;
    const cell = W < 520 ? 20 : 24;
    const cols = Math.floor(W / cell), rows = W < 520 ? 18 : 18;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.style.width = cols * cell + "px"; c.style.height = rows * cell + "px";
    c.width = cols * cell * dpr; c.height = rows * cell * dpr;
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    const prev = st.current;
    if (!prev || prev.cols !== cols) {
      const walls = new Uint8Array(cols * rows);
      const my = (rows / 2) | 0;
      st.current = { cols, rows, cell, walls, start: my * cols + 2, goal: my * cols + cols - 3, visited: [], path: [], shown: 0, pathShown: 0 };
      storms(st.current, 7);
    } else st.current.cell = cell;
    draw();
  }, [draw]);

  function storms(s, seed) {
    let a = seed;
    const r = () => { a = (a * 16807) % 2147483647; return a / 2147483647; };
    s.walls.fill(0);
    const k = Math.round(s.cols / 7);
    for (let n = 0; n < k; n++) {
      const cx = 6 + r() * (s.cols - 12), cy = r() * s.rows, rad = 1.6 + r() * 2.6;
      for (let y = 0; y < s.rows; y++) for (let x = 0; x < s.cols; x++) {
        const d = Math.hypot((x - cx) * 0.9, y - cy) + (r() - 0.5) * 1.2;
        if (d < rad) s.walls[y * s.cols + x] = 1;
      }
    }
    s.walls[s.start] = 0; s.walls[s.goal] = 0;
    s.visited = []; s.path = []; s.shown = 0; s.pathShown = 0;
  }

  useEffect(() => {
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(cv.current.parentElement);
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { ro.disconnect(); mo.disconnect(); cancelAnimationFrame(anim.current); };
  }, [layout, draw]);

  const run = (mode = heur) => {
    const s = st.current; if (!s) return;
    cancelAnimationFrame(anim.current);
    const t0 = performance.now();
    const res = search(s.cols, s.rows, s.walls, s.start, s.goal, mode);
    const ms = performance.now() - t0;
    const other = search(s.cols, s.rows, s.walls, s.start, s.goal, mode === "none" ? "octile" : "none");
    s.visited = res.order; s.path = res.path; s.shown = 0; s.pathShown = 0;
    setRunning(true);
    setStats({ mode, expanded: res.order.length, cost: res.path.length ? res.cost.toFixed(1) : "—", ms: ms.toFixed(2), found: res.path.length > 0 });
    setCmp({ other: mode === "none" ? "A*" : "Dijkstra", expanded: other.order.length });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const T1 = reduced ? 0 : Math.min(1400, 300 + s.visited.length * 2.2), T2 = reduced ? 0 : 650;
    const began = performance.now();
    const step = (now) => {
      const el = now - began;
      s.shown = T1 ? Math.min(s.visited.length, Math.ceil((el / T1) * s.visited.length)) : s.visited.length;
      s.pathShown = el < T1 ? 0 : T2 ? Math.ceil(((el - T1) / T2) * s.path.length) : s.path.length;
      draw();
      if (el < T1 + T2) anim.current = requestAnimationFrame(step);
      else { s.shown = s.visited.length; s.pathShown = s.path.length; draw(); setRunning(false); }
    };
    anim.current = requestAnimationFrame(step);
  };

  // painting + dragging endpoints
  const drag = useRef(null);
  const cellAt = (e) => {
    const s = st.current, r = cv.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - r.left) / s.cell), y = Math.floor((e.clientY - r.top) / s.cell);
    if (x < 0 || y < 0 || x >= s.cols || y >= s.rows) return -1;
    return y * s.cols + x;
  };
  const clearRun = (s) => { s.visited = []; s.path = []; s.shown = 0; s.pathShown = 0; setStats(null); setCmp(null); };
  const down = (e) => {
    const n = cellAt(e); if (n < 0) return;
    const s = st.current;
    cv.current.setPointerCapture?.(e.pointerId);
    cancelAnimationFrame(anim.current); setRunning(false);
    if (n === s.start) drag.current = "start";
    else if (n === s.goal) drag.current = "goal";
    else { drag.current = s.walls[n] ? "erase" : "paint"; s.walls[n] = drag.current === "paint" ? 1 : 0; }
    clearRun(s); draw();
  };
  const move = (e) => {
    if (!drag.current) return;
    const n = cellAt(e); if (n < 0) return;
    const s = st.current;
    if (drag.current === "start" || drag.current === "goal") {
      if (!s.walls[n] && n !== s.start && n !== s.goal) s[drag.current] = n;
    } else if (n !== s.start && n !== s.goal) s.walls[n] = drag.current === "paint" ? 1 : 0;
    draw();
  };
  const up = () => {
    const was = drag.current; drag.current = null;
    if (was === "start" || was === "goal") run();
  };

  const saving = stats && cmp && stats.mode !== "none" && cmp.expanded > 0 ? Math.round((1 - stats.expanded / cmp.expanded) * 100) : null;

  return (
    <div className="demo">
      <div className="demo-stage">
        <canvas
          ref={cv}
          className="astar-canvas"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          aria-label="A* pathfinding grid. Drag to paint storm cells; drag the plane or destination to move them."
        />
      </div>
      <div className="demo-side">
        <div className="demo-controls">
          <button className="btn btn-primary btn-sm" onClick={() => run()} disabled={running}>▶ Run A*</button>
          <button className="btn btn-ghost btn-sm" onClick={() => run("none")} disabled={running}>Run Dijkstra</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { const s = st.current; storms(s, (Math.random() * 1e6) | 0); clearRun(s); draw(); }}>⛈ New storms</button>
          <button className="btn btn-ghost btn-sm" onClick={() => { const s = st.current; s.walls.fill(0); clearRun(s); draw(); }}>Clear</button>
        </div>
        <label className="demo-select mono">
          heuristic h(n)
          <select value={heur} onChange={(e) => setHeur(e.target.value)}>
            <option value="octile">octile (exact on 8-grid)</option>
            <option value="euclidean">euclidean</option>
            <option value="manhattan">manhattan (inadmissible here)</option>
          </select>
        </label>
        <div className="demo-stats mono">
          <div><span>algorithm</span><b>{stats ? (stats.mode === "none" ? "Dijkstra" : `A* · ${stats.mode}`) : "—"}</b></div>
          <div><span>nodes expanded</span><b>{stats ? stats.expanded.toLocaleString() : "—"}</b></div>
          <div><span>path cost</span><b>{stats ? (stats.found ? stats.cost : "no route") : "—"}</b></div>
          <div><span>compute</span><b>{stats ? `${stats.ms} ms` : "—"}</b></div>
          {cmp && <div className="demo-cmp"><span>{cmp.other} would expand</span><b>{cmp.expanded.toLocaleString()}</b></div>}
          {saving !== null && saving > 0 && <p className="demo-win">A* skipped <b>{saving}%</b> of the work Dijkstra does.</p>}
        </div>
        <p className="demo-hint">Drag on the grid to paint storm cells. Drag ✈ or the target to move them — it re-routes instantly.</p>
      </div>
    </div>
  );
}
