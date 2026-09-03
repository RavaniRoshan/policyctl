#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Command } from "commander";
const pkg = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf8"));
import { checkCommand } from "./commands/check.js";
import { evalCommand } from "./commands/eval.js";
import { listCommand } from "./commands/list.js";
import { initCommand } from "./commands/init.js";
import { genCommand } from "./commands/gen.js";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { configCommand, configSetCommand, configGetCommand } from "./commands/config.js";
import { pushCommand } from "./commands/push.js";
import { pullCommand } from "./commands/pull.js";
import { reportCommand } from "./commands/report.js";
import { doctorCommand } from "./commands/doctor.js";
import { traceCommand, traceCommandAsync } from "./commands/trace.js";
import { testCommand } from "./commands/test.js";
import { authorCommand } from "./commands/author.js";
import { orgListCommand, orgMembersCommand, orgInviteCommand } from "./commands/org.js";
import { TEMPLATE_NAMES } from "./templates.js";

const program = new Command();

program
  .name("policyctl")
  .description("Provider-agnostic policy runtime for coding agents.")
  .version(pkg.version);

program
  .command("init")
  .description("Scaffold a .policyctl.yml from a starter template.")
  .option("--template <name>", `template: ${TEMPLATE_NAMES.join(", ")}`)
  .option("--path <dir>", "target directory (default: cwd)")
  .option("--force", "overwrite an existing file")
  .action(initCommand);

program
  .command("check")
  .description("Evaluate CI/diff-scope rules against the git diff. Non-zero exit on violation.")
  .option("--from <ref>", "diff base ref")
  .option("--to <ref>", "diff head ref (default: HEAD)")
  .option("--policy <path>", "policy file path")
  .option("--json", "emit JSON")
  .option("--report", "send violations to the hosted feed (requires `policyctl login`)")
  .option("--report-strict", "exit non-zero if the report upload itself fails")
  .option("--repo <name>", "repo label for the hosted report")
  .action(checkCommand);

program
  .command("eval")
  .description("Evaluate hook-scope rules on a tool call (reads JSON from stdin).")
  .requiredOption("--hook", "hook evaluation mode")
  .option("--policy <path>", "policy file path")
  .option("--json", "emit JSON")
  .action(evalCommand);

program
  .command("list")
  .description("List loaded rules and their scope.")
  .option("--policy <path>", "policy file path")
  .action(listCommand);

program
  .command("gen <provider>")
  .description("Generate provider hook glue (claude | codex | cursor).")
  .option("--print", "print generated files instead of writing them")
  .option("--policy <path>", "policy file path")
  .option("--path <dir>", "target directory (default: cwd)")
  .action(genCommand);

program
  .command("doctor")
  .description("Verify that provider hooks and the pre-commit gate are wired correctly.")
  .action(doctorCommand);

program
  .command("trace")
  .description("Explain which matchers fire (or don't) for a given tool call or diff.")
  .requiredOption("--mode <hook|ci>")
  .option("--diff <file>", "diff file (ci mode only)")
  .option("--policy <path>", "policy file path")
  .action(traceCommandAsync);

program
  .command("test")
  .description("Run the policy against a fixture suite and assert expected exit codes.")
  .option("--policy <path>", "policy file path")
  .option("--suite <file>", "fixture file (default: .policyctl.test.json)")
  .action(testCommand);

program
  .command("login")
  .description("Authenticate with the hosted control plane via Auth0 device flow.")
  .option("--server <url>", "control-plane URL (or POLICYCTL_SERVER)")
  .action(loginCommand);

program
  .command("logout")
  .description("Clear local credentials and log out of the control plane.")
  .action(logoutCommand);

program
  .command("whoami")
  .description("Show the currently authenticated user and org.")
  .option("--server <url>", "control-plane URL (or POLICYCTL_SERVER)")
  .action(whoamiCommand);

program
  .command("config")
  .description("View, set, or get local configuration.")
  .argument("[key]", "config key to get (or use with --set/--list)")
  .action(configCommand);

program
  .command("config:set")
  .description("Set a config value (key: server | email | orgId).")
  .argument("<key>", "config key")
  .argument("<value>", "config value")
  .action(configSetCommand);

program
  .command("config:get")
  .description("Get a config value (key: server | email | orgId).")
  .argument("<key>", "config key")
  .action(configGetCommand);

program
  .command("push")
  .description("Push the local policy to the hosted control plane.")
  .option("--policy <path>", "policy file path")
  .option("--server <url>", "control-plane URL")
  .option("--dry-run", "validate and show what would be published without uploading")
  .option("--note <text>", "optional description for this version")
  .action(pushCommand);

program
  .command("pull")
  .description("Pull the policy from the hosted control plane into this repo.")
  .option("--policy <path>", "output policy path")
  .option("--force", "overwrite an existing file")
  .option("--server <url>", "control-plane URL")
  .option("--dry-run", "validate and print the policy without writing to disk")
  .action(pullCommand);

program
  .command("report")
  .description("Send a violation outcome (JSON on stdin) to the hosted feed.")
  .option("--repo <name>", "repo label")
  .option("--agent <name>", "agent label (default: ci)")
  .option("--server <url>", "control-plane URL")
  .action(reportCommand);

program
  .command("author <prompt>")
  .description("Generate a policy rule from a natural-language prompt (paid tier required).")
  .option("--server <url>", "control-plane URL")
  .action(authorCommand);

program
  .command("org")
  .description("Manage organizations (list, members, invite).")
  .action(() => {
    console.error("policyctl: see `policyctl org --help` for subcommands.");
    process.exit(3);
  });

program
  .command("org:list")
  .description("List organizations for the authenticated user.")
  .option("--server <url>", "control-plane URL")
  .action(orgListCommand);

program
  .command("org:members <orgId>")
  .description("List members of an organization.")
  .option("--server <url>", "control-plane URL")
  .action(orgMembersCommand);

program
  .command("org:invite <orgId> <email>")
  .description("Invite a member to an organization.")
  .option("--role <role>", "member role (owner | admin | member | viewer)", "member")
  .option("--server <url>", "control-plane URL")
  .action((orgId: string, email: string, opts: { role?: string; server?: string }) =>
    orgInviteCommand(orgId, email, opts.role ?? "member", { server: opts.server })
  );

program.parseAsync(process.argv);
