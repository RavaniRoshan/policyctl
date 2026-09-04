import { requirePaidPlan, serverUrl, getCloudToken, tokenProvider } from "../hosted.js";
import { http } from "../lib/http.js";
import { spinner, c, panel } from "../ui.js";
import { AuthError, NetworkError } from "../lib/errors.js";

export interface AuthorOptions {
  server?: string;
}

export async function authorCommand(prompt: string, opts: AuthorOptions): Promise<void> {
  const intent = (prompt ?? "").trim();
  if (!intent) {
    console.error("policyctl: missing prompt. Usage: policyctl author \"<intent>\"");
    process.exit(3);
    return;
  }

  await requirePaidPlan(opts.server);
  const server = serverUrl(opts.server);
  const token = await getCloudToken();
  const spin = spinner("Authoring rule");
  try {
    const res = await http(
      "/api/ai/author",
      {
        server,
        token,
        method: "POST",
        body: JSON.stringify({ intent }),
      },
      tokenProvider,
    );
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
