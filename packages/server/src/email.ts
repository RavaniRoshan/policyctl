import type { Env } from "./types.js";

export interface DailyReportEmail {
  to: string;
  orgName: string;
  total: number;
  aiInsights: number;
  date: string;
}

/** Best-effort daily report email via Resend. Never throws. */
export async function sendDailyReportEmail(env: Env, report: DailyReportEmail): Promise<boolean> {
  if (!env.RESEND_API_KEY || !env.REPORT_FROM_EMAIL) return false;
  const subject = `policyctl compliance · ${report.date} · ${report.total} violations`;
  const text = [
    `Org: ${report.orgName}`,
    `Period: last 24h (${report.date})`,
    `Violations: ${report.total}`,
    `AI insights: ${report.aiInsights}`,
    ``,
    `View details: dashboard → Reports`,
  ].join("\n");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.REPORT_FROM_EMAIL,
        to: report.to,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error(`Report email failed for ${report.to}: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`Report email failed for ${report.to}: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

/** Oldest owner email for an org, or null. */
export async function getOrgOwnerEmail(db: D1Database, orgId: number): Promise<string | null> {
  const row = (await db
    .prepare(
      `SELECT u.email AS email FROM org_members om
       JOIN users u ON u.id = om.user_id
       WHERE om.org_id = ? AND om.role = 'owner'
       ORDER BY om.created_at ASC LIMIT 1`,
    )
    .bind(orgId)
    .first<{ email: string }>()) as { email: string } | null;
  return row?.email ?? null;
}
