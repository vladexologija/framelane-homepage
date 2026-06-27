import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Honors tsconfig `paths` (so `@/*` and the vendored `@frametake/scene-schema`
// resolve the same way as in the app build).
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // The vendored editor bundle is huge and runtime-only; never collect it.
    exclude: ["node_modules", "vendor", ".next"],
  },
});
