import { requirePaidPlan, loadConfig, serverUrl, getBearerToken, tokenProvider } from "../hosted.js";
import { http } from "../lib/http.js";
import { spinner, c, panel } from "../ui.js";
import { AuthError, NetworkError } from "../lib/errors.js";

/** Fresh Auth0 token (refreshing silently) with legacy-token fallback. */
async function orgToken(): Promise<string> {
  const cfg = loadConfig();
  return ((await getBearerToken().catch(() => null)) ?? cfg.accessToken ?? cfg.token) as string;
}

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
    const res = await http("/api/orgs", { server, token: await orgToken() }, tokenProvider);
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
    const res = await http(
      `/api/orgs/${encodeURIComponent(orgId)}/members`,
      { server, token: await orgToken() },
      tokenProvider,
    );
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
    await http(
      `/api/orgs/${encodeURIComponent(orgId)}/members`,
      {
        server,
        token: await orgToken(),
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, role }),
      },
      tokenProvider,
    );
    spin.stop(`invited ${email}`);
    console.log(`${c.success("✓")} Invited ${c.primary(email)} to org ${orgId} as ${role}`);
  } catch (e) {
    spin.stop("failed");
    if (e instanceof AuthError) throw e;
    throw new NetworkError(e instanceof Error ? e.message : String(e));
  }
}
