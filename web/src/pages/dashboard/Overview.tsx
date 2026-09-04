import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Pulse,
  Warning,
  Sparkle,
  CheckCircle,
  ArrowClockwise,
  ArrowUpRight,
  Gift,
} from "@phosphor-icons/react";
import { useAnalytics, useViolations, useBilling } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { CountUp, useToast } from "@policyctl/design-system";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton, EmptyState } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";

export function Overview() {
  const { data: analytics, isLoading, error, refetch } = useAnalytics();
  const {
    data: violations,
    isLoading: vLoading,
    error: vError,
  } = useViolations();
  const queryClient = useQueryClient();
  const { push } = useToast();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: ["violations"] });
    push({ title: "Refreshing dashboard…" });
  };

  return (
    <div className="space-y-24">
      <PageHead
        annotation={`overview · ${new Date().toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`}
        onRefresh={refresh}
      />
      <TrialBanner />
      {(error || vError) && (
        <Callout type="danger" title="Failed to load dashboard" className="p-16">
          {(error as Error)?.message || (vError as Error)?.message || "An unexpected error occurred."}
          <button onClick={refresh} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            <ArrowClockwise className="size-3 mr-4" aria-hidden /> Retry
          </button>
        </Callout>
      )}

      <section aria-label="Key metrics" className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Compliance score"
          value={analytics?.compliance_score ?? 0}
          suffix="%"
          tone={scoreTone(analytics?.compliance_score ?? 0)}
          icon={<ShieldCheck className="size-4" aria-hidden />}
          loading={isLoading}
          hint="100 − min(100, 24h violations × 2 + repeat-offender rules × 5). Dismissed violations excluded."
        />
        <Kpi
          label="Active sessions"
          value={analytics?.active_sessions ?? 0}
          tone="default"
          icon={<Pulse className="size-4" aria-hidden />}
          loading={isLoading}
          hint="Distinct agents seen in the last 24 hours."
        />
        <Kpi
          label="Violations (24h)"
          value={analytics?.violations_24h ?? 0}
          tone={(analytics?.violations_24h ?? 0) > 0 ? "danger" : "success"}
          icon={<Warning className="size-4" aria-hidden />}
          loading={isLoading}
          hint="Non-dismissed violations in the last 24 hours."
        />
        <Kpi
          label="AI insights"
          value={analytics?.ai_insights ?? 0}
          tone="heat"
          icon={<Sparkle className="size-4" aria-hidden />}
          loading={isLoading}
          hint="AI analyses and authored rules saved in the last 24 hours."
        />
      </section>

      <div className="grid gap-16 lg:grid-cols-3">
        <Card className="p-24 lg:col-span-2 lg:p-32">
          <div className="mb-16 flex items-center justify-between">
            <h2 className="text-label-x-large">Recent violations</h2>
            <Link
              to="/dashboard/violations"
              className="flex items-center gap-4 text-label-small text-heat-100 transition-opacity hover:opacity-80"
            >
              View all <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </div>
          {vLoading ? (
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (violations?.length ?? 0) === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No violations yet"
              description="Once an agent attempts a blocked operation, it will appear here."
            />
          ) : (
            <ul className="space-y-8">
              {(violations ?? []).slice(0, 5).map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between gap-12 rounded-md border border-border-faint px-12 py-8"
                >
                  <div className="flex min-w-0 items-center gap-12">
                    <Badge tone={v.enforce === "block" ? "danger" : v.enforce === "fail" ? "accent" : "muted"}>
                      {v.enforce}
                    </Badge>
                    <span className="truncate font-mono text-mono-small">{v.rule_id}</span>
                    <span className="hidden truncate text-body-small text-black-alpha-64 sm:inline">
                      {v.repo}
                    </span>
                  </div>
                  <time className="shrink-0 font-mono text-mono-x-small text-black-alpha-48">
                    {new Date(v.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-24 lg:p-32">
          <div className="mb-16 flex items-center gap-8">
            <Sparkle className="size-4 text-heat-100" aria-hidden />
            <h2 className="text-label-x-large">AI insight</h2>
          </div>
          {vLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (violations?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Sparkle}
              title="No insights yet"
              description="Analyze a diff in the AI panel to generate policy suggestions."
            />
          ) : (
            <TopRuleSpotlight ruleId={topRuleId(violations ?? [])[0]} count={topRuleId(violations ?? [])[1]} />
          )}
          <Link
            to="/dashboard/ai"
            className="mt-16 inline-flex items-center gap-4 text-label-large text-heat-100 hover:opacity-80"
          >
            Open AI <ArrowUpRight className="size-3" aria-hidden />
          </Link>
        </Card>
      </div>
    </div>
  );
}

function topRuleId(violations: { rule_id: string }[]): [string, number] {
  const counts = new Map<string, number>();
  for (const v of violations) {
    const r = v.rule_id || "(unknown)";
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["(unknown)", 0];
}

function TopRuleSpotlight({ ruleId, count }: { ruleId: string; count: number }) {
  return (
    <>
      <p className="text-body-medium leading-22 text-black-alpha-64">
        Most-triggered rule in recent violations.
      </p>
      <blockquote className="mt-16 rounded-md border border-heat-30 bg-heat-4 p-16 text-body-medium leading-22">
        The rule{" "}
        <code className="rounded bg-heat-12 px-4 py-2 font-mono text-mono-small text-heat-100">
          {ruleId}
        </code>{" "}
        appears {count}× in recent violations — review it in the policy and consider
        tightening its scope.
      </blockquote>
    </>
  );
}

/** A low compliance score must never render in a success tone. */
function scoreTone(score: number): "success" | "heat" | "danger" {
  if (score >= 80) return "success";
  if (score >= 50) return "heat";
  return "danger";
}

function PageHead({ annotation, onRefresh }: { annotation: string; onRefresh: () => void }) {
  return (
    <div className="-mt-1 flex items-center justify-between border-b border-border-faint pb-12">
      <span className="font-mono text-mono-x-small uppercase tracking-wider text-black-alpha-32">
        [ {annotation} ]
      </span>
      <Button variant="secondary" size="sm" onClick={onRefresh}>
        <ArrowClockwise className="size-3 mr-4" aria-hidden /> Refresh
      </Button>
    </div>
  );
}

const TONE_TEXT: Record<string, string> = {
  success: "text-success",
  danger: "text-danger",
  heat: "text-heat-100",
  default: "text-accent-black",
};

function Kpi({
  label,
  value,
  suffix,
  tone,
  icon,
  loading,
  hint,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone: "default" | "success" | "danger" | "heat";
  icon: React.ReactNode;
  loading?: boolean;
  hint?: string;
}) {
  return (
    <Card className="p-16 lg:p-24">
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-mono-x-small uppercase text-black-alpha-32"
          title={hint}
        >
          {label}
        </span>
        <span className={TONE_TEXT[tone]}>{icon}</span>
      </div>
      <div className={`mt-12 text-title-h3 font-medium ${TONE_TEXT[tone]}`}>
        {loading ? (
          <Skeleton className="h-32 w-80" />
        ) : (
          <>
            <CountUp value={value} />
            {suffix}
          </>
        )}
      </div>
    </Card>
  );
}

function TrialBanner() {
  const { data: billing } = useBilling();
  const isPaid = billing?.is_paid ?? false;
  const isTrial = billing?.is_trial ?? false;
  const daysRemaining = billing?.days_remaining_in_trial ?? 0;

  if (isPaid && !isTrial) return null;

  return (
    <Card className="p-24 lg:p-32">
      <div className="mb-16 flex items-center gap-8">
        <Gift className="size-5 text-heat-100" aria-hidden />
        <h2 className="text-label-x-large">
          {isTrial
            ? `Free trial — ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
            : "Unlock the control plane"}
        </h2>
      </div>
      <p className="mb-16 text-body-medium leading-26 text-black-alpha-64">
        {isTrial
          ? "You're on a free trial. Add a payment method to continue after your trial ends."
          : "Start a 14-day free trial to unlock AI rule authoring, shared policy versioning, and the audit dashboard."}
      </p>
      <Link to="/dashboard/billing">
        <Button trailingIcon>{isTrial ? "Manage billing" : "Start free trial"}</Button>
      </Link>
    </Card>
  );
}
