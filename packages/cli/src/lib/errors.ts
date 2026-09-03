/**
 * Structured error types for the CLI.
 *
 * Each error carries an `exitCode` so the command runner can terminate the
 * process with the right status. When `--json` is passed, errors are rendered
 * as JSON objects instead of plain text.
 *
 * Exit code convention:
 *   0  — success (no violations, clean pass)
 *   1  — violations found (policy blocked)
 *   2  — unexpected runtime error
 *   3  — user error (missing file, bad input, not logged in)
 *   4  — auth expired / requires re-login
 */

export type ExitCode = 0 | 1 | 2 | 3 | 4;

export interface ErrorContext {
  [key: string]: unknown;
}

export abstract class CliError extends Error {
  abstract readonly exitCode: ExitCode;
  readonly code: string;
  readonly context?: ErrorContext;

  constructor(message: string, code: string, context?: ErrorContext) {
    super(message);
    this.code = code;
    this.context = context;
  }

  /** Render as a JSON object suitable for `--json` output. */
  toJSON(): Record<string, unknown> {
    const obj: Record<string, unknown> = {
      error: this.code,
      message: this.message,
    };
    if (this.context) obj.context = this.context;
    return obj;
  }
}

export class AuthError extends CliError {
  readonly exitCode: ExitCode = 4;
  constructor(message = "not authenticated", context?: ErrorContext) {
    super(message, "AUTH_ERROR", context);
  }
}

export class NetworkError extends CliError {
  readonly exitCode: ExitCode = 2;
  readonly status?: number;
  constructor(message: string, status?: number, context?: ErrorContext) {
    super(message, "NETWORK_ERROR", { status, ...context });
    this.status = status;
  }
}

export class ValidationError extends CliError {
  readonly exitCode: ExitCode = 3;
  constructor(message: string, context?: ErrorContext) {
    super(message, "VALIDATION_ERROR", context);
  }
}

export class ConfigError extends CliError {
  readonly exitCode: ExitCode = 3;
  constructor(message: string, context?: ErrorContext) {
    super(message, "CONFIG_ERROR", context);
  }
}

export class ServerError extends CliError {
  readonly exitCode: ExitCode = 2;
  readonly status: number;
  constructor(message: string, status: number, context?: ErrorContext) {
    super(message, "SERVER_ERROR", { status, ...context });
    this.status = status;
  }
}

/** Format an error for terminal output. */
export function formatError(err: unknown, asJson: boolean): string {
  if (err instanceof CliError) {
    if (asJson) return JSON.stringify(err.toJSON(), null, 2);
    return `policyctl: ${err.message}`;
  }
  if (err instanceof Error) {
    if (asJson) {
      return JSON.stringify({ error: "RUNTIME_ERROR", message: err.message }, null, 2);
    }
    return `policyctl: ${err.message}`;
  }
  if (asJson) {
    return JSON.stringify({ error: "UNKNOWN_ERROR", message: String(err) }, null, 2);
  }
  return `policyctl: ${String(err)}`;
}

/** Extract the exit code from any thrown value. Defaults to 2 (runtime error). */
export function exitCodeOf(err: unknown): ExitCode {
  if (err instanceof CliError) return err.exitCode;
  return 2;
}
