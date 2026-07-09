"use client";

import { useEffect, useRef } from "react";

type Mode = "subtle" | "bold" | "off";

/**
 * A calmer echo of the hero's fragment-shader render pass, meant to sit behind
 * a section as a subtle pixel-grid texture. Same evolving luminance field and
 * diagonal wavefront as the hero, but slower, sparser and lower-contrast so it
 * reads as background rather than motion.
 *
 * Ported from the FrameLane Homepage v2 design (DCLogic `_drawBackdrop`).
 * Renders into an absolutely-positioned canvas, so the host must be positioned.
 */
export function ShaderBackdrop({ mode = "subtle" }: { mode?: Mode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(document.body);
    const orange = cs.getPropertyValue("--orange").trim() || "#ff7a1a";
    const scale = mode === "off" ? 0 : mode === "bold" ? 1.3 : 1;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const CELL = 20;
    const state = {
      W: 0,
      H: 0,
      cols: 1,
      rows: 1,
      lum: new Float32Array(1),
      invDiag: 1,
      lumT: -999,
      t: 0,
      phase: Math.random() * 6.283,
      visible: true,
    };
    let last = 0;

    // Shader luminance field — matches the hero so the two echo each other.
    const shade = (u: number, v: number, time: number) => {
      const a = Math.sin(u * 3.1 + time * 0.6) * 0.5 + 0.5;
      const b =
        Math.sin(v * 4.3 - time * 0.4 + Math.cos(u * 2.0 + time * 0.3) * 1.5) *
          0.5 +
        0.5;
      const cx = 0.4 + 0.28 * Math.sin(time * 0.23);
      const cy = 0.5 + 0.3 * Math.cos(time * 0.31);
      const r = Math.hypot(u - cx, v - cy);
      const blob = Math.max(0, 1 - r * 2.1);
      return Math.min(1, (a * 0.34 + b * 0.34 + blob * 0.6) * 0.92);
    };

    const drawFrame = (f: number, staticMode: boolean) => {
      const { W, H, cols, rows } = state;
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      if (scale === 0) return;
      if (!staticMode) state.t += f * 0.016;
      const t = state.t * 0.6 + state.phase;

      if (staticMode || t - state.lumT > 0.08) {
        state.lumT = t;
        let i = 0;
        const iw = 1 / Math.max(1, cols - 1);
        const ih = 1 / Math.max(1, rows - 1);
        for (let ry = 0; ry < rows; ry++) {
          const v = ry * ih;
          for (let cxi = 0; cxi < cols; cxi++) state.lum[i++] = shade(cxi * iw, v, t);
        }
      }

      const gap = 2;
      const px = CELL - gap;
      const wf = (t * 0.05) % 1;
      const invDiag = state.invDiag;
      ctx.fillStyle = orange;
      let idx = 0;
      for (let ry = 0; ry < rows; ry++) {
        const y = ry * CELL;
        for (let cxi = 0; cxi < cols; cxi++, idx++) {
          const L = state.lum[idx];
          let al = 0.026 + 0.05 * L;
          const dnorm = (cxi + ry * 0.4) * invDiag;
          let sd = dnorm - wf;
          if (sd > 0.5) sd -= 1;
          else if (sd < -0.5) sd += 1;
          const cd = sd < 0 ? -sd : sd;
          if (cd < 0.1) al += (1 - cd / 0.1) * 0.055;
          al *= scale;
          if (al <= 0.01) continue;
          ctx.globalAlpha = al > 1 ? 1 : al;
          ctx.fillRect(cxi * CELL, y, px, px);
        }
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      state.W = r.width;
      state.H = r.height;
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.cols = Math.max(1, Math.ceil(r.width / CELL));
      state.rows = Math.max(1, Math.ceil(r.height / CELL));
      state.lum = new Float32Array(state.cols * state.rows);
      state.invDiag = 1 / ((state.cols - 1 + (state.rows - 1) * 0.4) || 1);
      state.lumT = -999;
      if (reduce) drawFrame(0, true);
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(host);
    } else {
      window.addEventListener("resize", resize);
    }

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          state.visible = entries[0].isIntersecting;
        },
        { rootMargin: "160px" }
      );
      io.observe(host);
    }

    resize();

    let raf = 0;
    if (!reduce && scale !== 0) {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (document.hidden || !state.visible) {
          last = now;
          return;
        }
        let dt = now - (last || now);
        last = now;
        if (dt > 60) dt = 60;
        drawFrame(dt / 16.67, false);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", resize);
      if (io) io.disconnect();
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
