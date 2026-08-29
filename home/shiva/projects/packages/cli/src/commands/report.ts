import { basename } from "node:path";
import { readStdin } from "../stdin.js";
import { sendReport, type ReportBody } from "../hosted.js";

export interface ReportOptions {
  server?: string;
  repo?: string;
  agent?: string;
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
  try {
    await sendReport(body, opts.server);
  } catch (e) {
    console.error(`policyctl: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
    return;
  }
  console.log(`policyctl: reported ${body.results.length} violation(s)`);
}
