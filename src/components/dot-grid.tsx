"use client";

import { useEffect, useRef, useCallback } from "react";

const DOT_SPACING = 20;
const DOT_RADIUS = 1;
const PULSE_SPEED = 0.0008;

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0 });

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
  }, []);

  useEffect(() => {
    init();
    window.addEventListener("resize", init);

    const draw = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = dimRef.current;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / DOT_SPACING) + 1;
      const rows = Math.ceil(h / DOT_SPACING) + 1;
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * DOT_SPACING;
          const y = r * DOT_SPACING;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          const wave = Math.sin(dist * 0.02 - time * PULSE_SPEED);
          const distFade = 1 - dist / maxDist * 0.4;
          const alpha = (0.12 + wave * 0.08) * distFade;

          ctx.fillStyle = `rgba(161, 161, 170, ${Math.max(0, alpha)})`;
          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS + wave * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
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
