// Minimal ambient types for node:sqlite (experimental; @types/node may lag).
declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(path: string, options?: unknown);
    exec(sql: string): void;
    prepare(sql: string): {
      run(...params: unknown[]): { lastInsertRowid: number | bigint };
      get(...params: unknown[]): unknown;
      all(...params: unknown[]): unknown[];
    };
    transaction(fn: (...args: any[]) => void): (...args: any[]) => void;
  }
}
