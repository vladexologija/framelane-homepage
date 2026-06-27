import { describe, it, expect } from "vitest";

import {
  filenameOf,
  formatDate,
  formatDuration,
  formatResolution,
} from "./assets";

describe("filenameOf", () => {
  it("takes the last path segment", () => {
    expect(filenameOf("https://cdn.test/a/b/clip.mp4")).toBe("clip.mp4");
  });

  it("strips the query string (e.g. signed-URL params)", () => {
    expect(filenameOf("https://cdn.test/clip.mp4?sig=abc&exp=123")).toBe(
      "clip.mp4",
    );
  });

  it("ignores a trailing slash", () => {
    expect(filenameOf("https://cdn.test/folder/")).toBe("folder");
  });

  it("decodes percent-encoded names", () => {
    expect(filenameOf("https://cdn.test/my%20raw%20footage.mov")).toBe(
      "my raw footage.mov",
    );
  });

  it("falls back to 'untitled' when there is no segment", () => {
    expect(filenameOf("https://cdn.test/")).toBe("untitled");
    expect(filenameOf("")).toBe("untitled");
  });

  it("returns the raw segment when decoding fails", () => {
    expect(filenameOf("https://cdn.test/bad%E0%A4%A.mp4")).toBe(
      "bad%E0%A4%A.mp4",
    );
  });
});

describe("formatDuration", () => {
  it("renders sub-minute durations zero-padded", () => {
    expect(formatDuration(5)).toBe("0:05");
  });

  it("renders minutes:seconds", () => {
    expect(formatDuration(83)).toBe("1:23");
  });

  it("renders hours:minutes:seconds", () => {
    expect(formatDuration(3723)).toBe("1:02:03");
  });

  it("rounds fractional seconds", () => {
    expect(formatDuration(4.6)).toBe("0:05");
  });

  it("returns a dash for null/invalid input", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(undefined)).toBe("—");
    expect(formatDuration(NaN)).toBe("—");
    expect(formatDuration(-3)).toBe("—");
  });

  it("handles zero", () => {
    expect(formatDuration(0)).toBe("0:00");
  });
});

describe("formatDate", () => {
  it("formats an ISO timestamp in a fixed en-US style", () => {
    expect(formatDate("2026-06-24T13:45:00Z")).toBe("Jun 24, 2026");
  });

  it("uses UTC, so output is stable regardless of the local timezone", () => {
    expect(formatDate("2026-01-01T00:30:00Z")).toBe("Jan 1, 2026");
  });

  it("returns a dash for unparseable input", () => {
    expect(formatDate("not a date")).toBe("—");
    expect(formatDate("")).toBe("—");
  });
});

describe("formatResolution", () => {
  it("joins width and height with ×", () => {
    expect(formatResolution(1920, 1080)).toBe("1920×1080");
  });

  it("returns a dash when either dimension is missing", () => {
    expect(formatResolution(null, 1080)).toBe("—");
    expect(formatResolution(1920, null)).toBe("—");
    expect(formatResolution(0, 0)).toBe("—");
    expect(formatResolution(undefined, undefined)).toBe("—");
  });
});
