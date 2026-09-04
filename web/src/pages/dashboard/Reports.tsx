import { ChartBar, Calendar, Download, Envelope, FileText, ArrowClockwise } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurvyRect } from "@policyctl/design-system";
import { Skeleton, EmptyState, MonoAnnotation } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";
import { useDailyReport, useResendReport } from "@/lib/hooks";
import { downloadViolationsCsv } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@policyctl/design-system";

export function Reports() {
  const { data, isLoading, error, refetch } = useDailyReport();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const resendMutation = useResendReport();

  const report = data?.report ?? null;
  const message = data?.message;

  const retry = () => {
    queryClient.invalidateQueries({ queryKey: ["dailyReport"] });
    refetch();
  };

  const handleResend = async () => {
    try {
      const result = await resendMutation.mutateAsync();
      push({ title: "Report refreshed", description: result.message ?? "Report regenerated." });
      queryClient.invalidateQueries({ queryKey: ["dailyReport"] });
      refetch();
    } catch (e: any) {
      push({ title: "Failed to refresh report", description: e?.message ?? "Try again." });
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const blob = await downloadViolationsCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `policyctl-violations.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      push({ title: "CSV download failed", description: e?.message ?? "Try again." });
    }
  };

  const generated = report?.generatedAt
    ? new Date(report.generatedAt).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between -mt-1 border-b border-border-faint pb-12">
        <MonoAnnotation>[ reports / daily compliance ]</MonoAnnotation>
        <div className="flex items-center gap-8">
          <span className="text-mono-x-small text-black-alpha-32 uppercase">
            {generated ? `last run: ${generated}` : "last run: pending"}
          </span>
          <Button variant="secondary" size="sm" onClick={retry} disabled={isLoading}>
            <ArrowClockwise className={`size-3 mr-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Callout type="danger" title="Failed to load report" className="p-16">
          {error.message || "An unexpected error occurred."}
          <button onClick={retry} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            <ArrowClockwise className="size-3 mr-4" /> Retry
          </button>
        </Callout>
      )}

      <div className="grid gap-16 lg:grid-cols-2 -mt-1">
        <Card className="p-24 lg:p-32">
          <CurvyRect sides="allSides" />
          <div className="flex items-start gap-12">
            <span className="size-40 rounded-lg bg-heat-4 inline-flex items-center justify-center text-heat-100 shrink-0 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-12">
              <Calendar className="size-4" weight="bold" />
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-label-large text-accent-black">Delivery schedule</h3>
              <p className="mt-6 text-body-small text-black-alpha-64 leading-22">
                Daily compliance report generated at <span className="font-mono text-accent-black">09:00 UTC</span>.
              </p>
              <div className="mt-12 flex items-center gap-8 flex-wrap">
                <Badge tone="heat">enabled</Badge>
                <span className="font-mono text-mono-x-small text-black-alpha-48">
                  cron: <span className="text-accent-black">0 9 * * *</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-24 lg:p-32">
          <CurvyRect sides="allSides" />
          <div className="flex items-start gap-12">
            <span className="size-40 rounded-lg bg-heat-4 inline-flex items-center justify-center text-heat-100 shrink-0 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-12">
              <ChartBar className="size-4" weight="bold" />
            </span>
            <div className="flex-1 min-w-0 mb-16">
              <h3 className="text-label-large text-accent-black">Latest report</h3>
              {isLoading ? (
                <div className="mt-16 space-y-8">
                  <Skeleton className="h-16 w-3/4" />
                  <Skeleton className="h-16 w-1/2" />
                </div>
              ) : !report ? (
                <p className="mt-16 text-body-small text-black-alpha-64 leading-22">
                  {message ?? "No report yet. First run fires after you link a repo."}
                </p>
              ) : (
                <div className="mt-16">
                  <p className="text-body-small text-black-alpha-56">
                    Period: <span className="text-accent-black font-mono">{report.period}</span>
                  </p>
                  <p className="mt-4 text-body-small text-black-alpha-56">
                    Total violations: <span className="text-accent-black font-mono">{report.total}</span>
                  </p>
                  <p className="mt-4 text-body-small text-black-alpha-56">
                    AI insights: <span className="text-accent-black font-mono">{report.aiInsights}</span>
                  </p>
                  {report.byActor.length > 0 && (
                    <div className="mt-12">
                      <span className="text-mono-x-small text-black-alpha-32 uppercase">By agent</span>
                      <ul className="mt-4 space-y-1">
                        {report.byActor.map((a) => (
                          <li key={a.actor} className="flex justify-between text-body-small">
                            <span className="text-black-alpha-64">{a.actor}</span>
                            <span className="font-mono text-accent-black">{a.count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {report.repeatOffenders.length > 0 && (
                    <div className="mt-12">
                      <span className="text-mono-x-small text-black-alpha-32 uppercase">Repeat offenders</span>
                      <ul className="mt-4 space-y-1">
                        {report.repeatOffenders.map((o) => (
                          <li key={`${o.rule_id}-${o.repo}`} className="text-body-small">
                            <span className="font-mono text-accent-black">{o.rule_id}</span>
                            <span className="text-black-alpha-56"> in </span>
                            <span className="font-mono text-accent-black">{o.repo}</span>
                            <span className="text-black-alpha-32"> ({o.count}×)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-16 p-12 -mt-1 text-mono-x-small text-black-alpha-48 leading-16 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint overflow-x-auto">
            {generated ? (
              <>
                <span className="text-black-alpha-32">subject: </span>policyctl compliance ·{" "}
                <span className="text-heat-100">{new Date(generated).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}</span> ·{" "}
                <span className="text-heat-100">{report?.total ?? 0}</span> violations
              </>
            ) : (
              "Report will appear here after the next cron run at 9am UTC."
            )}
          </div>
          <div className="mt-12 flex items-center gap-8 flex-wrap">
            <Button variant="secondary" size="sm" onClick={handleDownloadCsv} disabled={!report}>
              <Download className="size-3 mr-4" /> Download CSV
            </Button>
            <Button variant="tertiary" size="sm" disabled={!report || resendMutation.isPending} onClick={handleResend} aria-label="Regenerate the latest report">
              <Envelope className="size-3 mr-4" /> {resendMutation.isPending ? "Refreshing…" : "Refresh report"}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <div className="flex items-start gap-12">
          <span className="size-40 rounded-lg bg-black-alpha-4 inline-flex items-center justify-center text-black-alpha-56 shrink-0 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            <FileText className="size-4" />
          </span>
          <div>
            <h3 className="text-label-large text-accent-black">What's in a report?</h3>
            <ul className="mt-12 space-y-6 text-body-small text-black-alpha-64">
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" />
                Total violations in the last 24 hours
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" />
                Breakdown by agent (human vs automation)
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" />
                Top repeat-offender rules
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" />
                AI insights count (CSV downloads separately below)
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
