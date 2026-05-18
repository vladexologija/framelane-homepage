"use client";

import { useEffect, useRef, useCallback } from "react";

interface GlobeNode {
  x: number;
  y: number;
  r: number;
  pulse: number;
  speed: number;
}

interface Arc {
  from: number;
  to: number;
  progress: number;
  speed: number;
  delay: number;
}

function createNodes(w: number, h: number): GlobeNode[] {
  const positions = [
    [0.15, 0.35],
    [0.3, 0.2],
    [0.45, 0.55],
    [0.55, 0.25],
    [0.7, 0.45],
    [0.85, 0.3],
    [0.25, 0.7],
    [0.6, 0.7],
    [0.8, 0.65],
    [0.4, 0.4],
  ];
  return positions.map(([px, py]) => ({
    x: px * w,
    y: py * h,
    r: 2.5 + Math.random() * 2,
    pulse: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 1.5,
  }));
}

function createArcs(nodeCount: number): Arc[] {
  const pairs: [number, number][] = [
    [0, 1], [1, 3], [3, 5], [2, 4], [4, 8],
    [0, 6], [6, 7], [7, 8], [1, 9], [9, 4],
    [2, 7], [5, 8], [0, 9], [3, 2],
  ];
  return pairs
    .filter(([a, b]) => a < nodeCount && b < nodeCount)
    .map(([from, to], i) => ({
      from,
      to,
      progress: 0,
      speed: 0.003 + Math.random() * 0.004,
      delay: i * 400 + Math.random() * 600,
    }));
}

export function GlobeNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0 });
  const nodesRef = useRef<GlobeNode[]>([]);
  const arcsRef = useRef<Arc[]>([]);
  const startRef = useRef(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    dimRef.current = { w: rect.width, h: rect.height };
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    nodesRef.current = createNodes(rect.width, rect.height);
    arcsRef.current = createArcs(nodesRef.current.length);
  }, []);

  useEffect(() => {
    init();
    window.addEventListener("resize", init);
    startRef.current = performance.now();

    const draw = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = dimRef.current;
      const elapsed = time - startRef.current;
      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;
      const arcs = arcsRef.current;

      for (const arc of arcs) {
        const a = nodes[arc.from];
        const b = nodes[arc.to];
        if (elapsed < arc.delay) continue;

        const t = Math.min(1, (elapsed - arc.delay) * arc.speed * 0.05);

        const mx = (a.x + b.x) / 2;
        const my = Math.min(a.y, b.y) - 20 - Math.abs(a.x - b.x) * 0.15;

        ctx.strokeStyle = `rgba(250, 163, 41, ${0.2 + t * 0.15})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t + (my - (a.y + b.y) / 2) * 4 * t * (1 - t));
        ctx.stroke();

        if (t >= 1) {
          ctx.strokeStyle = `rgba(250, 163, 41, 0.35)`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo(mx, my, b.x, b.y);
          ctx.stroke();

          const traveler = ((elapsed - arc.delay) * 0.0004) % 1;
          const tx = (1 - traveler) * (1 - traveler) * a.x + 2 * (1 - traveler) * traveler * mx + traveler * traveler * b.x;
          const ty = (1 - traveler) * (1 - traveler) * a.y + 2 * (1 - traveler) * traveler * my + traveler * traveler * b.y;

          ctx.fillStyle = "rgba(255, 211, 138, 0.7)";
          ctx.beginPath();
          ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (const node of nodes) {
        const pulse = Math.sin(elapsed * 0.001 * node.speed + node.pulse);
        const r = node.r + pulse * 0.8;

        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4);
        glow.addColorStop(0, "rgba(250, 163, 41, 0.15)");
        glow.addColorStop(1, "rgba(250, 163, 41, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 211, 138, ${0.6 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", init);
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
