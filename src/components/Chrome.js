"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/* Page chrome: a scroll-progress bar and a soft spotlight that follows the cursor. */
export default function Chrome() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const spot = useRef(null);

  useEffect(() => {
    const on = (e) => {
      const el = spot.current; if (!el) return;
      el.style.setProperty("--sx", `${e.clientX}px`);
      el.style.setProperty("--sy", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => window.removeEventListener("pointermove", on);
  }, []);

  return (
    <>
      <motion.div className="progress" style={{ scaleX: x }} aria-hidden="true" />
      <div ref={spot} className="spotlight" aria-hidden="true" />
    </>
  );
}
