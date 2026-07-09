// New projects are named for the user rather than prompting for one: a random,
// on-brand two-word name (e.g. "Golden Reel", "Neon Montage"). The user can
// rename later; this just avoids a naming ceremony and a wall of "Untitled".

const ADJECTIVES = [
  "Golden",
  "Crimson",
  "Silent",
  "Neon",
  "Velvet",
  "Midnight",
  "Electric",
  "Amber",
  "Cobalt",
  "Lush",
  "Vivid",
  "Hazy",
  "Radiant",
  "Dusky",
  "Frosted",
  "Molten",
  "Sunlit",
  "Twilight",
  "Emerald",
  "Scarlet",
];

const NOUNS = [
  "Reel",
  "Cut",
  "Take",
  "Frame",
  "Scene",
  "Sequence",
  "Montage",
  "Fade",
  "Loop",
  "Clip",
  "Storyboard",
  "Splice",
  "Dissolve",
  "Panorama",
  "Overture",
  "Prologue",
  "Vignette",
  "Reverie",
  "Cascade",
  "Aurora",
];

const pick = <T>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

/** A random two-word project name drawn from the film/video-themed word lists. */
export function randomProjectName(): string {
  return `${pick(ADJECTIVES)} ${pick(NOUNS)}`;
}
