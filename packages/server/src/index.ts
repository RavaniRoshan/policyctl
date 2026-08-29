import { createServer } from "node:http";
import { Readable } from "node:stream";
import { Hono } from "hono";
import { db } from "./db.js";
import { newToken } from "./auth.js";

const app = new Hono();
const API = "/api";

function authUserId(c: {
  req: { header: (k: string) => string | undefined; query: (k: string) => string | undefined };
}): number | null {
  const h = c.req.header("authorization") ?? "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : (c.req.query("token") ?? "");
  const row = db.prepare("SELECT id FROM users WHERE token = ?").get(token) as
    | { id: number }
    | undefined;
  return row ? row.id : null;
}

app.post(`${API}/login`, async (c) => {
  const { email } = await c.req.json<{ email?: string }>().catch(() => ({}) as { email?: string });
  if (!email) return c.json({ error: "email required" }, 400);
  const existing = db.prepare("SELECT id, token FROM users WHERE email = ?").get(email) as
    | { id: number; token: string }
    | undefined;
  if (existing) return c.json({ token: existing.token, email });
  const token = newToken();
  const info = db
    .prepare("INSERT INTO users (email, token, created_at) VALUES (?, ?, ?)")
    .run(email, token, Date.now());
  return c.json({ token, email, id: Number(info.lastInsertRowid) });
});

app.post(`${API}/policy`, async (c) => {
  const uid = authUserId(c);
  if (!uid) return c.json({ error: "unauthorized" }, 401);
  const { yaml } = await c.req.json<{ yaml?: string }>().catch(() => ({}) as { yaml?: string });
  if (typeof yaml !== "string") return c.json({ error: "yaml required" }, 400);
  db.prepare(
    `INSERT INTO policies (user_id, yaml, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET yaml = excluded.yaml, updated_at = excluded.updated_at`,
  ).run(uid, yaml, Date.now());
  return c.json({ ok: true });
});

app.get(`${API}/policy`, (c) => {
  const uid = authUserId(c);
  if (!uid) return c.json({ error: "unauthorized" }, 401);
  const row = db.prepare("SELECT yaml FROM policies WHERE user_id = ?").get(uid) as
    | { yaml: string }
    | undefined;
  return c.json({ yaml: row?.yaml ?? "" });
});

app.post(`${API}/report`, async (c) => {
  const uid = authUserId(c);
  if (!uid) return c.json({ error: "unauthorized" }, 401);
  const body = await c.req.json<{ repo?: string; agent?: string; results?: any[] }>().catch(
    () => ({}) as { repo?: string; agent?: string; results?: any[] },
  );
  const results = Array.isArray(body.results) ? body.results : [];
  const repo = String(body.repo ?? "");
  const agent = String(body.agent ?? "ci");
  const stmt = db.prepare(
    "INSERT INTO violations (user_id, repo, rule_id, enforce, message, agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  db.exec("BEGIN");
  try {
    for (const r of results) {
      stmt.run(uid, repo, r.ruleId ?? "", r.enforce ?? "", r.message ?? "", agent, Date.now());
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return c.json({ ok: true, count: results.length });
});

app.get(`${API}/violations`, (c) => {
  const uid = authUserId(c);
  if (!uid) return c.json({ error: "unauthorized" }, 401);
  const rows = db
    .prepare(
      "SELECT repo, rule_id, enforce, message, agent, created_at FROM violations WHERE user_id = ? ORDER BY id DESC LIMIT 200",
    )
    .all(uid);
  return c.json({ violations: rows });
});

// ---- Dashboard (server-rendered) ----
function dashboardHtml(violations: any[], token: string): string {
  const rows = violations.length
    ? violations
        .map(
          (v) => `<tr>
            <td>${new Date(v.created_at).toLocaleString()}</td>
            <td>${escapeHtml(String(v.repo))}</td>
            <td><code>${escapeHtml(String(v.rule_id))}</code></td>
            <td>${escapeHtml(String(v.enforce))}</td>
            <td>${escapeHtml(String(v.message))}</td>
            <td>${escapeHtml(String(v.agent))}</td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="6">No violations yet. Run <code>policyctl check</code> in CI with <code>policyctl report</code>.</td></tr>`;
  return `<!doctype html><html><head><meta charset="utf-8">
    <title>policyctl — violations</title>
    <style>body{font:14px/1.5 system-ui,sans-serif;margin:2rem;color:#1a1a1a}
    h1{font-size:18px}code{background:#f3f3f3;padding:1px 5px;border-radius:4px}
    table{border-collapse:collapse;width:100%;margin-top:1rem}
    th,td{border-bottom:1px solid #eee;text-align:left;padding:8px 10px;vertical-align:top}
    .hint{color:#666;margin-top:2rem}</style></head><body>
    <h1>policyctl — violation feed</h1>
    <table><thead><tr><th>When</th><th>Repo</th><th>Rule</th><th>Enforce</th><th>Message</th><th>Agent</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <p class="hint">Pull this policy into any repo: <code>policyctl pull --token ${escapeHtml(token)}</code></p>
    </body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string,
  );
}

app.get("/", (c) => {
  const token = c.req.query("token") ?? "";
  if (!token) {
    return c.html(`<!doctype html><html><head><meta charset="utf-8"><title>policyctl</title>
      <style>body{font:14px system-ui;margin:3rem;max-width:30rem}</style></head><body>
      <h1>policyctl</h1>
      <p>Sign in to view your violation feed.</p>
      <form id="f"><input name="email" placeholder="you@company.com" required>
      <button type="submit">Login</button></form>
      <script>document.getElementById('f').onsubmit=async e=>{e.preventDefault();
        const email=document.querySelector('[name=email]').value;
        const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email})});
        const j=await r.json(); location.href='/?token='+j.token;};</script>
      </body></html>`);
  }
  const uid = authUserId(c);
  if (!uid) return c.html("<p>Invalid token.</p>");
  const rows = db
    .prepare(
      "SELECT repo, rule_id, enforce, message, agent, created_at FROM violations WHERE user_id = ? ORDER BY id DESC LIMIT 200",
    )
    .all(uid);
  return c.html(dashboardHtml(rows, token));
});

const port = Number(process.env.PORT ?? 8787);

createServer(async (req, res) => {
  const url = `http://${req.headers.host ?? "localhost"}${req.url ?? "/"}`;
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const request = new Request(url, {
    method: req.method,
    headers: req.headers as unknown as HeadersInit,
    body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
  });
  try {
    const response = await app.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));
    if (response.body) {
      Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res);
    } else {
      res.end();
    }
  } catch (e) {
    res.statusCode = 500;
    res.end(`policyctl server error: ${e instanceof Error ? e.message : String(e)}`);
  }
}).listen(port, () => {
  console.log(`policyctl server listening on http://localhost:${port}`);
});
