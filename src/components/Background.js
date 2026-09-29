"use client";
import dynamic from "next/dynamic";
const ParticleCanvas = dynamic(() => import("./ParticleCanvas"), { ssr: false });
export default function Background() { return <ParticleCanvas />; }
