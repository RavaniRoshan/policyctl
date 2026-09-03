import { requirePaidPlan, loadConfig, serverUrl } from "../hosted.js";
import { spinner, c, panel } from "../ui.js";
import { AuthError, NetworkError } from "../lib/errors.js";

export interface OrgListOptions {
  server?: string;
}

export async function orgListCommand(_opts: OrgListOptions): Promise<void> {
  const cfg = loadConfig();
  if (!cfg.accessToken && !cfg.token) {
    console.error("policyctl: not logged in. Run `policyctl login` first.");
    process.exit(4);
    return;
  }
  const server = serverUrl(_opts.server);
  const spin = spinner("Fetching orgs");
  try {
    const res = await fetch(`${server}/api/orgs`, {
      headers: { authorization: `Bearer ${cfg.accessToken ?? cfg.token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new NetworkError(`org list failed (${res.status}${text ? `: ${text}` : ""})`, res.status);
    }
    const data = (await res.json()) as { orgs: { id: string; name: string; subscription_status?: string | null }[] };
    spin.stop("ok");
    if (data.orgs.length === 0) {
      console.log(panel("orgs", [c.muted("  (no organizations)")]));
      return;
    }
    const lines = data.orgs.map((o) => {
      const status = o.subscription_status ? c.muted(`(${o.subscription_status})`) : "";
      return `  ${c.primary(o.id.padStart(8))}  ${o.name}  ${status}`;
    });
    console.log(panel("orgs", lines));
  } catch (e) {
    spin.stop("failed");
    if (e instanceof AuthError) throw e;
    throw new NetworkError(e instanceof Error ? e.message : String(e));
  }
}

export interface OrgMembersOptions {
  server?: string;
}

export async function orgMembersCommand(orgId: string, _opts: OrgMembersOptions): Promise<void> {
  const cfg = loadConfig();
  if (!cfg.accessToken && !cfg.token) {
    console.error("policyctl: not logged in. Run `policyctl login` first.");
    process.exit(4);
    return;
  }
  const server = serverUrl(_opts.server);
  const spin = spinner("Fetching members");
  try {
    const res = await fetch(`${server}/api/orgs/${encodeURIComponent(orgId)}/members`, {
      headers: { authorization: `Bearer ${cfg.accessToken ?? cfg.token}` },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new NetworkError(`members failed (${res.status}${text ? `: ${text}` : ""})`, res.status);
    }
    const data = (await res.json()) as { members: { id: string; email: string; role: string }[] };
    spin.stop("ok");
    if (data.members.length === 0) {
      console.log(panel("members", [c.muted("  (no members)")]));
      return;
    }
    const lines = data.members.map((m) => `  ${c.primary(m.id.padStart(8))}  ${m.email.padEnd(24)}  ${m.role}`);
    console.log(panel("members", lines));
  } catch (e) {
    spin.stop("failed");
    if (e instanceof AuthError) throw e;
    throw new NetworkError(e instanceof Error ? e.message : String(e));
  }
}

export interface OrgInviteOptions {
  server?: string;
}

export async function orgInviteCommand(orgId: string, email: string, role: string, _opts: OrgInviteOptions): Promise<void> {
  const cfg = loadConfig();
  if (!cfg.accessToken && !cfg.token) {
    console.error("policyctl: not logged in. Run `policyctl login` first.");
    process.exit(4);
    return;
  }
  const server = serverUrl(_opts.server);
  const spin = spinner(`Inviting ${email}`);
  try {
    const res = await fetch(`${server}/api/orgs/${encodeURIComponent(orgId)}/members`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cfg.accessToken ?? cfg.token}`,
      },
      body: JSON.stringify({ email, role }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new NetworkError(`invite failed (${res.status}${text ? `: ${text}` : ""})`, res.status);
    }
    spin.stop(`invited ${email}`);
    console.log(`${c.success("✓")} Invited ${c.primary(email)} to org ${orgId} as ${role}`);
  } catch (e) {
    spin.stop("failed");
    if (e instanceof AuthError) throw e;
    throw new NetworkError(e instanceof Error ? e.message : String(e));
  }
}
