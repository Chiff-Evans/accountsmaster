import { webcrypto } from "crypto";
if (!globalThis.crypto) globalThis.crypto = webcrypto;

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-icon.svg", "notification-icon.png", "notification-badge.png"],
      manifest: {
        name: "Accounts Master",
        short_name: "Accounts Master",
        description: "Accounts Master",
        theme_color: "#0891b2",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "any",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable",
          },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,ico,woff2,png}"],
        globIgnores: ["**/node_modules/**"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      // A PWA needs an active service worker to be installable, so this
      // stays on in dev too. sw.js calls skipWaiting()/clientsClaim() so a
      // new version takes over immediately instead of serving stale code.
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ],
  server: {
    port: 8800,
    proxy: {
      "/api": { target: "http://localhost:8000", changeOrigin: true },
      "/uploads": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
  build: { outDir: "dist" },
});
