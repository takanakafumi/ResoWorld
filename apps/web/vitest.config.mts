import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: [
      "src/**/*.test.ts",
      ...(process.env.RUN_YAMATAI_ATLAS === "true"
        ? ["../../data/imports/evaluations/yamatai.atlas.live.test.ts"]
        : []),
    ],
  },
});
