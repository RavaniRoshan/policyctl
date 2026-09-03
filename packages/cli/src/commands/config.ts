import { loadConfig, saveConfig, CONFIG_PATH } from "../hosted.js";
import { c, panel } from "../ui.js";

export interface ConfigOptions {
  server?: string;
}

export interface ConfigSetOptions {
  key: string;
  value: string;
}

export interface ConfigGetOptions {
  key: string;
}

const CONFIG_KEYS = ["server", "email", "orgId"] as const;

/**
 * `policyctl config` — list all config values.
 */
export function configCommand(opts: ConfigOptions): void {
  const cfg = loadConfig();
  const server = opts.server ?? cfg.server;
  const lines = CONFIG_KEYS.map((k) => {
    const v = cfg[k];
    return `  ${c.muted(k)} ${v ? c.primary(String(v)) : c.muted("(not set)")}`;
  });
  console.log(
    panel("policyctl config", [
      ...lines,
      "",
      c.muted(`Config file: ${CONFIG_PATH}`),
    ]),
  );
}

/**
 * `policyctl config set <key> <value>` — set a config value.
 */
export function configSetCommand(opts: ConfigSetOptions): void {
  if (!CONFIG_KEYS.includes(opts.key as any)) {
    console.error(
      `policyctl: invalid config key "${opts.key}". Valid keys: ${CONFIG_KEYS.join(", ")}`,
    );
    process.exit(3);
    return;
  }

  const cfg = loadConfig();
  if (opts.key === "server") {
    cfg.server = opts.value;
  } else if (opts.key === "email") {
    cfg.email = opts.value;
  } else if (opts.key === "orgId") {
    cfg.orgId = opts.value;
  }
  saveConfig(cfg);
  console.log(`${c.success("✓")} Set ${c.primary(opts.key)} = ${c.primary(opts.value)}`);
}

/**
 * `policyctl config get <key>` — get a single config value.
 */
export function configGetCommand(opts: ConfigGetOptions): void {
  if (!CONFIG_KEYS.includes(opts.key as any)) {
    console.error(
      `policyctl: invalid config key "${opts.key}". Valid keys: ${CONFIG_KEYS.join(", ")}`,
    );
    process.exit(3);
    return;
  }

  const cfg = loadConfig();
  const v = cfg[opts.key as keyof typeof cfg];
  if (v === undefined) {
    console.log(`${opts.key}: (not set)`);
  } else {
    console.log(`${opts.key}: ${v}`);
  }
}
