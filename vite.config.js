import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// AG Dispatch — Vite + React 19 + Tailwind CSS v4
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
