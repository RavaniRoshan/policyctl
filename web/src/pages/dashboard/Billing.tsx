import { useState } from "react";
import {
  Lock,
  Calendar,
  Check,
  Gift,
  TrendUp,
} from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Callout } from "@/components/ui/callout";
import { CurvyRect, useToast } from "@policyctl/design-system";
import { MonoAnnotation } from "@/components/shared/EmptyState";
import { useBilling } from "@/lib/hooks";
import { api } from "@/lib/api";

export function Billing() {
  const { data: billing, isLoading, error, refetch } = useBilling();
  const { push } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleCheckout = async (interval: "monthly" | "annual") => {
    setIsRedirecting(true);
    try {
      const result = await api.billingCheckout("growth", interval);
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (e: any) {
      push({ title: "Checkout failed", description: e?.message ?? "Failed to start checkout." });
      setIsRedirecting(false);
    }
  };

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
    <div className="space-y-24 max-w-4xl">
      <div className="flex items-center justify-between -mt-1 border-b border-border-faint pb-12">
        <MonoAnnotation>[ billing ]</MonoAnnotation>
      </div>

      {error && (
        <Callout type="danger" title="Failed to load billing">
          {error.message}
        </Callout>
      )}

      <div className="space-y-16">
        <Card className="p-24 lg:p-32">
          <CurvyRect sides="allSides" />
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-8">
              <Lock className="size-5 text-heat-100" />
              <h3 className="text-label-x-large text-accent-black">Current plan</h3>
            </div>
            {isTrial ? (
              <Badge tone="accent">
                <Gift className="size-3 mr-4" />
                Trial
              </Badge>
            ) : isPaid ? (
              <Badge tone="heat">Control Plane</Badge>
            ) : (
              <Badge tone="muted">Free</Badge>
            )}
          </div>

          <div className="mt-16 grid sm:grid-cols-2 gap-24 -mt-1">
            <div>
              <div className="text-mono-x-small text-black-alpha-32 uppercase">
                {isPaid || isTrial ? "Control plane" : "Free CLI"}
              </div>
              <div className="mt-8 text-title-h3 text-accent-black">
                {isPaid || isTrial ? "$5 / seat / month" : "$0 / forever"}
              </div>
              {isTrial && daysRemaining !== null && (
                <div className="mt-8 flex items-center gap-8 text-body-medium">
                  <Calendar className="size-4 text-heat-100" />
                  <span className="text-accent-black font-medium">{daysRemaining} days</span>
                  <span className="text-black-alpha-56">remaining in your free trial</span>
                </div>
              )}
              {isPaid && billing?.subscription?.current_period_end && (
                <div className="mt-8 flex items-center gap-8 text-body-medium">
                  <Calendar className="size-4 text-heat-100" />
                  <span className="text-black-alpha-56">
                    Next billing: {formatDate(billing.subscription.current_period_end)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start sm:justify-end">
              {isPaid || isTrial ? (
                <Button onClick={handlePortal} disabled={isRedirecting} trailingIcon>
                  {isRedirecting ? "Redirecting…" : "Manage billing"}
                </Button>
              ) : (
                <Button
                  onClick={() => handleCheckout("monthly")}
                  disabled={isRedirecting}
                  trailingIcon
                >
                  {isRedirecting ? "Redirecting…" : "Start free trial"}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Plan details table */}
        {(isPaid || isTrial) && (
          <Card className="p-24 lg:p-32">
            <CurvyRect sides="allSides" />
            <h3 className="text-label-x-large text-accent-black mb-16">Subscription details</h3>
            <div className="grid gap-1 sm:grid-cols-2 -mt-1">
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
                <PlanRow
                  label="Cancellation"
                  value="Ends at period end"
                  tone="warning"
                />
              )}
            </div>
          </Card>
        )}

        {/* Free tier upsell */}
        {!isPaid && !isTrial && (
          <Card className="p-24 lg:p-32">
            <CurvyRect sides="allSides" />
            <div className="flex items-center gap-8 mb-16">
              <TrendUp className="size-5 text-heat-100" />
              <h3 className="text-label-x-large text-accent-black">Unlock the control plane</h3>
            </div>

            <p className="text-body-medium text-black-alpha-64 leading-26 mb-24">
              Your free CLI works locally and never expires. The cloud control plane
              adds shared policy versioning, an audit feed, daily compliance reports,
              CSV exports, and AI rule authoring — all with a 14-day free trial.
            </p>

            {/* Pricing summary */}
            <div className="flex items-center gap-16 -mt-1 mb-24">
              <div className="text-center">
                <div className="text-title-h4 text-accent-black">$5</div>
                <div className="text-mono-x-small text-black-alpha-32">per seat / month</div>
              </div>
              <div className="text-center">
                <div className="text-title-h4 text-accent-black">$50</div>
                <div className="text-mono-x-small text-black-alpha-32">per seat / year (save 2 months)</div>
              </div>
            </div>

            {/* Plan features */}
            <ul className="space-y-12 text-body-large text-black-alpha-72 mb-24">
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                Cross-repo policy versioning
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                Live enforcement sessions + audit trail
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                AI rule author + diff analyzer
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                Daily compliance report + CSV export
              </li>
              <li className="flex gap-8">
                <Check className="size-4 text-heat-100 shrink-0 mt-2" />
                14-day free trial, cancel anytime
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-12">
              <Button
                className="flex-1"
                onClick={() => handleCheckout("annual")}
                disabled={isRedirecting}
                trailingIcon={!isRedirecting}
              >
                {isRedirecting ? "Redirecting…" : "Start 14-day free trial (annual)"}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => handleCheckout("monthly")}
                disabled={isRedirecting}
              >
                {isRedirecting ? "Redirecting…" : "Monthly billing"}
              </Button>
            </div>
          </Card>
        )}

        {/* Trial ending soon warning */}
        {isTrial && daysRemaining !== null && daysRemaining <= 3 && (
          <Callout type="warning" title="Your trial ends soon">
            Your free trial ends in {daysRemaining} day{daysRemaining === 1 ? "" : "s"}.
            Add a payment method to continue using the control plane.
            <button
              onClick={handlePortal}
              className="ml-8 text-heat-100 font-medium underline"
            >
              Update payment method
            </button>
          </Callout>
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
    <div className="flex justify-between items-center px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
      <span className="text-body-medium text-black-alpha-56">{label}</span>
      <span className={`text-body-medium font-mono text-mono-small ${dotClass}`}>
        {value}
      </span>
    </div>
  );
}
