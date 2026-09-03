import { basename } from "node:path";
import { readStdin } from "../stdin.js";
import { sendReport, type ReportBody } from "../hosted.js";
import { spinner, c } from "../ui.js";
import { formatError, exitCodeOf } from "../lib/errors.js";

export interface ReportOptions {
  server?: string;
  repo?: string;
  agent?: string;
  json?: boolean;
}

export async function reportCommand(opts: ReportOptions): Promise<void> {
  const raw = await readStdin();
  let payload: { repo?: string; agent?: string; results?: unknown[] };
  try {
    payload = JSON.parse(raw) as typeof payload;
  } catch {
    console.error("policyctl: invalid JSON on stdin.");
    process.exit(3);
    return;
  }
  const body: ReportBody = {
    repo: opts.repo ?? payload.repo ?? basename(process.cwd()),
    agent: opts.agent ?? payload.agent ?? "ci",
    results: payload.results ?? [],
  };
  const spin = spinner(`Reporting ${body.results.length} violation(s)`);
  try {
    await sendReport(body, opts.server);
  } catch (e) {
    spin.stop("failed");
    console.error(formatError(e, opts.json ?? false));
    process.exit(exitCodeOf(e));
    return;
  }
  spin.stop(`for ${c.muted(body.repo ?? "")}`);
}
