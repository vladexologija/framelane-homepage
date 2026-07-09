"use client";

import { useEffect, useRef } from "react";

type Mode = "subtle" | "bold" | "off";

/**
 * Hero backdrop: a GPU-style fragment-shader render pass drawn on a canvas.
 * A slowly evolving luminance field is "shaded" cell by cell while a diagonal
 * wavefront sweeps across it, leaving a warm afterglow and lighting up
 * workgroup tile borders as it enters them. Kept legible under the headline by
 * fading the left edge.
 *
 * Ported from the FrameLane Homepage v2 design (DCLogic). Applies to the hero
 * only — section backdrops are intentionally omitted.
 */
export function HeroCanvas({ mode = "subtle" }: { mode?: Mode }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cs = getComputedStyle(document.body);
    const orange = cs.getPropertyValue("--orange").trim() || "#ff7a1a";
    const orangeHi = cs.getPropertyValue("--orange-hi").trim() || "#ffa24d";
    const aScale = mode === "bold" ? 1.35 : 1;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = {
      W: 0,
      H: 0,
      cell: mode === "bold" ? 13 : 15,
      cols: 1,
      rows: 1,
      lum: new Float32Array(1),
      diagMax: 1,
      tile: 6,
      lumT: -999,
    };
    let t = 0;
    let last = 0;
    const peaks: number[] = [];

    // Shader luminance field — a soft, slowly evolving "frame" being shaded.
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

    const buildGrid = () => {
      const CELL = state.cell;
      state.cols = Math.max(1, Math.ceil(state.W / CELL));
      state.rows = Math.max(1, Math.ceil(state.H / CELL));
      state.lum = new Float32Array(state.cols * state.rows);
      state.diagMax = (state.cols - 1 + (state.rows - 1) * 0.4) || 1;
      state.lumT = -999;
    };

    const drawFrame = (f: number, staticMode: boolean) => {
      const { W, H, cell: CELL, cols, rows } = state;
      if (!W || !H) return;
      if (!staticMode) t += f * 0.016;
      ctx.clearRect(0, 0, W, H);

      // Re-evaluate the shader field a few times per second (evolves slowly).
      if (staticMode || t - state.lumT > 0.05) {
        state.lumT = t;
        let i = 0;
        const iw = 1 / Math.max(1, cols - 1);
        const ih = 1 / Math.max(1, rows - 1);
        for (let ry = 0; ry < rows; ry++) {
          const v = ry * ih;
          for (let cxi = 0; cxi < cols; cxi++) state.lum[i++] = shade(cxi * iw, v, t);
        }
      }

      const band = 0.055;
      const speed = mode === "bold" ? 0.14 : 0.11;
      const wf = staticMode ? 0.6 : (t * speed) % 1;
      const gap = CELL >= 13 ? 1.6 : 1;
      const px = CELL - gap;
      const leftEdge = W * 0.46;
      const invDiag = 1 / state.diagMax;

      // Pass 1 — framebuffer: rendered pixels (dim) + active wavefront (orange).
      ctx.fillStyle = orange;
      peaks.length = 0;
      let idx = 0;
      for (let ry = 0; ry < rows; ry++) {
        const y = ry * CELL;
        for (let cxi = 0; cxi < cols; cxi++, idx++) {
          const x = cxi * CELL;
          const dnorm = (cxi + ry * 0.4) * invDiag;
          let sd = dnorm - wf;
          if (sd > 0.5) sd -= 1;
          else if (sd < -0.5) sd += 1;
          const L = state.lum[idx];
          let al = 0.05 + 0.11 * L;
          if (sd > 0) al *= 0.6; // ahead of the sweep: not yet shaded
          else if (sd > -0.14) al *= 1 + 0.7 * (1 + sd / 0.14); // just shaded: afterglow
          const cd = sd < 0 ? -sd : sd;
          if (cd < band) {
            const g = 1 - cd / band;
            al += g * g * 0.6;
            if (cd < band * 0.4) peaks.push(x, y, g);
          }
          al *= aScale;
          if (x < leftEdge) al *= 0.32 + 0.68 * (x / leftEdge); // keep headline legible
          if (al <= 0.012) continue;
          ctx.globalAlpha = al > 1 ? 1 : al;
          ctx.fillRect(x, y, px, px);
        }
      }

      // Pass 2 — hot fragment cores right at the compute edge.
      ctx.fillStyle = orangeHi;
      for (let i = 0; i < peaks.length; i += 3) {
        const x = peaks[i];
        const y = peaks[i + 1];
        const g = peaks[i + 2];
        let al = g * g * 0.9 * aScale;
        if (x < leftEdge) al *= 0.32 + 0.68 * (x / leftEdge);
        if (al <= 0.02) continue;
        ctx.globalAlpha = al > 1 ? 1 : al;
        const inset = (gap + 1.5) * 0.5;
        const w = px - inset * 2;
        if (w > 0) ctx.fillRect(x + inset, y + inset, w, w);
      }

      // Tile dispatch — workgroup borders light up as the wavefront enters them.
      ctx.globalAlpha = 1;
      ctx.strokeStyle = orange;
      ctx.lineWidth = 1;
      const T = state.tile;
      for (let ty = 0; ty < rows; ty += T) {
        for (let tx = 0; tx < cols; tx += T) {
          const dnorm = (tx + T / 2 + (ty + T / 2) * 0.4) * invDiag;
          let sd = dnorm - wf;
          if (sd > 0.5) sd -= 1;
          else if (sd < -0.5) sd += 1;
          const cd = sd < 0 ? -sd : sd;
          if (cd > band * 2.4) continue;
          const x = tx * CELL;
          const y = ty * CELL;
          if (x + T * CELL < leftEdge * 0.5) continue;
          let al = (1 - cd / (band * 2.4)) * 0.5 * aScale;
          if (x < leftEdge) al *= 0.32 + 0.68 * (x / leftEdge);
          if (al <= 0.02) continue;
          ctx.globalAlpha = al > 1 ? 1 : al;
          ctx.strokeRect(x + 0.5, y + 0.5, T * CELL - 1, T * CELL - 1);
        }
      }
      ctx.globalAlpha = 1;
    };

    const sizeOnly = () => {
      const r = host.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      return { r, dpr };
    };

    if (mode === "off") {
      sizeOnly();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const resize = () => {
      const { r, dpr } = sizeOnly();
      if (!r.width || !r.height) return;
      state.W = r.width;
      state.H = r.height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
      if (reduce) drawFrame(0, true);
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(host);
    } else {
      window.addEventListener("resize", resize);
    }
    resize();

    let raf = 0;
    if (!reduce) {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (document.hidden) {
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
