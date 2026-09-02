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
import { CountUp, CurvyRect, useToast } from "@policyctl/design-system";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton, EmptyState, MonoAnnotation } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";

export function Overview() {
  const { data: analytics, isLoading: aLoading, error: aError } = useAnalytics();
  const { data: violations, isLoading: vLoading, error: vError } = useViolations();
  const queryClient = useQueryClient();
  const { push } = useToast();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
    queryClient.invalidateQueries({ queryKey: ["violations"] });
    push({ title: "Refreshing dashboard…" });
  };

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between -mt-1 border-b border-border-faint pb-12">
        <MonoAnnotation>[ overview · {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })} ]</MonoAnnotation>
        <Button variant="secondary" size="sm" onClick={refresh}>
          <ArrowClockwise className="size-3 mr-4" /> Refresh
        </Button>
      </div>

      <TrialBanner />

      {(aError || vError) && (
        <Callout type="danger" title="Failed to load dashboard" className="p-16">
          {aError?.message || vError?.message || "An unexpected error occurred."}
          <button onClick={refresh} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            <ArrowClockwise className="size-3 mr-4" /> Retry
          </button>
        </Callout>
      )}

      <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-4 -mt-1" aria-live="polite">
        <StatCard
          label="Compliance score"
          value={analytics?.compliance_score ?? 0}
          suffix="%"
          tone="success"
          icon={ShieldCheck}
          loading={aLoading}
        />
        <StatCard
          label="Active sessions"
          value={analytics?.active_sessions ?? 0}
          tone="default"
          icon={Pulse}
          loading={aLoading}
        />
        <StatCard
          label="Violations (24h)"
          value={analytics?.violations_24h ?? 0}
          tone={(analytics?.violations_24h ?? 0) > 0 ? "danger" : "success"}
          icon={Warning}
          loading={aLoading}
        />
        <StatCard
          label="AI insights"
          value={analytics?.ai_insights ?? 0}
          tone="heat"
          icon={Sparkle}
          loading={aLoading}
        />
      </div>

      <div className="grid gap-16 lg:grid-cols-3 -mt-1">
        <Card className="lg:col-span-2 p-32">
          <CurvyRect sides="allSides" />
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-label-x-large text-accent-black">Recent violations</h3>
            <Link
              to="/dashboard/sessions"
              className="text-label-small text-heat-100 hover:opacity-80 transition-opacity flex items-center gap-4"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          {vLoading ? (
            <div className="space-y-8 -mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (violations?.length ?? 0) === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No violations yet"
              description="Once an agent attempts a block enforcement, it will appear here."
            />
          ) : (
            <ul className="space-y-8 -mt-1">
              {(violations ?? []).slice(0, 5).map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint"
                >
                  <div className="flex items-center gap-12 min-w-0">
                    <Badge
                      tone={
                        v.enforce === "block"
                          ? "danger"
                          : v.enforce === "fail"
                            ? "accent"
                            : "muted"
                      }
                    >
                      {v.enforce}
                    </Badge>
                    <span className="font-mono text-mono-small text-accent-black">
                      {v.rule_id}
                    </span>
                    <span className="text-body-small text-black-alpha-64 truncate">
                      {v.repo}
                    </span>
                  </div>
                  <span className="font-mono text-mono-x-small text-black-alpha-48">
                    {new Date(v.created_at).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-32">
          <CurvyRect sides="allSides" />
          <div className="flex items-center gap-8 mb-16">
            <Sparkle className="size-4 text-heat-100" />
            <h3 className="text-label-x-large text-accent-black">AI insight</h3>
          </div>
          {vLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (violations?.length ?? 0) === 0 ? (
            <EmptyState
              icon={Sparkle}
              title="No insights yet"
              description="Analyze a diff in the AI panel to generate policy suggestions."
            />
          ) : (() => {
            // Derive the top repeated rule pattern from violation data.
            const ruleCounts = new Map<string, number>();
            for (const v of violations ?? []) {
              const r = v.rule_id || "(unknown)";
              ruleCounts.set(r, (ruleCounts.get(r) ?? 0) + 1);
            }
            const topRule = [...ruleCounts.entries()].sort((a, b) => b[1] - a[1])[0];
            return (
              <>
                <p className="text-body-medium text-black-alpha-64 leading-22">
                  Today's analysis flagged a pattern worth a rule.
                </p>
                <blockquote className="mt-16 p-16 text-body-medium text-accent-black leading-22 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-heat-30 bg-heat-4">
                  The rule{" "}
                  <code className="font-mono text-mono-small bg-heat-12 text-heat-100 px-4 py-2 rounded-4">
                    {topRule[0]}
                  </code>
                  {" "}was triggered {topRule[1]}× today — review it in the policy and consider
                  tightening its scope.
                </blockquote>
              </>
            );
          })()}
          <Link
            to="/dashboard/ai"
            className="mt-16 inline-flex text-label-large text-heat-100 hover:opacity-80 items-center gap-4"
          >
            Open AI <ArrowUpRight className="size-3" />
          </Link>
        </Card>
      </div>
    </div>
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
      <CurvyRect sides="allSides" />
      <div className="flex items-center gap-8 mb-16">
        <Gift className="size-5 text-heat-100" />
        <h3 className="text-label-x-large text-accent-black">
          {isTrial
            ? `Free trial — ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`
            : "Unlock the control plane"}
        </h3>
      </div>

      <p className="text-body-medium text-black-alpha-64 leading-26 mb-16">
        {isTrial
          ? "You're on a free trial. Add a payment method to continue after your trial ends."
          : "Start a 14-day free trial to unlock AI rule authoring, shared policy versioning, and the audit dashboard."}
      </p>

      <Link to="/dashboard/billing">
        <Button trailingIcon>
          {isTrial ? "Manage billing" : "Start free trial"}
        </Button>
      </Link>
    </Card>
  );
}

function StatCard({
  label,
  value,
  suffix,
  tone,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone: "default" | "success" | "danger" | "heat";
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "danger"
        ? "text-danger"
        : tone === "heat"
          ? "text-heat-100"
          : "text-accent-black";

  return (
    <Card className="p-16 lg:p-24">
      <CurvyRect sides="allSides" />
      <div className="flex items-center justify-between">
        <span className="text-mono-x-small text-black-alpha-32 uppercase">{label}</span>
        <Icon className={`size-4 ${color}`} />
      </div>
      <div className={`mt-12 text-title-h3 font-medium ${color}`}>
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