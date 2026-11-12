import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/elf-ideas/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        id: "/elf-ideas/",
        name: "Elf Ideas",
        short_name: "Elf Ideas",
        description:
          "Nivaan's Elf on the Shelf ideas from 2020 to 2024. Plan each night on your phone. Nothing leaves this device.",
        lang: "en",
        start_url: "/elf-ideas/",
        scope: "/elf-ideas/",
        display: "standalone",
        orientation: "any",
        background_color: "#fbf6ee",
        theme_color: "#fbf6ee",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,woff,woff2,webmanifest,ico}"],
        navigateFallback: "/elf-ideas/index.html",
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  server: { host: "127.0.0.1", port: 5173 },
  preview: { host: "127.0.0.1", port: 4173 },
});
