import { describe, it, expect } from "vitest";
import { isCaptionAnimation } from "@frametake/scene-schema";
import { MOTION, EFFECT, TRANSITION } from "@/lib/sceneToRenderRequest";
import {
  MOTION_TO_SCENE,
  GLYPH_MOTION_TO_SCENE,
  EFFECT_TO_SCENE,
  TRANSITION_TO_SCENE_KIND,
  WORD_ANIM_TO_CAPTION,
  MOTION_TYPES,
  EFFECT_TYPES,
  TRANSITION_TYPES,
  WORD_ANIMATION_STYLES,
  type MotionType,
  type EffectType,
  type TransitionType,
  type WordAnimationStyle,
} from "./maps";

/** Guards that the reverse tables (API → editor Scene) stay exact inverses of
 *  the forward tables in sceneToRenderRequest.ts — no drift from framelane-api. */
describe("render/maps drift cross-check", () => {
  it("EFFECT_TO_SCENE is the exact inverse of the forward EFFECT table", () => {
    // every forward editor→api has a matching reverse api→editor
    for (const [editorName, apiType] of Object.entries(EFFECT)) {
      expect(EFFECT_TO_SCENE[apiType as EffectType]).toBe(editorName);
    }
    // every reverse api→editor maps back to the same api under the forward table
    for (const [apiType, editorName] of Object.entries(EFFECT_TO_SCENE)) {
      if (apiType === "chroma_key") continue; // special: no editor kernel entry
      expect(EFFECT[editorName]).toBe(apiType);
    }
  });

  it("TRANSITION_TO_SCENE_KIND maps every API type to a forward-consistent editor kind", () => {
    for (const [apiType, kind] of Object.entries(TRANSITION_TO_SCENE_KIND)) {
      expect(TRANSITION[kind]).toBe(apiType);
    }
  });

  it("MOTION reverse tables reproduce every forward editor animation id", () => {
    for (const [editorId, entry] of Object.entries(MOTION)) {
      const table = entry.scope === "character" ? GLYPH_MOTION_TO_SCENE : MOTION_TO_SCENE;
      const pair = table[entry.type as MotionType];
      expect(pair, `no reverse entry for ${entry.type} (${editorId})`).toBeTruthy();
      expect(pair![entry.reversed ? 1 : 0]).toBe(editorId);
    }
  });

  it("every enum value has a reverse-table entry", () => {
    for (const t of MOTION_TYPES) expect(MOTION_TO_SCENE[t as MotionType]).toBeTruthy();
    for (const t of EFFECT_TYPES) expect(EFFECT_TO_SCENE[t as EffectType]).toBeTruthy();
    for (const t of TRANSITION_TYPES) expect(TRANSITION_TO_SCENE_KIND[t as TransitionType]).toBeTruthy();
  });

  it("WORD_ANIM_TO_CAPTION maps every style to a valid editor caption animation", () => {
    for (const style of WORD_ANIMATION_STYLES) {
      const anim = WORD_ANIM_TO_CAPTION[style as WordAnimationStyle];
      expect(anim, `${style} -> ${anim}`).toBeTruthy();
      // Must be a member of the editor's CAPTION_ANIMATIONS, else the preview
      // silently falls back to "highlight" (or nothing).
      expect(isCaptionAnimation(anim), `${style} -> ${anim} is not a caption animation`).toBe(true);
    }
  });
});
