import { readFileSync } from "node:fs";
import { parse } from "yaml";
import type { Policy } from "./types.js";

export function loadPolicyFromString(yamlText: string): Policy {
  const doc = parse(yamlText) as Partial<Policy> | null;
  if (!doc || typeof doc !== "object" || !Array.isArray(doc.rules)) {
    throw new Error("Invalid policy: missing a `rules` array at the top level.");
  }
  for (const [i, rule] of doc.rules.entries()) {
    if (!rule.id) throw new Error(`Invalid policy: rule #${i + 1} is missing an \`id\`.`);
    if (!rule.when || Object.keys(rule.when).length === 0) {
      throw new Error(`Invalid policy: rule "${rule.id}" has no \`when\` matchers.`);
    }
    if ("all" in rule.when || "any" in rule.when) {
      const g = rule.when as { all?: unknown; any?: unknown };
      if (!Array.isArray(g.all) && !Array.isArray(g.any)) {
        throw new Error(
          `Invalid policy: rule "${rule.id}" group needs \`all\` or \`any\` arrays.`,
        );
      }
    }
    if (!["block", "fail", "warn"].includes(rule.enforce)) {
      throw new Error(
        `Invalid policy: rule "${rule.id}" has enforce="${rule.enforce}" (expected block|fail|warn).`,
      );
    }
    if (!["hook", "ci", "both"].includes(rule.scope)) {
      throw new Error(
        `Invalid policy: rule "${rule.id}" has scope="${rule.scope}" (expected hook|ci|both).`,
      );
    }
  }
  if (doc.exceptions) {
    for (const e of doc.exceptions) {
      if (e.enforce && !["warn", "ignore"].includes(e.enforce)) {
        throw new Error(
          `Invalid policy: exception enforce="${e.enforce}" (expected warn|ignore).`,
        );
      }
    }
  }
  return doc as Policy;
}

export function loadPolicyFile(path: string): Policy {
  return loadPolicyFromString(readFileSync(path, "utf8"));
}
