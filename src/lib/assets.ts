/**
 * Pure presentation helpers for workspace assets.
 *
 * Deliberately free of the `server-only` guard (unlike `@/lib/api`) so both the
 * server page and the client-side assets grid can import them.
 */

/** Best-effort human filename from a (possibly signed) asset URL. */
export function filenameOf(url: string): string {
  let path: string;
  try {
    // Use the pathname so a host-only URL ("https://cdn/") yields no segment
    // (rather than returning the hostname) and query strings are dropped.
    path = new URL(url).pathname;
  } catch {
    // Relative or non-URL input: just strip the query string.
    path = url.split("?")[0] ?? url;
  }
  const last = path.split("/").filter(Boolean).pop() ?? "";
  if (!last) return "untitled";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/** Seconds → clock string ("0:05", "1:23", "1:02:03"). Null/invalid → "—". */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

// Fixed locale + timezone so the formatted string is identical on the server
// and during client hydration (a locale/TZ-dependent format would mismatch).
const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "numeric",
});

/** ISO timestamp → "Jun 24, 2026" (deterministic UTC). "—" if unparseable. */
export function formatDate(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  return DATE_FMT.format(new Date(t));
}

/** width×height → "1920×1080", or "—" if either dimension is missing. */
export function formatResolution(
  width: number | null | undefined,
  height: number | null | undefined,
): string {
  if (!width || !height) return "—";
  return `${width}×${height}`;
}
