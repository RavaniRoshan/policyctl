import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: "https://policyctl.dev",
  output: "static",
  integrations: [tailwind()],
  markdown: { shikiConfig: { theme: "github-dark-dimmed" } },
});
