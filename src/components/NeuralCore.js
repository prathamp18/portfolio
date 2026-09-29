"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useThemeColor, { usePrefersReducedMotion } from "./useThemeColor";

/*
  A live forward pass through a 3D neural network.
  Each layer is a ring of neurons; signals travel edge-to-edge, and a neuron
  lights up when a signal reaches it. The five layers mirror the agent
  pipeline Pratham ships: prompt → route → retrieve → reason → act.
*/
export const LAYERS = [
  { n: 6, name: "prompt" },
  { n: 10, name: "route" },
  { n: 14, name: "retrieve" },
  { n: 10, name: "reason" },
  { n: 5, name: "act" },
];
const SPACING = 2.05;
const PULSES = 70;

function buildNet() {
  const nodes = []; // {pos: Vector3, layer}
  const layerStart = [];
  LAYERS.forEach((L, li) => {
    layerStart.push(nodes.length);
    const x = (li - (LAYERS.length - 1) / 2) * SPACING;
    const r = 0.55 + Math.sqrt(L.n) * 0.52;
    for (let k = 0; k < L.n; k++) {
      const a = (k / L.n) * Math.PI * 2 + li * 0.4;
      nodes.push({ pos: new THREE.Vector3(x, Math.sin(a) * r, Math.cos(a) * r), layer: li });
    }
  });
  const edges = []; // [from, to]
  const out = nodes.map(() => []);
  for (let li = 0; li < LAYERS.length - 1; li++) {
    for (let i = 0; i < LAYERS[li].n; i++) {
      for (let j = 0; j < LAYERS[li + 1].n; j++) {
        const a = layerStart[li] + i, b = layerStart[li + 1] + j;
        out[a].push(edges.length);
        edges.push([a, b]);
      }
    }
  }
  return { nodes, edges, out, firstLayer: LAYERS[0].n };
}

function Net({ mouse, reduced }) {
  const group = useRef(null);
  const shell = useRef(null);
  const nodeMesh = useRef(null);
  const acid = useThemeColor("--acid", "#c4ff4d");
  const volt = useThemeColor("--volt", "#7a7dff");
  const net = useMemo(buildNet, []);
  const act = useMemo(() => new Float32Array(net.nodes.length), [net]);

  // static edges
  const edgeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(net.edges.length * 6);
    net.edges.forEach(([a, b], i) => {
      const A = net.nodes[a].pos, B = net.nodes[b].pos;
      p.set([A.x, A.y, A.z, B.x, B.y, B.z], i * 6);
    });
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(net.edges.length * 6), 3));
    return g;
  }, [net]);

  // pulses: head points + short trails
  const pulses = useMemo(
    () =>
      Array.from({ length: PULSES }, () => ({
        e: net.out[(Math.random() * net.firstLayer) | 0][0],
        t: Math.random(),
        v: 0.55 + Math.random() * 0.7,
      })),
    [net]
  );
  const headGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PULSES * 3), 3));
    return g;
  }, []);
  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PULSES * 6), 3));
    return g;
  }, []);

  const cA = useMemo(() => new THREE.Color(), []);
  const cV = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Color(), []);
  const m4 = useMemo(() => new THREE.Matrix4(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);

  useEffect(() => {
    cA.set(acid); cV.set(volt);
    const col = edgeGeo.attributes.color;
    net.edges.forEach(([a, b], i) => {
      const la = net.nodes[a].layer / (LAYERS.length - 1), lb = net.nodes[b].layer / (LAYERS.length - 1);
      tmp.copy(cV).lerp(cA, la); col.setXYZ(i * 2, tmp.r, tmp.g, tmp.b);
      tmp.copy(cV).lerp(cA, lb); col.setXYZ(i * 2 + 1, tmp.r, tmp.g, tmp.b);
    });
    col.needsUpdate = true;
  }, [acid, volt, edgeGeo, net, cA, cV, tmp]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    if (!reduced) {
      const hp = headGeo.attributes.position, tp = trailGeo.attributes.position;
      pulses.forEach((p, i) => {
        p.t += dt * p.v;
        if (p.t >= 1) {
          const to = net.edges[p.e][1];
          act[to] = 1;
          const outs = net.out[to];
          if (outs.length) p.e = outs[(Math.random() * outs.length) | 0];
          else { const s = (Math.random() * net.firstLayer) | 0; act[s] = 1; p.e = net.out[s][(Math.random() * net.out[s].length) | 0]; }
          p.t = 0;
        }
        const [a, b] = net.edges[p.e];
        const A = net.nodes[a].pos, B = net.nodes[b].pos;
        const t0 = Math.max(0, p.t - 0.22);
        hp.setXYZ(i, A.x + (B.x - A.x) * p.t, A.y + (B.y - A.y) * p.t, A.z + (B.z - A.z) * p.t);
        tp.setXYZ(i * 2, A.x + (B.x - A.x) * t0, A.y + (B.y - A.y) * t0, A.z + (B.z - A.z) * t0);
        tp.setXYZ(i * 2 + 1, A.x + (B.x - A.x) * p.t, A.y + (B.y - A.y) * p.t, A.z + (B.z - A.z) * p.t);
      });
      hp.needsUpdate = true; tp.needsUpdate = true;
    }

    const mesh = nodeMesh.current;
    if (mesh) {
      const first = !mesh.instanceColor;
      net.nodes.forEach((nd, i) => {
        act[i] = Math.max(0, act[i] - dt * 1.6);
        const s = 0.075 + act[i] * 0.09;
        m4.compose(nd.pos, q, sc.set(s, s, s));
        mesh.setMatrixAt(i, m4);
        const base = nd.layer / (LAYERS.length - 1);
        tmp.copy(cV).lerp(cA, base).lerp(cA, act[i] * 0.8);
        tmp.multiplyScalar(0.55 + act[i] * 0.9);
        mesh.setColorAt(i, tmp);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      if (first) mesh.material.needsUpdate = true;
    }

    const g = group.current;
    if (g) {
      const tx = 0.22 + mouse.current.y * 0.35;
      const ty = (reduced ? -0.65 : -0.65 + Math.sin(time * 0.18) * 0.55) + mouse.current.x * 0.8;
      g.rotation.x += (tx - g.rotation.x) * 0.05;
      g.rotation.y += (ty - g.rotation.y) * 0.05;
    }
    if (shell.current && !reduced) {
      shell.current.rotation.y = time * 0.05;
      shell.current.rotation.z = time * 0.03;
    }
  });

  return (
    <group>
      <group ref={group} rotation={[0.22, -0.65, 0]}>
        <lineSegments geometry={edgeGeo}>
          <lineBasicMaterial vertexColors transparent opacity={0.13} depthWrite={false} />
        </lineSegments>
        <lineSegments geometry={trailGeo}>
          <lineBasicMaterial color={acid} transparent opacity={0.85} depthWrite={false} />
        </lineSegments>
        <points geometry={headGeo}>
          <pointsMaterial color={acid} size={0.13} sizeAttenuation transparent opacity={0.95} depthWrite={false} />
        </points>
        <instancedMesh ref={nodeMesh} args={[null, null, net.nodes.length]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      </group>
      <mesh ref={shell}>
        <icosahedronGeometry args={[5.4, 1]} />
        <meshBasicMaterial color={volt} wireframe transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

export default function NeuralCore() {
  const mouse = useRef({ x: 0, y: 0 });
  const reduced = usePrefersReducedMotion();
  const [tps, setTps] = useState(1284);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTps(1180 + Math.round(Math.random() * 220)), 700);
    return () => clearInterval(id);
  }, [reduced]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouse.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouse.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  };

  return (
    <div className="nc-wrap" onPointerMove={onMove} onPointerLeave={() => (mouse.current = { x: 0, y: 0 })}>
      <Canvas camera={{ position: [0, 0.4, 11.5], fov: 42 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
        <Net mouse={mouse} reduced={reduced} />
      </Canvas>
      <div className="nc-hud mono">
        <span className="nc-live"><i />forward pass</span>
        <span>{tps.toLocaleString("en-US")} tok/s</span>
      </div>
      <div className="nc-layers mono">
        {LAYERS.map((l, i) => (
          <span key={l.name}>
            {l.name}
            {i < LAYERS.length - 1 && <b>→</b>}
          </span>
        ))}
      </div>
    </div>
  );
}
