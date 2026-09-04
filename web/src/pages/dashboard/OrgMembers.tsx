import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  CaretDown,
  Envelope,
  ShieldCheck,
  Users,
  Warning,
} from "@phosphor-icons/react";
import { useOrgMembers, useInviteMember, useUpdateMember, useRemoveMember } from "@/lib/hooks";
import { useCurrentOrgId } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CurvyRect, Modal, useToast } from "@policyctl/design-system";
import { Skeleton, EmptyState, MonoAnnotation } from "@/components/shared/EmptyState";
import { Callout } from "@/components/ui/callout";
import type { OrgMember } from "@/lib/api";
import type { Role } from "@policyctl/types";

const ROLES: Role[] = ["owner", "admin", "member", "viewer"];

export function OrgMembers() {
  const currentOrgId = useCurrentOrgId();
  const { data: members, isLoading, error, refetch } = useOrgMembers(currentOrgId);
  const queryClient = useQueryClient();
  const { push } = useToast();

  const inviteMut = useInviteMember();
  const updateMut = useUpdateMember();
  const removeMut = useRemoveMember();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [removeConfirm, setRemoveConfirm] = useState<OrgMember | null>(null);

  const seatCount = useMemo(
    () => members?.filter((m) => m.is_billable).length ?? 0,
    [members],
  );
  const totalMembers = members?.length ?? 0;
  const pendingCount = useMemo(
    () => members?.filter((m) => !m.accepted_at).length ?? 0,
    [members],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["orgMembers", currentOrgId] });
    refetch();
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentOrgId) return;
    try {
      await inviteMut.mutateAsync({ orgId: currentOrgId, email: inviteEmail.trim(), role: inviteRole });
      push({ title: "Invite sent", description: `Invited ${inviteEmail} as ${inviteRole}` });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      invalidate();
    } catch (e: any) {
      push({ title: "Invite failed", description: e?.message ?? "Try again." });
    }
  };

  const handleRoleChange = async (member: OrgMember, role: Role) => {
    if (!currentOrgId) return;
    try {
      await updateMut.mutateAsync({ orgId: currentOrgId, userId: member.id, role });
      push({ title: "Role updated", description: `${member.email} is now ${role}` });
      invalidate();
    } catch (e: any) {
      push({ title: "Role update failed", description: e?.message ?? "Try again." });
    }
  };

  const handleRemove = async () => {
    if (!removeConfirm || !currentOrgId) return;
    try {
      await removeMut.mutateAsync({ orgId: currentOrgId, userId: removeConfirm.id });
      push({ title: "Member removed", description: removeConfirm.email });
      setRemoveConfirm(null);
      invalidate();
    } catch (e: any) {
      push({ title: "Remove failed", description: e?.message ?? "Try again." });
    }
  };

  return (
    <div className="space-y-24">
      <div className="-mt-1 flex flex-wrap items-center justify-between gap-8 border-b border-border-faint pb-12">
        <MonoAnnotation>[ team / {totalMembers} members ]</MonoAnnotation>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <UserPlus className="size-3 mr-4" aria-hidden /> Invite member
        </Button>
      </div>

      {error && (
        <Callout type="danger" title="Failed to load team" className="p-16">
          {(error as Error)?.message || "An unexpected error occurred."}
          <button onClick={() => invalidate()} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            Retry
          </button>
        </Callout>
      )}

      <div className="grid gap-12 sm:grid-cols-3">
        <SeatStat label="Billable seats" value={seatCount} icon={<Users className="size-4 text-heat-100" aria-hidden />} />
        <SeatStat label="Total members" value={totalMembers} icon={<ShieldCheck className="size-4 text-heat-100" aria-hidden />} />
        <SeatStat label="Pending invites" value={pendingCount} icon={<Envelope className="size-4 text-heat-100" aria-hidden />} />
      </div>

      {isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : totalMembers === 0 && !error ? (
        <Card className="p-32 lg:p-64">
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Invite your first team member to get started."
            action={
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="size-3 mr-4" aria-hidden /> Invite member
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-body-medium">
            <thead>
              <tr className="border-b border-border-faint text-left font-mono text-mono-x-small uppercase text-black-alpha-48">
                <th scope="col" className="p-16">member</th>
                <th scope="col" className="p-16">role</th>
                <th scope="col" className="hidden p-16 sm:table-cell">status</th>
                <th scope="col" className="hidden p-16 md:table-cell">joined</th>
                <th scope="col" className="p-16 text-right">actions</th>
              </tr>
            </thead>
            <tbody>
              {(members ?? []).map((m) => (
                <tr key={m.id} className="border-b border-border-faint transition-colors last:border-0 hover:bg-black-alpha-4">
                  <td className="p-16">
                    <div className="flex items-center gap-12">
                      <span className="inline-flex size-32 shrink-0 items-center justify-center rounded-full bg-heat-12 text-label-medium uppercase text-heat-100" aria-hidden>
                        {(m.display_name ?? m.email).charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-body-medium">{m.display_name || "—"}</div>
                        <div className="truncate font-mono text-mono-x-small text-black-alpha-48">
                          {m.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-16">
                    <RoleSelect
                      value={m.role}
                      onChange={(role) => handleRoleChange(m, role)}
                      disabled={updateMut.isPending}
                    />
                  </td>
                  <td className="hidden p-16 sm:table-cell">
                    {m.accepted_at ? (
                      <Badge tone="success">active</Badge>
                    ) : (
                      <Badge tone="accent">pending</Badge>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap p-16 font-mono text-mono-x-small text-black-alpha-48 md:table-cell">
                    {m.invited_at
                      ? new Date(m.invited_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="p-16 text-right">
                    <button
                      onClick={() => setRemoveConfirm(m)}
                      className="text-body-small text-danger hover:opacity-80"
                      aria-label={`Remove ${m.email}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite member" maxWidth={420}>
        <label htmlFor="invite-email" className="block text-label-small">
          Email
        </label>
        <input
          id="invite-email"
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="teammate@company.com"
          autoComplete="email"
          className="mt-8 h-44 w-full rounded-md border border-border-faint bg-surface px-12 text-body-medium outline-none placeholder:text-black-alpha-32 focus:border-heat-100"
        />
        <label htmlFor="invite-role" className="mt-16 block text-label-small">
          Role
        </label>
        <div className="relative mt-8">
          <select
            id="invite-role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as Role)}
            className="h-44 w-full appearance-none rounded-md border border-border-faint bg-surface px-12 pr-32 text-body-medium outline-none focus:border-heat-100"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <CaretDown className="pointer-events-none absolute right-12 top-1/2 size-4 -translate-y-1/2 text-black-alpha-48" aria-hidden />
        </div>
        <p className="mt-12 flex items-start gap-6 text-body-small text-black-alpha-56">
          <Warning className="size-4 shrink-0 text-warning" aria-hidden />
          Owners, admins, and members occupy a paid seat. Viewers are always free.
        </p>
        <div className="mt-24 flex items-center justify-end gap-8">
          <Button variant="tertiary" onClick={() => setInviteOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviteMut.isPending}>
            {inviteMut.isPending ? "Inviting…" : "Send invite"}
          </Button>
        </div>
      </Modal>

      <Modal
        open={removeConfirm !== null}
        onClose={() => setRemoveConfirm(null)}
        title="Remove member"
        maxWidth={420}
      >
        <p className="text-body-medium leading-22 text-black-alpha-72">
          Remove <strong className="text-accent-black">{removeConfirm?.email}</strong> from this
          organization? They will lose access immediately.
        </p>
        <div className="mt-24 flex items-center justify-end gap-8">
          <Button variant="tertiary" onClick={() => setRemoveConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemove} disabled={removeMut.isPending}>
            {removeMut.isPending ? "Removing…" : "Remove"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function SeatStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="p-16 lg:p-24">
      <div className="flex items-center justify-between">
        <span className="font-mono text-mono-x-small uppercase text-black-alpha-32">{label}</span>
        {icon}
      </div>
      <div className="mt-12 text-title-h3 font-medium">{value}</div>
    </Card>
  );
}

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: Role;
  onChange: (r: Role) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Role)}
        disabled={disabled}
        aria-label="Member role"
        className="h-32 appearance-none rounded-md border border-border-faint bg-surface pl-8 pr-28 text-body-small outline-none focus:border-heat-100 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <CaretDown className="pointer-events-none absolute right-8 top-1/2 size-3 -translate-y-1/2 text-black-alpha-48" aria-hidden />
    </div>
  );
}
