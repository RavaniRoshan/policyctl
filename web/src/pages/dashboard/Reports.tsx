import { ChartBar, Calendar, Download, Envelope } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurvyRect } from "@policyctl/design-system";
import { MonoAnnotation } from "@/components/shared/EmptyState";

export function Reports() {
  return (
    <div className="space-y-24">
      <MonoAnnotation>[ reports ]</MonoAnnotation>

      <Card className="p-32 lg:p-64">
        <CurvyRect sides="allSides" />
        <div className="flex items-start gap-12">
          <Calendar className="size-5 text-heat-100 mt-2 shrink-0" />
          <div>
            <h3 className="text-label-x-large text-accent-black">Delivery schedule</h3>
            <p className="mt-8 text-body-medium text-black-alpha-72 leading-22">
              Daily compliance report delivered to your inbox at{" "}
              <span className="font-mono text-mono-small text-accent-black">09:00 UTC</span>.
              Recipients, format, and schedule are configured in the cloud.
            </p>
            <div className="mt-16 flex items-center gap-8">
              <Badge tone="heat">enabled</Badge>
              <span className="font-mono text-mono-small text-black-alpha-48">
                cron: <span className="text-accent-black">0 9 * * *</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-32 lg:p-64">
        <CurvyRect sides="allSides" />
        <div className="flex items-start gap-12">
          <ChartBar className="size-5 text-heat-100 mt-2 shrink-0" />
          <div className="flex-1">
            <h3 className="text-label-x-large text-accent-black">Latest report</h3>
            <p className="mt-8 text-body-medium text-black-alpha-72 leading-22">
              <span className="contents text-label-large text-accent-black">
                No report yet.
              </span>{" "}
              The first run fires after you link a repo and a token is configured.
            </p>
            <pre className="mt-16 font-mono text-mono-medium leading-22 p-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
              <span className="text-black-alpha-32">subject: </span>policyctl compliance ·{" "}
              <span className="text-heat-100">2026-08-30</span> · 3 repos · 2 violations
            </pre>
            <div className="mt-16 flex items-center gap-8">
              <Button variant="secondary" disabled>
                <Download className="size-3 mr-4" /> Download CSV
              </Button>
              <Button variant="tertiary">
                <Envelope className="size-3 mr-4" /> Resend to me
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}