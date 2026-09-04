import { useState } from "react";
import { Lock, Calendar, Check, Gift, TrendUp } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { CurvyRect, useToast } from "@policyctl/design-system";
import { MonoAnnotation } from "@/components/shared/EmptyState";
import { WaitlistForm } from "@/components/ui/waitlist-form";
import { useBilling, useWaitlist } from "@/lib/hooks";
import { api } from "@/lib/api";

export function Billing() {
  const { data: billing, isLoading, error, refetch } = useBilling();
  const { data: waitlist } = useWaitlist();
  const { push } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePortal = async () => {
    setIsRedirecting(true);
    try {
      const result = await api.billingPortal();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (e: any) {
      push({ title: "Failed to open billing portal", description: e?.message ?? "Please try again." });
      setIsRedirecting(false);
    }
  };

  const formatDate = (ts: number | null | undefined) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isPaid = billing?.is_paid ?? false;
  const isTrial = billing?.is_trial ?? false;
  const daysRemaining = billing?.days_remaining_in_trial ?? 0;

  return (
    <div className="space-y-24">
      <div className="-mt-1 flex items-center justify-between border-b border-border-faint pb-12">
        <MonoAnnotation>[ billing ]</MonoAnnotation>
        <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {error && (
        <Callout type="danger" title="Failed to load billing status" className="p-16">
          {(error as Error)?.message || "An unexpected error occurred."}
        </Callout>
      )}

      <div className="space-y-16">
        <Card className="p-24 lg:p-32">
          <CurvyRect sides="allSides" />
          <div className="mb-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Lock className="size-5 text-heat-100" aria-hidden />
              <h2 className="text-label-x-large">Current plan</h2>
            </div>
            {isTrial ? (
              <Badge tone="accent">
                <Gift className="size-3 mr-4" aria-hidden />
                Trial
              </Badge>
            ) : isPaid ? (
              <Badge tone="heat">Control Plane</Badge>
            ) : (
              <Badge tone="muted">Free</Badge>
            )}
          </div>

          <div className="grid sm:grid-cols-2">
            <div>
              <div className="font-mono text-mono-x-small uppercase text-black-alpha-32">
                {isPaid || isTrial ? "Control plane" : "Free CLI"}
              </div>
              <div className="mt-8 text-[28px] font-medium leading-tight sm:text-title-h3">
                {isPaid || isTrial ? "$5 / seat / month" : "$0 / forever"}
              </div>
              {isTrial && daysRemaining !== null && (
                <div className="mt-8 flex items-center gap-8 text-body-medium">
                  <Calendar className="size-4 shrink-0 text-heat-100" aria-hidden />
                  <span className="text-black-alpha-56">
                    <span className="font-medium text-accent-black">{daysRemaining} days</span>{" "}
                    remaining in your free trial
                  </span>
                </div>
              )}
              {isPaid && billing?.subscription?.current_period_end && (
                <div className="mt-8 flex items-center gap-8 text-body-medium">
                  <Calendar className="size-4 shrink-0 text-heat-100" aria-hidden />
                  <span className="text-black-alpha-56">
                    Next billing: {formatDate(billing.subscription.current_period_end)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start sm:justify-end">
              {isPaid || isTrial ? (
                <Button onClick={handlePortal} disabled={isRedirecting} trailingIcon className="whitespace-nowrap">
                  {isRedirecting ? "Redirecting…" : "Manage billing"}
                </Button>
              ) : (
                <div className="w-full sm:max-w-sm">
                  <WaitlistForm source="billing" compact />
                </div>
              )}
            </div>
          </div>
        </Card>

        {(isPaid || isTrial) && (
          <Card className="p-24 lg:p-32">
            <CurvyRect sides="allSides" />
            <h2 className="text-label-x-large mb-16">Subscription details</h2>
            <div className="grid gap-1 sm:grid-cols-2">
              <PlanRow label="Plan" value={billing?.plan === "growth" ? "Growth" : "Free"} />
              <PlanRow label="Status" value={billing?.subscription?.status ?? "unknown"} />
              <PlanRow
                label="Seats"
                value={`${billing?.seat_count ?? 0} billable member${(billing?.seat_count ?? 0) === 1 ? "" : "s"}`}
              />
              <PlanRow
                label="Next billing"
                value={formatDate(billing?.subscription?.current_period_end)}
              />
              {billing?.subscription?.cancel_at_period_end && (
                <PlanRow label="Cancellation" value="Ends at period end" tone="warning" />
              )}
            </div>
          </Card>
        )}

        {!isPaid && !isTrial && (
          <Card className="p-24 lg:p-32">
            <CurvyRect sides="allSides" />
            <div className="mb-16 flex items-center gap-8">
              <TrendUp className="size-5 text-heat-100" aria-hidden />
              <h2 className="text-label-x-large">Unlock the control plane</h2>
            </div>

            <p className="mb-24 text-body-medium leading-26 text-black-alpha-64">
              Your free CLI works locally and never expires. The cloud control plane
              adds shared policy versioning, an audit feed, daily compliance reports,
              CSV exports, and AI rule authoring — premium is coming soon.
            </p>

            <div className="mb-24 flex items-center gap-16">
              <div className="text-center">
                <div className="text-title-h4">$5</div>
                <div className="font-mono text-mono-x-small text-black-alpha-32">per seat / month</div>
              </div>
              <div className="text-center">
                <div className="text-title-h4">$50</div>
                <div className="font-mono text-mono-x-small text-black-alpha-32">per seat / year (save 2 months)</div>
              </div>
            </div>

            <ul className="mb-24 space-y-12 text-body-large text-black-alpha-72">
              <li className="flex gap-8">
                <Check className="size-4 shrink-0 text-heat-100" aria-hidden />
                Cross-repo policy versioning
              </li>
              <li className="flex gap-8">
                <Check className="size-4 shrink-0 text-heat-100" aria-hidden />
                Live enforcement sessions + audit trail
              </li>
              <li className="flex gap-8">
                <Check className="size-4 shrink-0 text-heat-100" aria-hidden />
                AI rule author + diff analyzer
              </li>
              <li className="flex gap-8">
                <Check className="size-4 shrink-0 text-heat-100" aria-hidden />
                Daily compliance report + CSV export
              </li>
              <li className="flex gap-8">
                <Check className="size-4 shrink-0 text-heat-100" aria-hidden />
                Premium coming soon — waitlist members get early access
              </li>
            </ul>

            <div className="mt-8">
              <WaitlistForm source="billing-upsell" />
            </div>
          </Card>
        )}

        {isTrial && daysRemaining !== null && daysRemaining <= 3 && (
          <Callout type="warning" title="Your trial ends soon">
            Your free trial ends in {daysRemaining} day{daysRemaining === 1 ? "" : "s"}.
            Add a payment method to continue using the control plane.
            <button
              onClick={handlePortal}
              className="ml-8 font-medium text-heat-100 underline"
            >
              Update payment method
            </button>
          </Callout>
        )}

        {waitlist && waitlist.total > 0 && (
          <Card className="p-24 lg:p-32">
            <CurvyRect sides="allSides" />
            <h2 className="text-label-x-large mb-16">
              Waitlist · {waitlist.total} {waitlist.total === 1 ? "signup" : "signups"}
            </h2>
            <ul className="space-y-8">
              {waitlist.signups.slice(0, 20).map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-12 rounded-md border border-border-faint px-12 py-8"
                >
                  <span className="truncate font-mono text-mono-small">{w.email}</span>
                  <span className="shrink-0 font-mono text-mono-x-small text-black-alpha-48">
                    {new Date(w.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

function PlanRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning" | "danger";
}) {
  const dotClass =
    tone === "warning"
      ? "text-warning"
      : tone === "danger"
        ? "text-danger"
        : "text-success";
  return (
    <div className="relative flex flex-col gap-4 border border-border-faint px-12 py-12 before:absolute before:inset-0 before:rounded-inherit sm:flex-row sm:items-center sm:justify-between">
      <span className="text-body-medium text-black-alpha-56">{label}</span>
      <span className={`font-mono text-body-medium text-mono-small sm:text-right ${dotClass}`}>
        {value}
      </span>
    </div>
  );
}
