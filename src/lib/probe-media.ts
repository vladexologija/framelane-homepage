/**
 * In-browser media probing shared by the playground and the assets uploader.
 * Client-only (uses DOM media elements); never import from a Server Component.
 */

export interface ProbedMedia {
  duration: number;
  width: number | null;
  height: number | null;
}

/** Read a media file's duration (and pixel dimensions for video) in-browser from
 * a local object URL. Resolves within `timeoutMs` (or rejects) so a file that
 * never loads can't hang upload. */
export function probeMedia(
  file: File,
  kind: "VIDEO" | "AUDIO",
  timeoutMs = 5000,
): Promise<ProbedMedia> {
  return new Promise((resolve, reject) => {
    const el = document.createElement(kind === "AUDIO" ? "audio" : "video");
    const url = URL.createObjectURL(file);
    let done = false;
    const finish = (cb: () => void) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      el.removeAttribute("src");
      cb();
    };
    const timer = setTimeout(
      () => finish(() => reject(new Error("probe timed out"))),
      timeoutMs,
    );
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const d = el.duration;
      const v = el as HTMLVideoElement;
      const width = v.videoWidth || null;
      const height = v.videoHeight || null;
      finish(() =>
        Number.isFinite(d) && d > 0
          ? resolve({ duration: d, width, height })
          : reject(new Error("no duration")),
      );
    };
    el.onerror = () => finish(() => reject(new Error("probe failed")));
    el.src = url;
  });
}

/** Read a remote media URL's duration (seconds) from its metadata, for clips
 * pasted into a render request that carry no `out_point`. Resolves `null` on
 * error or timeout (never rejects). No `crossOrigin` — duration needs no CORS,
 * and setting it would make a CDN without CORS headers fail. */
export function probeSourceUrlDuration(
  url: string,
  kind: "VIDEO" | "AUDIO",
  timeoutMs = 8000,
): Promise<number | null> {
  return new Promise((resolve) => {
    const el = document.createElement(kind === "AUDIO" ? "audio" : "video");
    let done = false;
    const finish = (v: number | null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      el.removeAttribute("src");
      try {
        el.load();
      } catch {
        /* ignore */
      }
      resolve(v);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      const d = el.duration;
      finish(Number.isFinite(d) && d > 0 ? d : null);
    };
    el.onerror = () => finish(null);
    el.src = url;
  });
}
