import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.spec.{js,ts}"],
    css: true,
    server: {
      deps: {
        inline: ["vuetify"],
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
