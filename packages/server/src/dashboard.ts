import { DS_CSS } from "./_ds.js";
import type { Org, PolicyVersion, Violation } from "./types.js";

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch] as string,
  );
}

const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />`;

function shell(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
${FONT_LINK}
<style>${DS_CSS}</style>
<style>
  .wrap{max-width:1100px;margin:0 auto;padding:2.5rem 1.5rem 4rem}
  .login{max-width:24rem;margin:18vh auto 0;padding:0 1.5rem}
  .login input{width:100%;padding:.7rem .9rem;border-radius:var(--r-md);background:var(--n-900);border:1px solid rgba(255,255,255,.1);color:var(--n-100);font-family:var(--font-sans);margin:.5rem 0}
  .stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin:1.5rem 0}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1rem 0}
  .bar-row{display:flex;align-items:center;gap:.75rem;margin:.4rem 0;font-family:var(--font-mono);font-size:.8rem}
  .bar-track{flex:1;background:var(--n-900);border-radius:var(--r-pill);height:10px;overflow:hidden}
  .bar-fill{height:100%;background:linear-gradient(90deg,var(--pc-500),var(--pc-300))}
  .trend{display:flex;align-items:flex-end;gap:4px;height:70px}
  .trend-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;justify-content:flex-end;height:100%}
  .trend-bar{width:100%;background:linear-gradient(180deg,var(--pc-400),var(--pc-600));border-radius:4px 4px 0 0;min-height:2px}
  .trend-lab{font-family:var(--font-mono);font-size:.6rem;color:var(--n-500)}
  table{width:100%;border-collapse:collapse;font-size:.82rem}
  th,td{text-align:left;padding:.55rem .7rem;border-bottom:1px solid rgba(255,255,255,.05);vertical-align:top}
  th{color:var(--n-400);font-weight:500;font-family:var(--font-mono);font-size:.7rem;text-transform:uppercase;letter-spacing:.04em}
  .section-title{font-family:var(--font-display);font-size:1.15rem;margin:2rem 0 .75rem;display:flex;align-items:center;gap:.6rem}
  .muted{color:var(--n-400)}
  @media(max-width:720px){.stat-grid{grid-template-columns:repeat(2,1fr)}.grid-2{grid-template-columns:1fr}}
</style></head><body class="pc-mesh pc-grain"><div class="wrap">${body}</div></body></html>`;
}

export function loginPage(): string {
  return shell(
    "policyctl — sign in",
    `<div class="login pc-card">
      <div style="display:flex;align-items:center;gap:.6rem;font-family:var(--font-display);font-size:1.4rem">
        <span style="color:var(--pc-400)">◆</span> policyctl
      </div>
      <p class="muted" style="margin:.5rem 0 1.2rem">Sign in to view your violation feed and policy versions.</p>
      <form id="f">
        <input name="email" placeholder="you@company.com" type="email" required />
        <button class="pc-btn pc-btn-primary" type="submit" style="width:100%;justify-content:center">Login</button>
      </form>
      <script>document.getElementById('f').onsubmit=async e=>{e.preventDefault();
        const email=document.querySelector('[name=email]').value;
        const r=await fetch('/api/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email})});
        const j=await r.json(); location.href='/dashboard?token='+j.token;};</script>
    </div>`,
  );
}

export function renderDashboard(data: {
  org: Org;
  orgs: Org[];
  versions: (PolicyVersion & { author_email: string | null })[];
  violations: Violation[];
  byRepo: { repo: string; count: number }[];
  byRule: { rule_id: string; count: number }[];
  trend: { day: string; count: number }[];
  token: string;
}): string {
  const { org, orgs, versions, violations, byRepo, byRule, trend, token } = data;
  const total = violations.length;
  const repos = new Set(violations.map((v) => v.repo ?? "(unknown)")).size;
  const rules = new Set(violations.map((v) => v.rule_id ?? "(unknown)")).size;
  const maxTrend = Math.max(1, ...trend.map((t) => t.count));
  const maxRepo = Math.max(1, ...byRepo.map((r) => r.count));
  const maxRule = Math.max(1, ...byRule.map((r) => r.count));

  const nav = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">
    <div style="display:flex;align-items:center;gap:.6rem;font-family:var(--font-display);font-size:1.3rem">
      <span style="color:var(--pc-400)">◆</span> policyctl
      <span class="pc-badge">${escapeHtml(org.name)}</span>
    </div>
    <div style="display:flex;gap:.5rem;align-items:center">
      <select id="org" class="pc-btn pc-btn-ghost" style="padding:.4rem .7rem">
        ${orgs.map((o) => `<option value="${o.id}" ${o.id === org.id ? "selected" : ""}>${escapeHtml(o.name)}</option>`).join("")}
      </select>
      <a class="pc-btn pc-btn-ghost" href="/?token=${encodeURIComponent(token)}">Sign out</a>
    </div>
  </div>
  <script>document.getElementById('org').onchange=e=>location.href='/dashboard?token=${encodeURIComponent(token)}&org='+e.target.value;</script>`;

  const stats = `<div class="stat-grid">
    <div class="pc-stat"><div class="pc-stat-value">${total}</div><div class="pc-stat-label">violations</div></div>
    <div class="pc-stat"><div class="pc-stat-value">${repos}</div><div class="pc-stat-label">repos</div></div>
    <div class="pc-stat"><div class="pc-stat-value">${rules}</div><div class="pc-stat-label">rules fired</div></div>
    <div class="pc-stat"><div class="pc-stat-value">${versions.length}</div><div class="pc-stat-label">policy versions</div></div>
  </div>`;

  const trendHtml = `<div class="pc-card"><div class="section-title">Violations · last ${trend.length} days</div>
    <div class="trend">${trend
      .map(
        (t) =>
          `<div class="trend-col"><div class="trend-bar" style="height:${(t.count / maxTrend) * 60}px" title="${t.count}"></div><div class="trend-lab">${t.day.slice(5)}</div></div>`,
      )
      .join("")}</div>
  </div>`;

  const bars = (items: { repo?: string; rule_id?: string; count: number }[], max: number, key: "repo" | "rule_id") =>
    items
      .map(
        (i) =>
          `<div class="bar-row"><span style="width:42%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(
            (i[key] ?? "(unknown)") as string,
          )}</span><div class="bar-track"><div class="bar-fill" style="width:${(i.count / max) * 100}%"></div></div><span style="width:2.5rem;text-align:right">${i.count}</span></div>`,
      )
      .join("") || `<p class="muted">No data yet.</p>`;

  const breakdown = `<div class="grid-2">
    <div class="pc-card"><div class="section-title">By repo</div>${bars(byRepo, maxRepo, "repo")}</div>
    <div class="pc-card"><div class="section-title">By rule</div>${bars(byRule, maxRule, "rule_id")}</div>
  </div>`;

  const versionsHtml = `<div class="pc-card"><div class="section-title">Policy versions</div>
    ${
      versions.length
        ? `<table><thead><tr><th>#</th><th>when</th><th>author</th><th>note</th><th></th></tr></thead><tbody>${versions
            .map(
              (v, idx) =>
                `<tr><td><code>v${v.version}</code></td><td class="muted">${new Date(v.created_at).toLocaleString()}</td><td>${escapeHtml(
                  v.author_email ?? "—",
                )}</td><td class="muted">${escapeHtml(v.note ?? "")}</td><td>${
                  idx === 0
                    ? '<span class="pc-badge">current</span>'
                    : `<button class="pc-btn pc-btn-ghost rollback" data-id="${v.id}" style="padding:.3rem .7rem">restore</button>`
                }</td></tr>`,
            )
            .join("")}</tbody></table>`
        : `<p class="muted">No policy pushed yet. Run <code>policyctl push</code> in a repo.</p>`
    }
  </div>
  <script>document.querySelectorAll('.rollback').forEach(b=>b.onclick=async()=>{const id=b.dataset.id;
    const r=await fetch('/api/policy/versions/'+id+'/rollback?token=${encodeURIComponent(token)}&org=${org.id}',{method:'POST'});
    if(r.ok)location.reload();else alert('rollback failed');});</script>`;

  const recent = `<div class="pc-card"><div class="section-title">Recent violations</div>
    ${
      violations.length
        ? `<table><thead><tr><th>when</th><th>repo</th><th>rule</th><th>enforce</th><th>message</th><th>agent</th></tr></thead><tbody>${violations
            .slice(0, 25)
            .map(
              (v) =>
                `<tr><td class="muted">${new Date(v.created_at).toLocaleString()}</td><td><code>${escapeHtml(
                  v.repo ?? "",
                )}</code></td><td><code>${escapeHtml(v.rule_id ?? "")}</code></td><td>${badge(
                  v.enforce,
                )}</td><td>${escapeHtml(v.message ?? "")}</td><td class="muted">${escapeHtml(v.agent ?? "")}</td></tr>`,
            )
            .join("")}</tbody></table>`
        : `<p class="muted">No violations. Run <code>policyctl check</code> in CI with <code>--report</code>.</p>`
    }
  </div>`;

  const pull = `<div class="pc-terminal"><div class="pc-terminal-bar"><span class="pc-terminal-dot" style="background:#ef4444"></span><span class="pc-terminal-dot" style="background:#f59e0b"></span><span class="pc-terminal-dot" style="background:#22c55e"></span><span class="muted" style="margin-left:.5rem;font-size:.75rem">pull into any repo</span></div>
    <div class="pc-terminal-body"><code>policyctl pull --token ${escapeHtml(token.slice(0, 8))}…</code></div></div>`;

  return shell(`${org.name} · policyctl`, nav + stats + trendHtml + breakdown + versionsHtml + recent + `<div style="margin-top:1.5rem">${pull}</div>`);
}

function badge(enforce?: string | null): string {
  if (!enforce) return `<span class="muted">—</span>`;
  const cls = enforce === "block" ? "pc-badge-danger" : enforce === "fail" ? "pc-badge-warn" : "pc-badge";
  return `<span class="${cls}">${escapeHtml(enforce)}</span>`;
}
