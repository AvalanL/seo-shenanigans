import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { getAllowedHosts } from "./config/allowed-hosts.mjs";

const allowedHosts = getAllowedHosts();

export default defineConfig({
  site: "https://www.erabrollopsajt.se", // TODO: uppdatera till produktionsdomän
  integrations: [mdx(), sitemap()],
  markdown: {
    drafts: true,
  },
  server: {
    host: true,
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
      host: true,
      port: process.env.PORT || 4321,
      allowedHosts
    },
    preview: {
      host: true,
      port: process.env.PORT || 4321,
      allowedHosts
    },
  },
});
