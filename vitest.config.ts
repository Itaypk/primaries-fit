import { defineConfig } from "vitest/config";

// The engine is pure and framework-agnostic — a plain node environment is all
// the tests need (no jsdom, no React).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
