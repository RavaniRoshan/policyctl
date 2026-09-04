import { ChartBar, Calendar, Download, Envelope, FileText, ArrowClockwise } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurvyRect, useToast } from "@policyctl/design-system";
import { Skeleton, EmptyState, MonoAnnotation } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";
import { useDailyReport, useResendReport } from "@/lib/hooks";
import { downloadViolationsCsv } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

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
      <div className="-mt-1 flex items-center justify-between border-b border-border-faint pb-12">
        <MonoAnnotation>[ reports / daily compliance ]</MonoAnnotation>
        <div className="flex items-center gap-8">
          <span className="font-mono text-mono-x-small uppercase text-black-alpha-32">
            {generated ? `last run: ${generated}` : "last run: pending"}
          </span>
          <Button variant="secondary" size="sm" onClick={retry} disabled={isLoading}>
            <ArrowClockwise className={`size-3 mr-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Callout type="danger" title="Failed to load report" className="p-16">
          {(error as Error)?.message || "An unexpected error occurred."}
          <button onClick={retry} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            <ArrowClockwise className="size-3 mr-4" aria-hidden /> Retry
          </button>
        </Callout>
      )}

      <div className="grid gap-16 lg:grid-cols-2">
        <Card className="p-24 lg:p-32">
          <CurvyRect sides="allSides" />
          <div className="flex items-start gap-12">
            <span className="relative -mt-1 inline-flex size-40 shrink-0 items-center justify-center rounded-lg bg-heat-4 text-heat-100 before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-12">
              <Calendar className="size-4" weight="bold" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-label-large">Delivery schedule</h2>
              <p className="mt-6 text-body-small leading-22 text-black-alpha-64">
                Daily compliance report generated at{" "}
                <span className="font-mono text-accent-black">09:00 UTC</span>.
              </p>
              <div className="mt-12 flex flex-wrap items-center gap-8">
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
            <span className="relative -mt-1 inline-flex size-40 shrink-0 items-center justify-center rounded-lg bg-heat-4 text-heat-100 before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-12">
              <ChartBar className="size-4" weight="bold" aria-hidden />
            </span>
            <div className="mb-16 min-w-0 flex-1">
              <h2 className="text-label-large">Latest report</h2>
              {isLoading ? (
                <div className="mt-16 space-y-8">
                  <Skeleton className="h-16 w-3/4" />
                  <Skeleton className="h-16 w-1/2" />
                </div>
              ) : !report ? (
                <p className="mt-16 text-body-small leading-22 text-black-alpha-64">
                  {message ?? "No report yet. First run fires after you link a repo."}
                </p>
              ) : (
                <div className="mt-16">
                  <p className="text-body-small text-black-alpha-56">
                    Period: <span className="font-mono text-accent-black">{report.period}</span>
                  </p>
                  <p className="mt-4 text-body-small text-black-alpha-56">
                    Total violations:{" "}
                    <span className="font-mono text-accent-black">{report.total}</span>
                  </p>
                  <p className="mt-4 text-body-small text-black-alpha-56">
                    AI insights:{" "}
                    <span className="font-mono text-accent-black">{report.aiInsights}</span>
                  </p>
                  {report.byActor.length > 0 && (
                    <div className="mt-12">
                      <span className="font-mono text-mono-x-small uppercase text-black-alpha-32">
                        By agent
                      </span>
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
                      <span className="font-mono text-mono-x-small uppercase text-black-alpha-32">
                        Repeat offenders
                      </span>
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
          <div className="relative mt-16 overflow-x-auto border border-border-faint p-12 font-mono text-mono-x-small leading-16 text-black-alpha-48 before:absolute before:inset-0 before:rounded-inherit">
            {generated ? (
              <>
                <span className="text-black-alpha-32">subject: </span>policyctl compliance ·{" "}
                <span className="text-heat-100">
                  {new Date(generated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </span>{" "}
                · <span className="text-heat-100">{report?.total ?? 0}</span> violations
              </>
            ) : (
              "Report will appear here after the next cron run at 9am UTC."
            )}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-8">
            <Button variant="secondary" size="sm" onClick={handleDownloadCsv} disabled={!report}>
              <Download className="size-3 mr-4" aria-hidden /> Download CSV
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              disabled={!report || resendMutation.isPending}
              onClick={handleResend}
              aria-label="Regenerate the latest report"
            >
              <Envelope className="size-3 mr-4" aria-hidden />{" "}
              {resendMutation.isPending ? "Refreshing…" : "Refresh report"}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <div className="flex items-start gap-12">
          <span className="relative -mt-1 inline-flex size-40 shrink-0 items-center justify-center rounded-lg bg-black-alpha-4 text-black-alpha-56 before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            <FileText className="size-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-label-large">What&apos;s in a report?</h2>
            <ul className="mt-12 space-y-6 text-body-small text-black-alpha-64">
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" aria-hidden />
                Total violations in the last 24 hours
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" aria-hidden />
                Breakdown by agent (human vs automation)
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" aria-hidden />
                Top repeat-offender rules
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" aria-hidden />
                AI insights count (CSV downloads separately below)
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
