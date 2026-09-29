"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import ParticleField, { FORMATIONS } from "./ParticleField";
import { usePrefersReducedMotion } from "./useThemeColor";

export default function ParticleCanvas() {
  const progress = useRef(0);
  const wrap = useRef(null);
  const [stage, setStage] = useState(0);
  const [mobile, setMobile] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    setMobile(window.innerWidth < 800);
    const onScroll = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      // morphing starts once the hero is behind us
      const p = (y - vh * 0.6) / Math.max(1, docH - vh * 1.6);
      progress.current = Math.min(1, Math.max(0, p));
      const fade = Math.min(1, Math.max(0, (y - vh * 0.25) / (vh * 0.5)));
      if (wrap.current) wrap.current.style.opacity = String(fade * 0.55);
      setStage(Math.min(FORMATIONS.length - 1, Math.round(progress.current * (FORMATIONS.length - 1))));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const f = FORMATIONS[stage];

  return (
    <div ref={wrap} className="pc-wrap" aria-hidden="true" style={{ opacity: 0 }}>
      <div className="pc-canvas">
        <Canvas camera={{ position: [0, 0, 9], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}>
          <ParticleField progress={progress} count={mobile ? 1600 : 4000} reduced={reduced} />
        </Canvas>
      </div>
      <div className="pc-label mono">
        <span className="pc-dot" />
        <span className="pc-name">{String(stage + 1).padStart(2, "0")} / {f.name}</span>
        <span className="pc-eq">{f.eq}</span>
      </div>
    </div>
  );
}
