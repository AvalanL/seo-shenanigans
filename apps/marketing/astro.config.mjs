import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.erabrollopsajt.se", // TODO: uppdatera till produktionsdomän
  integrations: [mdx(), sitemap()],
  markdown: {
    drafts: true,
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 600,
    },
  },
});
