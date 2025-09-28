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
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 4321,
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
      host: "0.0.0.0",
      port: process.env.PORT || 4321,
    },
    preview: {
      host: "0.0.0.0", 
      port: process.env.PORT || 4321,
      allowedHosts: "all"
    },
  },
});
