"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
  Logistic regression from scratch, live in the browser — the same maths as the
  fraud-detection project: sigmoid, binary cross-entropy, batch gradient descent.
  Click to add points; watch the decision boundary learn.
*/

const sig = (z) => 1 / (1 + Math.exp(-z));

function blobs(seed = 3) {
  let a = seed;
  const r = () => { a = (a * 16807) % 2147483647; return a / 2147483647; };
  const g = () => Math.sqrt(-2 * Math.log(Math.max(r(), 1e-9))) * Math.cos(2 * Math.PI * r());
  const pts = [];
  for (let i = 0; i < 46; i++) pts.push({ x: 0.36 + g() * 0.12, y: 0.62 + g() * 0.13, c: 0 });
  for (let i = 0; i < 16; i++) pts.push({ x: 0.68 + g() * 0.1, y: 0.34 + g() * 0.1, c: 1 });
  return pts.map((p) => ({ ...p, x: Math.min(0.97, Math.max(0.03, p.x)), y: Math.min(0.97, Math.max(0.03, p.y)) }));
}

function metrics(pts, m) {
  let tp = 0, fp = 0, fn = 0, ok = 0, loss = 0;
  for (const p of pts) {
    const q = sig(m.w1 * (p.x - 0.5) * 4 + m.w2 * (p.y - 0.5) * 4 + m.b);
    const yhat = q >= 0.5 ? 1 : 0;
    if (yhat === p.c) ok++;
    if (yhat && p.c) tp++; else if (yhat && !p.c) fp++; else if (!yhat && p.c) fn++;
    const e = 1e-9;
    loss += -(p.c * Math.log(q + e) + (1 - p.c) * Math.log(1 - q + e));
  }
  const prec = tp + fp ? tp / (tp + fp) : 0, rec = tp + fn ? tp / (tp + fn) : 0;
  return { loss: pts.length ? loss / pts.length : 0, acc: pts.length ? ok / pts.length : 0, f1: prec + rec ? (2 * prec * rec) / (prec + rec) : 0, prec, rec };
}

function colors() {
  const cs = getComputedStyle(document.documentElement);
  const g = (v) => cs.getPropertyValue(v).trim();
  return { acid: g("--acid"), volt: g("--volt"), coral: g("--coral"), line: g("--line"), faint: g("--faint"), text: g("--text"), acidRgb: g("--acid-rgb"), voltRgb: g("--volt-rgb"), coralRgb: g("--coral-rgb") };
}

export default function LogRegDemo() {
  const cv = useRef(null);
  const pts = useRef(blobs());
  const model = useRef({ w1: 0, w2: 0, b: 0, epoch: 0, hist: [] });
  const raf = useRef(0);
  const [training, setTraining] = useState(false);
  const [lr, setLr] = useState(0.8);
  const [cls, setCls] = useState(1);
  const [m, setM] = useState(() => ({ ...metrics(pts.current, model.current), epoch: 0 }));

  const draw = useCallback(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.offsetWidth, H = c.offsetHeight;
    const col = colors();
    const md = model.current;
    ctx.clearRect(0, 0, W, H);
    // probability field
    const G = 34;
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
      const x = (i + 0.5) / G, y = (j + 0.5) / G;
      const q = sig(md.w1 * (x - 0.5) * 4 + md.w2 * (y - 0.5) * 4 + md.b);
      ctx.fillStyle = q > 0.5 ? `rgba(${col.coralRgb},${(q - 0.5) * 0.45})` : `rgba(${col.voltRgb},${(0.5 - q) * 0.35})`;
      ctx.fillRect((i / G) * W, (j / G) * H, W / G + 1, H / G + 1);
    }
    // decision boundary: w1*(x-.5)*4 + w2*(y-.5)*4 + b = 0
    if (Math.abs(md.w1) + Math.abs(md.w2) > 1e-3) {
      ctx.strokeStyle = col.acid; ctx.lineWidth = 2.5; ctx.shadowColor = col.acid; ctx.shadowBlur = 10;
      ctx.beginPath();
      if (Math.abs(md.w2) > Math.abs(md.w1)) {
        const yAt = (x) => 0.5 - (md.w1 * (x - 0.5) * 4 + md.b) / (md.w2 * 4);
        ctx.moveTo(0, yAt(0) * H); ctx.lineTo(W, yAt(1) * H);
      } else {
        const xAt = (y) => 0.5 - (md.w2 * (y - 0.5) * 4 + md.b) / (md.w1 * 4);
        ctx.moveTo(xAt(0) * W, 0); ctx.lineTo(xAt(1) * W, H);
      }
      ctx.stroke(); ctx.shadowBlur = 0; ctx.lineWidth = 1;
    }
    // points
    for (const p of pts.current) {
      ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.c ? 5.5 : 4.5, 0, 6.283);
      if (p.c) { ctx.fillStyle = col.coral; ctx.fill(); ctx.strokeStyle = col.text; ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1; }
      else { ctx.strokeStyle = col.volt; ctx.lineWidth = 1.8; ctx.stroke(); ctx.lineWidth = 1; }
    }
    // loss curve
    const h = md.hist;
    if (h.length > 1) {
      const bx = W - 150, by = 14, bw = 136, bh = 54;
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.roundRect(bx - 8, by - 6, bw + 16, bh + 24, 8); ctx.fill();
      const mx = Math.max(...h);
      ctx.strokeStyle = col.acid; ctx.lineWidth = 1.5; ctx.beginPath();
      h.forEach((v, i) => { const x = bx + (i / (h.length - 1)) * bw, y = by + bh - (v / mx) * bh; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = "#ddd"; ctx.font = `500 10px "IBM Plex Mono", monospace`; ctx.fillText("BCE loss ↓", bx, by + bh + 13);
    }
  }, []);

  const resize = useCallback(() => {
    const c = cv.current; if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = c.offsetWidth * dpr; c.height = c.offsetHeight * dpr;
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }, [draw]);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv.current);
    const mo = new MutationObserver(draw);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { ro.disconnect(); mo.disconnect(); cancelAnimationFrame(raf.current); };
  }, [resize, draw]);

  const step = useCallback(() => {
    const md = model.current, P = pts.current, n = P.length || 1;
    for (let k = 0; k < 4; k++) {
      let g1 = 0, g2 = 0, gb = 0;
      for (const p of P) {
        const x1 = (p.x - 0.5) * 4, x2 = (p.y - 0.5) * 4;
        const err = sig(md.w1 * x1 + md.w2 * x2 + md.b) - p.c; // dL/dz for BCE + sigmoid
        g1 += err * x1; g2 += err * x2; gb += err;
      }
      md.w1 -= (lr * g1) / n; md.w2 -= (lr * g2) / n; md.b -= (lr * gb) / n;
      md.epoch++;
    }
    const mt = metrics(P, md);
    md.hist.push(mt.loss); if (md.hist.length > 120) md.hist.shift();
    setM({ ...mt, epoch: md.epoch });
    draw();
    if (md.epoch < 1000) raf.current = requestAnimationFrame(step);
    else setTraining(false);
  }, [lr, draw]);

  const toggle = () => {
    if (training) { cancelAnimationFrame(raf.current); setTraining(false); return; }
    if (model.current.epoch >= 1000) reset(false);
    setTraining(true);
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => { if (training) { cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(step); } }, [step, training]);

  const reset = (newData) => {
    cancelAnimationFrame(raf.current); setTraining(false);
    if (newData === true) pts.current = blobs((Math.random() * 1e6) | 0);
    if (newData === "clear") pts.current = [];
    model.current = { w1: 0, w2: 0, b: 0, epoch: 0, hist: [] };
    setM({ ...metrics(pts.current, model.current), epoch: 0 });
    draw();
  };

  const add = (e) => {
    const r = cv.current.getBoundingClientRect();
    pts.current.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, c: e.shiftKey ? 1 - cls : cls });
    setM((prev) => ({ ...metrics(pts.current, model.current), epoch: prev.epoch }));
    draw();
  };

  return (
    <div className="demo">
      <div className="demo-stage">
        <canvas ref={cv} className="lr-canvas" onPointerDown={add} aria-label="Logistic regression canvas. Click to add training points." />
        <div className="lr-legend mono">
          <span><i className="lg-0" />legit (0)</span>
          <span><i className="lg-1" />fraud (1)</span>
          <span><i className="lg-b" />p = 0.5 boundary</span>
        </div>
      </div>
      <div className="demo-side">
        <div className="demo-controls">
          <button className="btn btn-primary btn-sm" onClick={toggle}>{training ? "❚❚ Pause" : m.epoch >= 1000 ? "↺ Retrain" : "▶ Train"}</button>
          <button className="btn btn-ghost btn-sm" onClick={() => reset(false)}>Reset weights</button>
          <button className="btn btn-ghost btn-sm" onClick={() => reset(true)}>New data</button>
          <button className="btn btn-ghost btn-sm" onClick={() => reset("clear")}>Clear</button>
        </div>
        <div className="seg mono" role="radiogroup" aria-label="Class for new points">
          <span>click adds:</span>
          <button role="radio" aria-checked={cls === 0} className={cls === 0 ? "on" : ""} onClick={() => setCls(0)}>legit</button>
          <button role="radio" aria-checked={cls === 1} className={cls === 1 ? "on" : ""} onClick={() => setCls(1)}>fraud</button>
        </div>
        <label className="demo-select mono">
          learning rate α = {lr.toFixed(2)}
          <input type="range" min="0.05" max="3" step="0.05" value={lr} onChange={(e) => setLr(parseFloat(e.target.value))} />
        </label>
        <div className="demo-stats mono">
          <div><span>epoch</span><b>{m.epoch} / 1000</b></div>
          <div><span>BCE loss</span><b>{m.loss.toFixed(4)}</b></div>
          <div><span>accuracy</span><b>{(m.acc * 100).toFixed(1)}%</b></div>
          <div><span>precision · recall</span><b>{m.prec.toFixed(2)} · {m.rec.toFixed(2)}</b></div>
          <div className="demo-cmp"><span>F1 (fraud class)</span><b>{m.f1.toFixed(3)}</b></div>
        </div>
        <pre className="code mono" aria-label="Update rule">
{`z = X @ w + b
p = 1 / (1 + exp(-z))   # sigmoid
L = BCE(y, p)
w -= α * X.T @ (p - y) / n
b -= α * mean(p - y)`}
        </pre>
      </div>
    </div>
  );
}
