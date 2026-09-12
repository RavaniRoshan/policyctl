import type { Env } from "./types.js";

export interface ReportWebhookPayload {
  orgId: number;
  orgName: string;
  date: string;
  total: number;
  aiInsights: number;
  byActor: { actor: string; count: number }[];
  repeatOffenders: { rule_id: string; repo: string; count: number }[];
  period?: string;
}

/**
 * POST a daily compliance report summary to an org's incoming webhook URL.
 * Works with Slack, Discord, and any endpoint accepting JSON POST.
 * Best-effort: never throws, returns true on success.
 */
export async function sendReportWebhook(
  webhookUrl: string,
  report: ReportWebhookPayload,
): Promise<boolean> {
  const body = {
    text: `*policyctl compliance report* — ${report.date}\n` +
      `${report.total} violation${report.total === 1 ? "" : "s"} in the last 24h` +
      (report.aiInsights > 0 ? ` · ${report.aiInsights} AI insight${report.aiInsights === 1 ? "" : "s"}` : ""),
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `policyctl compliance · ${report.date}`, emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Violations*\n${report.total}` },
          { type: "mrkdwn", text: `*AI Insights*\n${report.aiInsights}` },
        ],
      },
      ...(report.byActor.length > 0
        ? [{
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*By agent*\n${report.byActor.map((a) => `${a.actor}: ${a.count}`).join(" · ")}`,
            },
          }]
        : []),
      ...(report.repeatOffenders.length > 0
        ? [{
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Repeat offenders*\n${report.repeatOffenders
                .map((o) => `\`${o.rule_id}\` in \`${o.repo}\` (${o.count}×)`)
                .join("\n")}`,
            },
          }]
        : []),
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `org: ${report.orgName} · view details in the dashboard` },
        ],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[webhook] report delivery failed for ${webhookUrl}: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[webhook] report delivery failed for ${webhookUrl}: ${err instanceof Error ? err.message : err}`);
    return false;
  }
}
