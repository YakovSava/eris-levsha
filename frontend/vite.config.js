import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// В dev-режиме проксируем API/медиа на Django (локально или через nginx из compose).
const target = process.env.VITE_BACKEND || "http://localhost";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": target, "/media": target, "/admin": target } },
});
