import type { EvaluationOutcome } from "@policyctl/core";
import { summary } from "./ui.js";

export function printOutcome(out: EvaluationOutcome, json?: boolean): void {
  if (json) {
    console.log(JSON.stringify(out, null, 2));
    return;
  }
  console.log(summary(out));
}
