// Generates machine-readable docs after `astro build`:
//   dist/llms.txt        — section index with descriptions (for agents)
//   dist/llms-full.txt   — concatenated full text of every page
//   dist/<slug>.md       — raw Markdown per page (e.g. reference/cli-commands.md)
// Served at /docs/llms.txt, /docs/llms-full.txt, /docs/<slug>.md because
// the web build copies docs/dist → web/dist/docs.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "src", "content", "docs");
const distDir = join(root, "dist");
const SITE = "https://policyctl-web.pages.dev";
const BASE = "/docs";

const SECTION_LABELS = {
  "get-started": "Get Started",
  tutorials: "Tutorials & Provider Setup",
  guides: "Guides",
  "how-to": "How-To Guides",
  reference: "Reference",
  concepts: "Concepts",
};

function walk(dir) {
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function parsePage(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  let title = relative(contentDir, file).replace(/\.mdx?$/, "").replace(/_/g, " ");
  let description = "";
  let body = raw;
  if (m) {
    body = m[2];
    const get = (k) => (m[1].match(new RegExp(`^${k}:\\s*(.+)$`, "m")) || [])[1] || "";
    const unquote = (s) => s.trim().replace(/^["']|["']$/g, "");
    if (get("title")) title = unquote(get("title"));
    if (get("description")) description = unquote(get("description"));
  }
  const slug = relative(contentDir, file).replace(/\.mdx?$/, "");
  const url = slug === "index" ? `${SITE}${BASE}/` : `${SITE}${BASE}/${slug}/`;
  return { file, slug, title, description, body: body.trim() + "\n", url };
}

const pages = walk(contentDir)
  .filter((f) => f.endsWith(".md")) // skip .mdx (component-heavy, not raw-readable)
  .map(parsePage)
  .sort((a, b) => a.slug.localeCompare(b.slug));

// 1. Per-page raw Markdown
for (const p of pages) {
  const out = join(distDir, `${p.slug}.md`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `# ${p.title}\n\n> Source: ${p.url}\n\n${p.body}`);
}

// 2. llms.txt index, grouped by section
const groups = new Map();
for (const p of pages) {
  const dir = p.slug.includes("/") ? p.slug.split("/")[0] : "(root)";
  if (!groups.has(dir)) groups.set(dir, []);
  groups.get(dir).push(p);
}
let index = `# policyctl docs\n\n> Deterministic policy enforcement for coding agents. One .policyctl.yml file enforces rules across Claude Code, OpenAI Codex, Cursor, and CI pipelines.\n`;
for (const [dir, list] of groups) {
  index += `\n## ${SECTION_LABELS[dir] || dir}\n`;
  for (const p of list) index += `- [${p.title}](${p.url})${p.description ? `: ${p.description}` : ""}\n`;
}
writeFileSync(join(distDir, "llms.txt"), index);

// 3. llms-full.txt concatenation
const full = pages.map((p) => `---\n# ${p.title}\nURL: ${p.url}\n---\n\n${p.body}`).join("\n");
writeFileSync(join(distDir, "llms-full.txt"), full);

console.log(`[machine-readable] ${pages.length} pages → llms.txt, llms-full.txt, per-page .md`);
