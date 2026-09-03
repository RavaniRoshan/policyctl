import { requirePaidPlan, loadConfig, serverUrl } from "../hosted.js";
import { spinner, c, panel } from "../ui.js";
import { AuthError, NetworkError } from "../lib/errors.js";

export interface AuthorOptions {
  server?: string;
}

export async function authorCommand(opts: AuthorOptions): Promise<void> {
  const args = process.argv.slice(4); // node, script, command, subcommand, ...
  if (args.length === 0) {
    console.error("policyctl: missing prompt. Usage: policyctl author \"<intent>\"");
    process.exit(3);
    return;
  }
  const intent = args.join(" ");

  await requirePaidPlan(opts.server);
  const cfg = loadConfig();
  const server = serverUrl(opts.server);
  const spin = spinner("Authoring rule");
  try {
    const res = await fetch(`${server}/api/ai/author`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cfg.accessToken ?? cfg.token}`,
      },
      body: JSON.stringify({ intent }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new NetworkError(`author failed (${res.status}${text ? `: ${text}` : ""})`, res.status);
    }
    const data = (await res.json()) as { rule: string; explanation: string };
    spin.stop("ok");
    console.log(panel("generated rule", [
      `${c.muted("// ")}${c.primary(data.explanation || "AI-generated rule")}`,
      "",
      data.rule || "# (empty rule)",
    ]));
    console.log(c.muted("\nCopy the rule above into your .policyctl.yml and run `policyctl check` to test it."));
  } catch (e) {
    spin.stop("failed");
    if (e instanceof AuthError) throw e;
    throw new NetworkError(e instanceof Error ? e.message : String(e));
  }
}
