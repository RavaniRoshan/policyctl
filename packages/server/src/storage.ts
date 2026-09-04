import type { Env } from "./types.js";

/**
 * S3-compatible object storage adapter (Filebase picked for its documented
 * no-card free tier: 5 GB storage + 5 GB egress/mo, hard caps, s3.filebase.io).
 *
 * UNWIRED by design: nothing in the product needs object storage today
 * (CSV streams, reports live in KV, AI insights in D1). When a workload
 * needs it (evidence attachments, report archives, avatars), set the
 * FILEBASE_* vars/secrets and call these helpers from a route.
 *
 * Auth: AWS Signature V4 over fetch — no SDK needed in Workers.
 */

export interface StorageConfig {
  endpoint: string; // e.g. https://s3.filebase.io
  bucket: string;
  accessKey: string;
  secretKey: string;
  region?: string;
}

export function storageConfig(env: Env): StorageConfig | null {
  const accessKey = env.FILEBASE_ACCESS_KEY;
  const secretKey = env.FILEBASE_SECRET_KEY;
  const bucket = env.FILEBASE_BUCKET;
  if (!accessKey || !secretKey || !bucket) return null;
  return {
    endpoint: env.FILEBASE_ENDPOINT ?? "https://s3.filebase.io",
    bucket,
    accessKey,
    secretKey,
    region: "us-east-1",
  };
}

async function hmac(key: ArrayBuffer | Uint8Array, msg: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key instanceof Uint8Array ? key : new Uint8Array(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(msg));
}

async function sha256Hex(msg: string | Uint8Array): Promise<string> {
  const data = typeof msg === "string" ? new TextEncoder().encode(msg) : msg;
  const hash = await crypto.subtle.digest("SHA-256", data as BufferSource);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

function amzDates(now = new Date()): { amzDate: string; dateStamp: string } {
  const p = (n: number) => String(n).padStart(2, "0");
  const dateStamp = `${now.getUTCFullYear()}${p(now.getUTCMonth() + 1)}${p(now.getUTCDate())}`;
  const amzDate = `${dateStamp}T${p(now.getUTCHours())}${p(now.getUTCMinutes())}${p(now.getUTCSeconds())}Z`;
  return { amzDate, dateStamp };
}

async function signedFetch(
  cfg: StorageConfig,
  method: string,
  key: string,
  query = "",
  body?: Uint8Array,
  contentType = "application/octet-stream",
): Promise<Response> {
  const region = cfg.region ?? "us-east-1";
  const service = "s3";
  const host = new URL(cfg.endpoint).host;
  const uri = `/${cfg.bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
  const { amzDate, dateStamp } = amzDates();
  const payloadHash = await sha256Hex(body ?? "");

  const canonicalHeaders =
    `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [method, uri, query, canonicalHeaders, signedHeaders, payloadHash].join("\n");

  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");

  const kDate = await hmac(new TextEncoder().encode("AWS4" + cfg.secretKey), dateStamp);
  const kRegion = await hmac(kDate, region);
  const kService = await hmac(kRegion, service);
  const kSigning = await hmac(kService, "aws4_request");
  const sigBuf = await hmac(kSigning, stringToSign);
  const signature = Array.from(new Uint8Array(sigBuf), (b) => b.toString(16).padStart(2, "0")).join("");

  const url = `${cfg.endpoint}${uri}${query ? `?${query}` : ""}`;
  return fetch(url, {
    method,
    headers: {
      "content-type": contentType,
      host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      Authorization:
        `AWS4-HMAC-SHA256 Credential=${cfg.accessKey}/${scope}, ` +
        `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    body: body ? body as BodyInit : undefined,
  });
}

function check(res: Response, op: string): void {
  if (!res.ok) throw new Error(`storage ${op} failed (${res.status})`);
}

/** Store bytes at key. Creates nothing else; throws on failure. */
export async function storagePut(
  cfg: StorageConfig,
  key: string,
  body: Uint8Array,
  contentType = "application/octet-stream",
): Promise<void> {
  check(await signedFetch(cfg, "PUT", key, "", body, contentType), "put");
}

/** Fetch bytes at key. Returns null on 404, throws otherwise. */
export async function storageGet(cfg: StorageConfig, key: string): Promise<Uint8Array | null> {
  const res = await signedFetch(cfg, "GET", key);
  if (res.status === 404) return null;
  check(res, "get");
  return new Uint8Array(await res.arrayBuffer());
}

/** Delete key (idempotent). */
export async function storageDelete(cfg: StorageConfig, key: string): Promise<void> {
  const res = await signedFetch(cfg, "DELETE", key);
  if (res.status !== 404) check(res, "delete");
}

/** List keys under prefix (up to 1000). Returns key names. */
export async function storageList(cfg: StorageConfig, prefix = ""): Promise<string[]> {
  const q = `list-type=2&max-keys=1000&prefix=${encodeURIComponent(prefix)}`;
  const res = await signedFetch(cfg, "GET", "", q);
  check(res, "list");
  const xml = await res.text();
  return [...xml.matchAll(/<Key>([^<]+)<\/Key>/g)].map((m) => m[1]);
}
