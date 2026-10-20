import path from "node:path";
import { defineConfig } from "vitest/config";

const root = process.cwd();

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    clearMocks: true,
    restoreMocks: true,
  },
});
