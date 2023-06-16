import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/globalSetup.js"],
  },
});
