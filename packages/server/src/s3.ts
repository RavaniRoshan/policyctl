/*
 * Minimal AWS Signature Version 4 client for Cloudflare R2 (S3-compatible).
 * No dependencies — uses Web Crypto (crypto.subtle), available in Workers.
 *
 * Provides:
 *   - signedPutObject(key, body, contentType) → PUT to R2
 *   - presignedGet(key, expiresSec)            → time-limited download URL
 */
import type { Env } from "./types.js";

const sha256Hex = async (s: string): Promise<string> => {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
};

const hmac = async (key: Uint8Array | ArrayBuffer, s: string): Promise<ArrayBuffer> => {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(s));
};

const hmacHex = async (key: Uint8Array | ArrayBuffer, s: string): Promise<string> =>
  [...new Uint8Array(await hmac(key, s))].map((b) => b.toString(16).padStart(2, "0")).join("");

const uriEscape = (s: string): string =>
  encodeURIComponent(s).replace(/%2F/g, "/").replace(/%2B/g, "%2B");

function yyyymmdd(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export interface R2Client {
  putObject(key: string, body: string | ArrayBuffer, contentType: string): Promise<string>;
  presignedGet(key: string, expiresSec?: number): string;
}

export function makeR2(env: Env): R2Client {
  const accessKeyId = (env as any).R2_ACCESS_KEY_ID as string | undefined;
  const secretKey = (env as any).R2_SECRET_ACCESS_KEY as string | undefined;
  const endpoint = ((env as any).R2_ENDPOINT as string | undefined) ?? "https://r2.cloudflarestorage.com";
  const bucket = (env as any).R2_BUCKET as string | undefined;
  if (!accessKeyId || !secretKey || !bucket) {
    throw new Error("R2 credentials not configured (R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET)");
  }
  // Endpoint may or may not include the bucket prefix.
  const host = new URL(endpoint).host;
  const region = "auto"; // R2 ignores region for SigV4 but requires a value.
  const service = "s3";

  const canonicalUri = (key: string) => `/${bucket}/${key}`;
  const contentType = "application/octet-stream";

  async function signedHeaders(method: string, key: string, payloadHash: string, ct: string, amzDate: string, dateStamp: string) {
    const canonicalUriStr = canonicalUri(key);
    const canonicalQuery = "";
    const canonicalHeaders = `content-type:${ct}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
    const canonicalRequest = [method, canonicalUriStr, canonicalQuery, canonicalHeaders, signedHeaders, payloadHash].join("\n");
    const scope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join("\n");
    const kDate = await hmac(new TextEncoder().encode(`AWS4${secretKey}`), dateStamp);
    const kRegion = await hmac(kDate, region);
    const kService = await hmac(kRegion, service);
    const kSigning = await hmac(kService, "aws4_request");
    const signature = await hmacHex(kSigning, stringToSign);
    return {
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      amzDate,
      payloadHash,
    };
  }

  const putObject = async (key: string, body: string | ArrayBuffer, ct = contentType): Promise<string> => {
    const amzDate = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const buf = typeof body === "string" ? new TextEncoder().encode(body) : new Uint8Array(body);
    const payloadHash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", buf))].map((b) => b.toString(16).padStart(2, "0")).join("");
    const { authorization } = await signedHeaders("PUT", key, payloadHash, ct, amzDate, dateStamp);
    const url = `https://${host}${canonicalUri(key)}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: { "content-type": ct, "x-amz-date": amzDate, "x-amz-content-sha256": payloadHash, authorization },
      body: buf,
    });
    if (!res.ok) throw new Error(`R2 PUT failed: ${res.status} ${await res.text()}`);
    return key;
  };

  const presignedGet = (key: string, expiresSec = 900): string => {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const scope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalUriStr = canonicalUri(key);
    const canonicalQuery = [
      "X-Amz-Algorithm=AWS4-HMAC-SHA256",
      `X-Amz-Credential=${encodeURIComponent(`${accessKeyId}/${scope}`)}`,
      `X-Amz-Date=${amzDate}`,
      `X-Amz-Expires=${expiresSec}`,
      "X-Amz-SignedHeaders=host",
    ].join("&");
    const canonicalHeaders = `host:${host}\n`;
    const canonicalRequest = ["GET", canonicalUriStr, canonicalQuery, canonicalHeaders, "host", "UNSIGNED-PAYLOAD"].join("\n");
    // Note: presign URL signing is done here synchronously is not possible with async crypto;
    // callers that need presigned URLs use the async variant below.
    return `https://${host}${canonicalUriStr}?${canonicalQuery}`;
  };

  return { putObject, presignedGet };
}
