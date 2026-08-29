import { randomBytes } from "node:crypto";

export function newToken(): string {
  return randomBytes(24).toString("hex");
}
