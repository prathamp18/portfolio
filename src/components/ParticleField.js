"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import useThemeColor from "./useThemeColor";

/*
  4 000 particles that rebuild themselves as you scroll, walking through
  four pictures from computer science and ML:

    0  Neural layers        points on stacked discs   y = σ(Wx + b)
    1  Binary tree          a balanced BST in 3D      O(log n)
    2  Embedding space      clusters of vectors       cos θ (RAG retrieval)
    3  Globe + routes       great-circle flight arcs  A*: f = g + h
*/

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rand) {
  const u = Math.max(rand(), 1e-9), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const FORMATIONS = [
  { name: "Neural layers", eq: "a⁽ˡ⁾ = σ(W⁽ˡ⁾a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)" },
  { name: "Binary search tree", eq: "search: O(log n)" },
  { name: "Embedding space · RAG", eq: "sim(q, d) = q·d / ‖q‖‖d‖" },
  { name: "A* over great circles", eq: "f(n) = g(n) + h_haversine(n)" },
];

function buildFormations(N) {
  const rand = mulberry32(18);
  const layers = new Float32Array(N * 3);
  const tree = new Float32Array(N * 3);
  const embed = new Float32Array(N * 3);
  const globe = new Float32Array(N * 3);

  // 0 — five discs of neurons (denser rims)
  const L = 5;
  for (let i = 0; i < N; i++) {
    const l = i % L;
    const r = Math.sqrt(rand()) * (1.2 + (l === 2 ? 1.2 : l === 1 || l === 3 ? 0.8 : 0.3));
    const a = rand() * Math.PI * 2;
    layers[i * 3] = (l - 2) * 1.9;
    layers[i * 3 + 1] = Math.sin(a) * r;
    layers[i * 3 + 2] = Math.cos(a) * r;
  }

  // 1 — balanced binary tree: points scattered along its edges, node blobs at joints
  const depth = 7;
  const nodes = [];
  const edges = [];
  const place = (d, idx, x, z, parent) => {
    const y = 3.2 - d * 1.05;
    const id = nodes.length;
    nodes.push([x, y, z]);
    if (parent !== null) edges.push([parent, id]);
    if (d < depth - 1) {
      const spread = 3.6 / Math.pow(2, d);
      const rot = d % 2 === 0;
      place(d + 1, idx * 2, rot ? x - spread : x, rot ? z : z - spread * 0.8, id);
      place(d + 1, idx * 2 + 1, rot ? x + spread : x, rot ? z : z + spread * 0.8, id);
    }
  };
  place(0, 0, 0, 0, null);
  for (let i = 0; i < N; i++) {
    if (i % 3 === 0) {
      const n = nodes[(rand() * nodes.length) | 0];
      tree[i * 3] = n[0] + gauss(rand) * 0.04;
      tree[i * 3 + 1] = n[1] + gauss(rand) * 0.04;
      tree[i * 3 + 2] = n[2] + gauss(rand) * 0.04;
    } else {
      const [a, b] = edges[(rand() * edges.length) | 0];
      const t = rand();
      tree[i * 3] = nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t;
      tree[i * 3 + 1] = nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t;
      tree[i * 3 + 2] = nodes[a][2] + (nodes[b][2] - nodes[a][2]) * t;
    }
  }

  // 2 — embedding clusters (documents) around a few centroids
  const C = 7;
  const cents = Array.from({ length: C }, (_, k) => {
    const phi = Math.acos(1 - (2 * (k + 0.5)) / C);
    const th = Math.PI * (1 + Math.sqrt(5)) * k;
    return [2.6 * Math.cos(th) * Math.sin(phi), 2.6 * Math.cos(phi), 2.6 * Math.sin(th) * Math.sin(phi)];
  });
  for (let i = 0; i < N; i++) {
    if (i % 17 === 0) { // the query ray from the origin
      const c = cents[0], t = rand();
      embed[i * 3] = c[0] * t; embed[i * 3 + 1] = c[1] * t; embed[i * 3 + 2] = c[2] * t;
      continue;
    }
    const c = cents[i % C];
    const s = 0.35 + (i % C) * 0.03;
    embed[i * 3] = c[0] + gauss(rand) * s;
    embed[i * 3 + 1] = c[1] + gauss(rand) * s;
    embed[i * 3 + 2] = c[2] + gauss(rand) * s;
  }

  // 3 — globe with great-circle routes
  const R = 2.7;
  const sph = (lat, lon, r = R) => [r * Math.cos(lat) * Math.cos(lon), r * Math.sin(lat), r * Math.cos(lat) * Math.sin(lon)];
  const routes = Array.from({ length: 9 }, () => [
    [(rand() - 0.5) * 2.2, rand() * Math.PI * 2],
    [(rand() - 0.5) * 2.2, rand() * Math.PI * 2],
  ]);
  const half = Math.floor(N * 0.62);
  for (let i = 0; i < N; i++) {
    if (i < half) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / half);
      const th = Math.PI * (1 + Math.sqrt(5)) * i;
      globe[i * 3] = R * Math.cos(th) * Math.sin(phi);
      globe[i * 3 + 1] = R * Math.cos(phi);
      globe[i * 3 + 2] = R * Math.sin(th) * Math.sin(phi);
    } else {
      const [p, q] = routes[i % routes.length];
      const t = rand();
      const A = sph(p[0], p[1], 1), B = sph(q[0], q[1], 1);
      const dot = Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
      const om = Math.acos(dot) || 1e-4;
      const sa = Math.sin((1 - t) * om) / Math.sin(om), sb = Math.sin(t * om) / Math.sin(om);
      const lift = R * (1 + 0.28 * Math.sin(Math.PI * t));
      globe[i * 3] = (A[0] * sa + B[0] * sb) * lift;
      globe[i * 3 + 1] = (A[1] * sa + B[1] * sb) * lift;
      globe[i * 3 + 2] = (A[2] * sa + B[2] * sb) * lift;
    }
  }
  return [layers, tree, embed, globe];
}

const smooth = (t) => t * t * (3 - 2 * t);

export default function ParticleField({ progress, count = 4000, reduced = false }) {
  const ref = useRef(null);
  const color = useThemeColor("--particle", "#7a7dff");
  const stages = useMemo(() => buildFormations(count), [count]);
  const positions = useMemo(() => new Float32Array(stages[0]), [stages]);
  const eased = useRef(0);

  useFrame((state, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const target = reduced ? 0 : progress.current;
    eased.current += (target - eased.current) * Math.min(1, delta * 3);
    const p = Math.min(Math.max(eased.current, 0), 1);

    const last = stages.length - 1;
    const f = p * last;
    const idx = Math.min(Math.floor(f), last - 1);
    const t = smooth(Math.min(Math.max(f - idx, 0), 1));
    const A = stages[idx], B = stages[idx + 1];
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count * 3; i += 3) {
      const w = Math.sin(time * 0.9 + i * 0.013) * 0.012;
      positions[i] = A[i] + (B[i] - A[i]) * t + w;
      positions[i + 1] = A[i + 1] + (B[i + 1] - A[i + 1]) * t + w;
      positions[i + 2] = A[i + 2] + (B[i + 2] - A[i + 2]) * t;
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.rotation.y = reduced ? 0.5 : time * 0.07 + p * 1.1;
    pts.rotation.x = 0.15 + p * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color={color} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
    </points>
  );
}
