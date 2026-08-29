import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { TEMPLATES, TEMPLATE_NAMES } from "../templates.js";
import { panel, c } from "../ui.js";

export interface InitOptions {
  template?: string;
  path?: string;
  force?: boolean;
}

export function initCommand(opts: InitOptions): void {
  const cwd = opts.path ?? process.cwd();
  const target = join(cwd, ".policyctl.yml");
  if (existsSync(target) && !opts.force) {
    console.error(`policyctl: ${target} already exists (use --force to overwrite).`);
    process.exit(3);
  }
  const name = opts.template && TEMPLATES[opts.template] ? opts.template : "default";
  if (opts.template && !TEMPLATES[opts.template]) {
    console.error(
      `policyctl: unknown template "${opts.template}". Available: ${TEMPLATE_NAMES.join(", ")}`,
    );
    process.exit(3);
  }
  writeFileSync(target, TEMPLATES[name]);
  const lines = [
    `Scaffolded ${target}`,
    `template: ${c.primary(name)}`,
    "",
    c.muted("Next:"),
    `  ${c.muted("▶")} policyctl gen claude   ${c.muted("# wire agent hooks")}`,
    `  ${c.muted("▶")} policyctl check        ${c.muted("# gate the CI diff")}`,
  ];
  console.log(panel("policyctl · init", lines));
}
