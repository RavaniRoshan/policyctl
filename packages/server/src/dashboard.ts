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

// Premium dashboard chrome — token-consistent, no generic AI purple.
const DASH_CSS = `
  :root { color-scheme: dark; }
  .dash { max-width: 1160px; margin: 0 auto; padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem) 5rem; }
  .nav { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom: clamp(2rem,5vw,3.5rem); flex-wrap:wrap; }
  .brand { display:flex; align-items:center; gap:.6rem; font-family:var(--font-display); font-size:1.35rem; font-weight:600; letter-spacing:-.02em; }
  .brand .mk { color:var(--pc-400); font-size:1.1rem; }
  .nav-right { display:flex; align-items:center; gap:.6rem; }
  .orgselect { font-family:var(--font-mono); font-size:.8rem; color:var(--n-200); background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:var(--r-md); padding:.45rem .7rem; }
  .eyebrow { font-family:var(--font-mono); font-size:.7rem; letter-spacing:.14em; text-transform:uppercase; color:var(--pc-400); }
  .h2 { font-family:var(--font-display); font-size:clamp(1.4rem,3vw,1.9rem); font-weight:600; letter-spacing:-.02em; line-height:1.1; margin:0; }
  .lede { color:var(--n-300); font-size:1rem; line-height:1.6; max-width:60ch; margin:.6rem 0 0; }

  /* asymmetric bento */
  .bento { display:grid; grid-template-columns: repeat(12, 1fr); gap:1rem; margin-top:1.5rem; }
  .col-8 { grid-column: span 8; } .col-6 { grid-column: span 6; } .col-4 { grid-column: span 4; } .col-12 { grid-column: span 12; }
  @media(max-width:900px){ .col-8,.col-6,.col-4,.col-12 { grid-column: span 12; } }

  .card { position:relative; border-radius:var(--r-lg); background:linear-gradient(180deg, rgba(255,255,255,.025), rgba(255,255,255,0) 45%), var(--n-900); border:1px solid rgba(255,255,255,.06); padding:1.4rem 1.5rem; overflow:hidden; }
  .card::before { content:""; position:absolute; inset:0; background:radial-gradient(600px 200px at var(--mx,50%) var(--my,0%), rgba(13,147,115,.07), transparent 45%); pointer-events:none; }
  .card-h { display:flex; align-items:baseline; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
  .card-h .sub { font-family:var(--font-mono); font-size:.72rem; color:var(--n-400); }

  /* KPI tiles */
  .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; }
  @media(max-width:720px){ .kpis { grid-template-columns:repeat(2,1fr);} }
  .kpi { position:relative; border-radius:var(--r-lg); background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0)), var(--n-900); border:1px solid rgba(255,255,255,.06); padding:1.3rem 1.4rem; overflow:hidden; }
  .kpi::after { content:""; position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(180deg,var(--pc-400),var(--pc-600)); opacity:.7; }
  .kpi .v { font-family:var(--font-display); font-weight:700; font-size:clamp(2rem,4vw,2.6rem); line-height:1; color:var(--n-50); font-variant-numeric:tabular-nums; }
  .kpi .l { margin-top:.5rem; font-size:.74rem; letter-spacing:.08em; text-transform:uppercase; color:var(--n-400); font-family:var(--font-mono); }

  /* chart */
  .chart { width:100%; height:120px; display:block; }
  .chart .line { fill:none; stroke:var(--pc-400); stroke-width:2; vector-effect:non-scaling-stroke; }
  .chart .dot { fill:var(--pc-300); }
  .chart .grid { stroke:rgba(255,255,255,.05); stroke-width:1; }

  /* distribution bars */
  .dist { display:flex; flex-direction:column; gap:.55rem; }
  .dist-row { display:grid; grid-template-columns: 42% 1fr auto; align-items:center; gap:.7rem; font-family:var(--font-mono); font-size:.8rem; }
  .dist-track { height:8px; background:rgba(255,255,255,.05); border-radius:99px; overflow:hidden; }
  .dist-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,var(--pc-500),var(--pc-300)); }
  .dist-n { color:var(--n-200); text-align:right; }

  table { width:100%; border-collapse:collapse; font-size:.82rem; }
  th { text-align:left; padding:.55rem .6rem; color:var(--n-400); font-weight:500; font-family:var(--font-mono); font-size:.68rem; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid rgba(255,255,255,.07); }
  td { padding:.6rem; border-bottom:1px solid rgba(255,255,255,.045); vertical-align:top; color:var(--n-200); }
  td code, .mono { font-family:var(--font-mono); }
  .muted { color:var(--n-400); }
  .empty { text-align:center; color:var(--n-400); padding:2.5rem 1rem; font-size:.9rem; }
  .empty .ghost { display:inline-block; margin-top:1rem; font-family:var(--font-mono); font-size:.78rem; color:var(--pc-300); border:1px solid rgba(13,147,115,.3); border-radius:var(--r-md); padding:.4rem .8rem; }

  .term { border-radius:var(--r-lg); background:var(--n-1000); border:1px solid rgba(255,255,255,.06); overflow:hidden; font-family:var(--font-mono); }
  .term-bar { display:flex; gap:6px; padding:.6rem .9rem; border-bottom:1px solid rgba(255,255,255,.05); background:var(--n-900); }
  .term-bar i { width:10px; height:10px; border-radius:50%; display:inline-block; }
  .term-body { padding:1rem 1.2rem; font-size:.85rem; color:var(--n-200); line-height:1.7; overflow-x:auto; }
  .term-body .c { color:var(--pc-300); }

  .btn { font-family:var(--font-sans); font-size:.8rem; font-weight:500; border-radius:var(--r-md); padding:.5rem .9rem; cursor:pointer; border:1px solid transparent; transition:all var(--dur) var(--ease); }
  .btn-ghost { background:rgba(255,255,255,.04); border-color:rgba(255,255,255,.1); color:var(--n-100); }
  .btn-ghost:hover { background:rgba(255,255,255,.08); border-color:rgba(13,147,115,.4); }

  .reveal { opacity:0; transform:translateY(14px); transition:opacity .7s cubic-bezier(.32,.72,0,1), transform .7s cubic-bezier(.32,.72,0,1); }
  .reveal.in { opacity:1; transform:none; }
  @media(prefers-reduced-motion:reduce){ .reveal { opacity:1; transform:none; transition:none; } }
`;

function shell(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
${FONT_LINK}
<style>${DS_CSS}</style>
<style>${DASH_CSS}</style>
</head><body class="pc-mesh pc-grain"><div class="dash">${body}</div>
<script>
document.querySelectorAll('.card').forEach(c=>c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');c.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');}));
const io=new IntersectionObserver((es)=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.08});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
</script></body></html>`;
}

/** Build an SVG area+line sparkline from counts. */
function sparkline(counts: number[], w = 100, h = 100): string {
  const max = Math.max(1, ...counts);
  const n = counts.length;
  const pts = counts.map((c, i) => {
    const x = n <= 1 ? w / 2 : (i / (n - 1)) * w;
    const y = h - (c / max) * (h - 6) - 3;
    return [x, y] as const;
  });
  const line = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const last = pts[pts.length - 1];
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="violation trend">
    <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(13,147,115,.35)"/><stop offset="100%" stop-color="rgba(13,147,115,0)"/>
    </linearGradient></defs>
    <polygon points="${area}" fill="url(#ag)"/>
    <polyline class="line" points="${line}"/>
    <circle class="dot" cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="2.4"/>
  </svg>`;
}

function distBars(items: { label: string; count: number }[], max: number): string {
  if (!items.length) return `<p class="muted">No data yet.</p>`;
  return `<div class="dist">${items
    .map(
      (i) =>
        `<div class="dist-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(
          i.label,
        )}</span><div class="dist-track"><div class="dist-fill" style="width:${Math.max(4, (i.count / max) * 100)}%"></div></div><span class="dist-n">${i.count}</span></div>`,
    )
    .join("")}</div>`;
}

export function loginPage(): string {
  return shell(
    "policyctl — sign in",
    `<div class="card reveal" style="max-width:26rem; margin:14vh auto 0">
      <div class="brand" style="font-size:1.5rem"><span class="mk">◆</span> policyctl</div>
      <p class="lede" style="margin-top:1rem">Sign in to view your violation feed, policy versions, and enforcement analytics.</p>
      <form id="f" style="margin-top:1.4rem">
        <input name="email" placeholder="you@company.com" type="email" required
          style="width:100%;padding:.75rem .9rem;border-radius:var(--r-md);background:var(--n-1000);border:1px solid rgba(255,255,255,.1);color:var(--n-100);font-family:var(--font-sans)" />
        <button class="btn" type="submit"
          style="width:100%;justify-content:center;margin-top:.7rem;background:linear-gradient(180deg,var(--pc-400),var(--pc-600));color:var(--n-950);font-weight:600">Continue</button>
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
  const maxR = Math.max(1, ...byRepo.map((r) => r.count));
  const maxL = Math.max(1, ...byRule.map((r) => r.count));
  const tk = encodeURIComponent(token);

  const nav = `<div class="nav">
    <div class="brand"><span class="mk">◆</span> policyctl
      <span class="pc-badge" style="margin-left:.4rem">${escapeHtml(org.name)}</span>
    </div>
    <div class="nav-right">
      <select id="org" class="orgselect" aria-label="Switch organization">${orgs
        .map((o) => `<option value="${o.id}" ${o.id === org.id ? "selected" : ""}>${escapeHtml(o.name)}</option>`)
        .join("")}</select>
      <a class="btn btn-ghost" href="/?token=${tk}">Sign out</a>
    </div>
  </div>
  <script>document.getElementById('org').onchange=e=>location.href='/dashboard?token=${tk}&org='+e.target.value;</script>

  <div class="reveal">
    <div class="eyebrow">Control plane</div>
    <h1 class="h2" style="margin-top:.4rem">${escapeHtml(org.name)}</h1>
    <p class="lede">One policy, enforced across every agent and repo — with a live audit trail of what your agents actually did.</p>
  </div>

  <div class="kpis reveal" style="margin-top:1.6rem">
    <div class="kpi"><div class="v">${total}</div><div class="l">violations</div></div>
    <div class="kpi"><div class="v">${repos}</div><div class="l">repos</div></div>
    <div class="kpi"><div class="v">${rules}</div><div class="l">rules fired</div></div>
    <div class="kpi"><div class="v">${versions.length}</div><div class="l">policy versions</div></div>
  </div>`;

  const chartCard = `<div class="card col-8 reveal">
    <div class="card-h"><div><div class="eyebrow">Trend</div><div class="h2" style="font-size:1.1rem;margin-top:.3rem">Violations · last ${trend.length} days</div></div>
      <div class="sub">${trend.reduce((a, b) => a + b.count, 0)} total</div></div>
    ${total ? sparkline(trend.map((t) => t.count)) : `<div class="empty">No violations yet.<div class="ghost">Run <code>policyctl check</code> in CI with <code>--report</code></div></div>`}
  </div>`;

  const repoCard = `<div class="card col-4 reveal">
    <div class="card-h"><div class="h2" style="font-size:1.05rem">By repo</div></div>
    ${distBars(byRepo.map((r) => ({ label: r.repo, count: r.count })), maxR)}
  </div>`;

  const ruleCard = `<div class="card col-6 reveal">
    <div class="card-h"><div class="h2" style="font-size:1.05rem">By rule</div></div>
    ${distBars(byRule.map((r) => ({ label: r.rule_id, count: r.count })), maxL)}
  </div>`;

  const versionsHtml = `<div class="card col-6 reveal">
    <div class="card-h"><div class="h2" style="font-size:1.05rem">Policy versions</div><div class="sub">${versions.length}</div></div>
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
                    : `<button class="btn btn-ghost rollback" data-id="${v.id}">restore</button>`
                }</td></tr>`,
            )
            .join("")}</tbody></table>`
        : `<div class="empty">No policy pushed yet.<div class="ghost">Run <code>policyctl push</code> in a repo</div></div>`
    }
  </div>
  <script>document.querySelectorAll('.rollback').forEach(b=>b.onclick=async()=>{const id=b.dataset.id;
    const r=await fetch('/api/policy/versions/'+id+'/rollback?token=${tk}&org=${org.id}',{method:'POST'});
    if(r.ok)location.reload();else alert('rollback failed');});</script>`;

  const recent = `<div class="card col-12 reveal">
    <div class="card-h"><div class="h2" style="font-size:1.05rem">Recent violations</div></div>
    ${
      violations.length
        ? `<table><thead><tr><th>when</th><th>repo</th><th>rule</th><th>enforce</th><th>message</th><th>agent</th></tr></thead><tbody>${violations
            .slice(0, 20)
            .map(
              (v) =>
                `<tr><td class="muted">${new Date(v.created_at).toLocaleString()}</td><td><code>${escapeHtml(
                  v.repo ?? "",
                )}</code></td><td><code>${escapeHtml(v.rule_id ?? "")}</code></td><td>${badge(
                  v.enforce,
                )}</td><td>${escapeHtml(v.message ?? "")}</td><td class="muted">${escapeHtml(v.agent ?? "")}</td></tr>`,
            )
            .join("")}</tbody></table>`
        : `<div class="empty">No violations on record.<div class="ghost">Enforcements land here automatically</div></div>`
    }
  </div>`;

  const pull = `<div class="term col-12 reveal">
    <div class="term-bar"><i style="background:#ef4444"></i><i style="background:#f59e0b"></i><i style="background:#22c55e"></i>
      <span class="muted" style="margin-left:.6rem;font-size:.72rem">pull into any repo</span></div>
    <div class="term-body"><code class="c">policyctl</code> pull --token ${escapeHtml(token.slice(0, 10))}…</div>
  </div>`;

  return shell(`${org.name} · policyctl`, nav + `<div class="bento">${chartCard}${repoCard}${ruleCard}${versionsHtml}${recent}${pull}</div>`);
}

function badge(enforce?: string | null): string {
  if (!enforce) return `<span class="muted">—</span>`;
  const cls = enforce === "block" ? "pc-badge-danger" : enforce === "fail" ? "pc-badge-warn" : "pc-badge";
  return `<span class="${cls}">${escapeHtml(enforce)}</span>`;
}
