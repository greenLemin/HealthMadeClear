import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/*.test.{ts,tsx}", "**/*.d.ts", "**/*.md", "src/data/**", "src/messages/**"],
      thresholds: {
        // Raised incrementally from 50/49/45/45 — current actuals ~51/52/47/49.
        // Bump again as coverage grows; do not jump ahead of actuals.
        lines: 50.5,
        statements: 51,
        functions: 46,
        branches: 47,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/lib/__mocks__/server-only.ts"),
    },
  },
});
