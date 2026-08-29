// Aesthetic terminal presentation layer for policyctl.
// Trends followed: Charm-style muted palette, gradient wordmark, boxed panels,
// purposeful glyphs, next-step hints. Degrades to plain text when piped (no TTY / NO_COLOR).

const SUPPORTED =
  !!process.stdout.isTTY && !process.env.NO_COLOR || process.env.FORCE_COLOR === "1";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function truecolor(hex: string): (s: string) => string {
  const { r, g, b } = hexToRgb(hex);
  return (s) => (SUPPORTED ? `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m` : s);
}

function esc(code: string): (s: string) => string {
  return (s) => (SUPPORTED ? `\x1b[${code}m${s}\x1b[0m` : s);
}

export const bold = esc("1");
export const dim = esc("2");
export const italic = esc("3");
export const underline = esc("4");
export const c = {
  primary: truecolor("#8B7CF6"),
  success: truecolor("#4ECE8F"),
  warn: truecolor("#F5C451"),
  danger: truecolor("#FF6B6B"),
  muted: truecolor("#8A8FA3"),
  text: (s: string) => s,
};

export function gradient(text: string, from = "#8B7CF6", to = "#4ECE8F"): string {
  if (!SUPPORTED) return text;
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const chars = Array.from(text);
  return chars
    .map((ch, i) => {
      const t = chars.length === 1 ? 0 : i / (chars.length - 1);
      const r = Math.round(a.r + (b.r - a.r) * t);
      const g = Math.round(a.g + (b.g - a.g) * t);
      const bl = Math.round(a.b + (b.b - a.b) * t);
      return `\x1b[38;2;${r};${g};${bl}m${ch}\x1b[0m`;
    })
    .join("");
}

/** Gradient wordmark, e.g. `policyctl`. */
export function wordmark(): string {
  return gradient("policyctl");
}

const GLYPH = {
  ok: SUPPORTED ? "✓" : "ok",
  fail: SUPPORTED ? "✗" : "FAIL",
  warn: SUPPORTED ? "▲" : "WARN",
  arrow: SUPPORTED ? "▶" : ">",
  bullet: SUPPORTED ? "•" : "-",
};

export function mark(kind: "ok" | "fail" | "warn"): string {
  if (kind === "ok") return c.success(GLYPH.ok);
  if (kind === "warn") return c.warn(GLYPH.warn);
  return c.danger(GLYPH.fail);
}

/** Boxed panel. `title` sits in the top border; `lines` are body rows. */
export function panel(title: string, lines: string[]): string {
  if (!SUPPORTED) {
    const body = [title, ...lines].map((l) => (l ? `  ${l}` : "")).join("\n");
    return body;
  }
  const innerWidth = Math.max(
    title.length,
    ...lines.map((l) => stripLen(l)),
    24,
  );
  const top = `╭─ ${title} ${"─".repeat(Math.max(0, innerWidth - title.length - 1))}╮`;
  const bottom = `╰${"─".repeat(innerWidth + 3)}╯`;
  const body = lines.map((l) => `│ ${padLine(l, innerWidth)} │`).join("\n");
  return [top, body, bottom].join("\n");
}

function stripLen(s: string): number {
  return s.replace(/\x1b\[[0-9;]*m/g, "").length;
}
function padLine(s: string, width: number): string {
  const len = stripLen(s);
  return len >= width ? s : s + " ".repeat(width - len);
}

/** A clean, scannable table of rules. */
export function ruleTable(
  rules: { id: string; scope: string; enforce: string; description?: string }[],
): string {
  if (rules.length === 0) return c.muted("  (no rules)");
  const col = (s: string, w: number) => {
    const clean = stripLen(s);
    return clean >= w ? s : s + " ".repeat(w - clean);
  };
  const idW = Math.max(4, ...rules.map((r) => stripLen(r.id)));
  const scW = 6;
  const enW = 7;
  const header = `  ${bold(col("RULE", idW))}  ${bold(col("SCOPE", scW))}  ${bold(col("ENFORCE", enW))}  ${bold("DESCRIPTION")}`;
  const rows = rules.map((r) => {
    const scope = r.scope === "both" ? c.primary(r.scope) : c.muted(r.scope);
    const en =
      r.enforce === "block" || r.enforce === "fail"
        ? c.danger(r.enforce)
        : r.enforce === "warn"
          ? c.warn(r.enforce)
          : c.muted(r.enforce);
    return `  ${col(r.id, idW)}  ${col(scope, scW)}  ${col(en, enW)}  ${c.muted(r.description ?? "")}`;
  });
  return [header, ...rows].join("\n");
}

/** The check/eval result block. */
export function summary(
  outcome: { results: { ruleId: string; description?: string; enforce: string; message: string }[]; exitCode: 0 | 1 | 2 },
): string {
  if (outcome.results.length === 0) {
    return panel("policy check", [c.success(`${GLYPH.ok} No policy violations`), ""]) ;
  }
  const blocks = outcome.results.filter((r) => r.enforce === "block" || r.enforce === "fail").length;
  const warns = outcome.results.length - blocks;
  const lines = outcome.results.map((r) => {
    const label = r.enforce === "warn" ? c.warn(GLYPH.warn) : c.danger(GLYPH.fail);
    const id = r.enforce === "warn" ? c.warn(r.ruleId) : c.danger(r.ruleId);
    const msg = c.muted(r.description ?? r.message);
    return `  ${label} ${id}  ${msg}`;
  });
  const footer =
    blocks > 0
      ? c.danger(`  ${blocks} blocking · ${warns} warning${warns === 1 ? "" : "s"} — build stopped`)
      : c.warn(`  ${warns} warning${warns === 1 ? "" : "s"} (non-blocking)`);
  return panel(`${outcome.results.length} violation${outcome.results.length === 1 ? "" : "s"}`, [
    ...lines,
    "",
    footer,
  ]);
}

/** A checklist of completed actions (e.g. generated files). */
export function taskList(items: string[]): string {
  return items.map((it) => `  ${mark("ok")} ${it}`).join("\n");
}

/** A dim "next step" hint line. */
export function hint(steps: string[]): string {
  if (steps.length === 0) return "";
  const head = c.muted("Next:");
  const body = steps.map((s) => `  ${c.muted(GLYPH.arrow)} ${s}`).join("\n");
  return `${head}\n${body}`;
}

/** Tiny TTY-only spinner for network calls. Returns a stop(text) function. */
export function spinner(text: string): { stop: (result: string) => void } {
  if (!SUPPORTED) {
    process.stderr.write(`${text}…\n`);
    return { stop: () => {} };
  }
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let i = 0;
  const id = setInterval(() => {
    process.stderr.write(`\r${c.muted(frames[i % frames.length])} ${text}`);
    i++;
  }, 80);
  return {
    stop: (result: string) => {
      clearInterval(id);
      process.stderr.write(`\r${mark("ok")} ${text}${result ? c.muted(` — ${result}`) : ""}\n`);
    },
  };
}
