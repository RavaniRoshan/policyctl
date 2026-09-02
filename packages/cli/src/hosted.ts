import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface HostConfig {
  server: string;
  token?: string;
  email?: string;
}

const CONFIG_DIR = join(homedir(), ".policyctl");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export function loadConfig(): HostConfig {
  if (existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as HostConfig;
    } catch {
      /* ignore */
    }
  }
  return { server: process.env.POLICYCTL_SERVER ?? "https://policyctl.dev" };
}

export function saveConfig(cfg: HostConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), { mode: 0o600 });
  console.error(`policyctl: config saved to ${CONFIG_PATH}`);
}

export function serverUrl(override?: string): string {
  return override ?? loadConfig().server;
}

export interface ReportBody {
  repo?: string;
  agent?: string;
  results: unknown[];
}

/** Check whether the authenticated org is on a paid (active/trialing) plan.
 * Throws with a helpful message if not — call before any cloud command that
 * requires a subscription (push, report, pull).
 */
export async function requirePaidPlan(override?: string): Promise<void> {
  const cfg = loadConfig();
  if (!cfg.token) throw new Error("not logged in (run `policyctl login`)");
  const server = serverUrl(override);
  const res = await fetch(`${server}/api/billing/status`, {
    headers: { authorization: `Bearer ${cfg.token}` },
  });
  if (!res.ok) throw new Error(`billing check failed (${res.status})`);
  const status = (await res.json()) as { is_paid: boolean; is_trial: boolean };
  if (!status.is_paid && !status.is_trial) {
    throw new Error(
      "control plane subscription required. Visit /dashboard/billing to start a 14-day free trial.",
    );
  }
}

/** POST a violation outcome to the hosted feed. Throws on failure. */
export async function sendReport(body: ReportBody, override?: string): Promise<void> {
  await requirePaidPlan(override);
  const cfg = loadConfig();
  if (!cfg.token) throw new Error("not logged in (run `policyctl login`)");
  const server = serverUrl(override);
  const res = await fetch(`${server}/api/report`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${cfg.token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`report failed (${res.status})`);
}
