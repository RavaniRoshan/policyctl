import { findPolicyPath } from "../policy.js";
import {
  installPreCommit,
  writeClaude,
  writeCodex,
  writeCursor,
} from "../adapters.js";
import { mark, c, wordmark } from "../ui.js";

export interface GenOptions {
  print?: boolean;
  policy?: string;
  path?: string;
}

const PROVIDERS = ["claude", "codex", "cursor"] as const;

export function genCommand(provider: string, opts: GenOptions): void {
  if (!PROVIDERS.includes(provider as (typeof PROVIDERS)[number])) {
    console.error(
      `policyctl: unknown provider "${provider}". Use one of: ${PROVIDERS.join(", ")}`,
    );
    process.exit(3);
  }
  const cwd = opts.path ?? process.cwd();
  const policyPath = opts.policy ?? findPolicyPath(cwd);
  if (!policyPath) {
    console.error("policyctl: no policy file found (.policyctl.yml). Run `policyctl init`.");
    process.exit(3);
  }
  const dry = !!opts.print;
  const written: string[] = [];

  if (provider === "claude") {
    const f = writeClaude(cwd, dry);
    if (dry) console.log("# .claude/settings.json\n" + f);
    else written.push(f);
  } else if (provider === "codex") {
    const f = writeCodex(cwd, dry);
    if (dry) console.log("# .codex/config.toml\n" + f);
    else written.push(f);
  } else {
    const files = writeCursor(cwd, policyPath, dry);
    if (dry) {
      console.log("# .cursor/rules/policy.mdc\n" + files[0]);
      console.log("# .cursor/hooks.json\n" + files[1]);
    } else {
      for (const f of files) written.push(f);
    }
  }

  const pc = installPreCommit(cwd, dry);
  if (dry) {
    console.log("# .git/hooks/pre-commit\n" + (pc ?? "# (not a git repo)"));
    console.error("\n(preview only — re-run without --print to write files)");
    process.exit(0);
  }
  if (pc) written.push(pc);

  const taskLines = written.map((w) => `  ${mark("ok")} ${c.muted(w)}`);
  console.log(`${wordmark()} ${c.muted(`generated ${provider} hook glue`)}`);
  console.log(taskLines.join("\n"));
  console.log(c.muted("\nEnsure `policyctl` is on PATH for the hooks to run."));
}
