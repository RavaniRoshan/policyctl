import { ChartBar, Calendar, Download, Envelope, FileText } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CurvyRect } from "@policyctl/design-system";
import { MonoAnnotation } from "@/components/shared/EmptyState";

export function Reports() {
  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between -mt-1 border-b border-border-faint pb-12">
        <MonoAnnotation>[ reports / daily compliance ]</MonoAnnotation>
        <span className="text-mono-x-small text-black-alpha-32 uppercase">last run: pending</span>
      </div>

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
                Daily compliance report delivered to your inbox at{" "}
                <span className="font-mono text-mono-small text-accent-black">09:00 UTC</span>.
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
            <div className="flex-1 min-w-0">
              <h3 className="text-label-large text-accent-black">Latest report</h3>
              <p className="mt-6 text-body-small text-black-alpha-64 leading-22">
                <span className="contents text-label-medium text-accent-black">No report yet.</span>{" "}
                First run fires after you link a repo.
              </p>
            </div>
          </div>
          <div className="mt-16 p-12 -mt-1 text-mono-x-small text-black-alpha-48 leading-16 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint overflow-x-auto">
            <span className="text-black-alpha-32">subject: </span>policyctl compliance ·{" "}
            <span className="text-heat-100">2026-08-30</span> · 3 repos · 2 violations
          </div>
          <div className="mt-12 flex items-center gap-8 flex-wrap">
            <Button variant="secondary" disabled aria-label="Download CSV — available after first report run">
              <Download className="size-3 mr-4" /> Download CSV
            </Button>
            <Button variant="tertiary" aria-label="Resend latest report by email">
              <Envelope className="size-3 mr-4" /> Resend to me
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
                Compliance score and trend over the last 30 days
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" />
                Per-repo enforcement summary
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" />
                Top repeat-offender rules
              </li>
              <li className="flex items-center gap-8">
                <span className="size-1 rounded-full bg-heat-100" />
                Full violations CSV (attached)
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}