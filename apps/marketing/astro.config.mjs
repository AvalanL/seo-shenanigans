import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.erabrollopsajt.se", // TODO: uppdatera till produktionsdomän
  integrations: [mdx(), sitemap()],
  markdown: {
    drafts: true,
  },
  vite: {
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
    },
    server: {
      host: true,
      port: process.env.PORT || 4321,
    },
    preview: {
      host: true,
      port: process.env.PORT || 4321,
      allowedHosts: [
        "seo-shenanigans-production.up.railway.app",
        ".railway.app",
        "localhost",
        "127.0.0.1"
      ]
    },
  },
});
