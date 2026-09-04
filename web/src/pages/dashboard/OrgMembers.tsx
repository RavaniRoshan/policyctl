import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UserPlus,
  Trash,
  CaretDown,
  X,
  Envelope,
  ShieldCheck,
  Users,
  Warning,
} from "@phosphor-icons/react";
import { useOrgMembers, useInviteMember, useUpdateMember, useRemoveMember } from "@/lib/hooks";
import { useCurrentOrgId } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
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

  const seatCount = useMemo(() => (members?.filter((m) => m.is_billable).length ?? 0), [members]);
  const totalMembers = members?.length ?? 0;

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !currentOrgId) return;
    try {
      await inviteMut.mutateAsync({ orgId: currentOrgId, email: inviteEmail.trim(), role: inviteRole });
      push({ title: "Invite sent", description: `Invited ${inviteEmail} as ${inviteRole}` });
      setInviteOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      queryClient.invalidateQueries({ queryKey: ["orgMembers", currentOrgId] });
    } catch (e: any) {
      push({ title: "Invite failed", description: e?.message ?? "Try again." });
    }
  };

  const handleRoleChange = async (member: OrgMember, role: Role) => {
    if (!currentOrgId) return;
    try {
      await updateMut.mutateAsync({ orgId: currentOrgId, userId: member.id, role });
      push({ title: "Role updated", description: `${member.email} is now ${role}` });
      queryClient.invalidateQueries({ queryKey: ["orgMembers", currentOrgId] });
    } catch (e: any) {
      push({ title: "Update failed", description: e?.message ?? "Try again." });
    }
  };

  const handleRemove = async () => {
    if (!removeConfirm || !currentOrgId) return;
    try {
      await removeMut.mutateAsync({ orgId: currentOrgId, userId: removeConfirm.id });
      push({ title: "Member removed", description: `${removeConfirm.email} has been removed.` });
      setRemoveConfirm(null);
      queryClient.invalidateQueries({ queryKey: ["orgMembers", currentOrgId] });
    } catch (e: any) {
      push({ title: "Remove failed", description: e?.message ?? "Try again." });
    }
  };

  const retry = () => {
    refetch();
  };

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between -mt-1 border-b border-border-faint pb-12 flex-wrap gap-8">
        <MonoAnnotation>[ team / {totalMembers} member{totalMembers === 1 ? "" : "s"} ]</MonoAnnotation>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="size-3 mr-4" /> Invite member
        </Button>
      </div>

      {error && (
        <Callout type="danger" title="Failed to load team" className="p-16">
          {error.message || "An unexpected error occurred."}
          <button onClick={retry} className="mt-8 pcl-btn pcl-btn--secondary pcl-btn--sm">
            Retry
          </button>
        </Callout>
      )}

      <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3 -mt-1">
        <Card className="p-16 lg:p-24">
          <CurvyRect sides="allSides" />
          <div className="flex items-center justify-between">
            <span className="text-mono-x-small text-black-alpha-32 uppercase">Billable seats</span>
            <Users className="size-4 text-heat-100" />
          </div>
          <div className="mt-8 text-title-h3 text-accent-black">{seatCount}</div>
        </Card>
        <Card className="p-16 lg:p-24">
          <CurvyRect sides="allSides" />
          <div className="flex items-center justify-between">
            <span className="text-mono-x-small text-black-alpha-32 uppercase">Total members</span>
            <ShieldCheck className="size-4 text-heat-100" />
          </div>
          <div className="mt-8 text-title-h3 text-accent-black">{totalMembers}</div>
        </Card>
        <Card className="p-16 lg:p-24">
          <CurvyRect sides="allSides" />
          <div className="flex items-center justify-between">
            <span className="text-mono-x-small text-black-alpha-32 uppercase">Pending invites</span>
            <Envelope className="size-4 text-heat-100" />
          </div>
          <div className="mt-8 text-title-h3 text-accent-black">
            {(members?.filter((m) => !m.accepted_at).length ?? 0)}
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-8 -mt-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      ) : (members?.length ?? 0) === 0 ? (
        <Card className="p-32 lg:p-64">
          <CurvyRect sides="allSides" />
          <EmptyState
            icon={Users}
            title="No team members yet"
            description="Invite your first team member to get started."
            action={
              <Button onClick={() => setInviteOpen(true)}>
                <UserPlus className="size-3 mr-4" /> Invite member
              </Button>
            }
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <CurvyRect sides="allSides" />
          <div className="overflow-x-auto">
            <table className="w-full text-body-medium min-w-600">
              <thead>
                <tr className="border-b border-border-faint text-left text-mono-x-small text-black-alpha-48 uppercase">
                  <th scope="col" className="p-16">member</th>
                  <th scope="col" className="p-16">role</th>
                  <th scope="col" className="p-16">status</th>
                  <th scope="col" className="p-16">joined</th>
                  <th scope="col" className="p-16 text-right">actions</th>
                </tr>
              </thead>
              <tbody>
                {members?.map((m) => (
                  <tr key={m.id} className="border-b border-border-faint hover:bg-black-alpha-4 transition-colors">
                    <td className="p-16">
                      <div className="flex items-center gap-12">
                        <div className="size-32 rounded-full bg-heat-12 text-heat-100 flex items-center justify-center text-label-small font-medium uppercase">
                          {(m.display_name ?? m.email).charAt(0)}
                        </div>
                        <div>
                          <div className="text-accent-black">{m.display_name ?? "—"}</div>
                          <div className="text-mono-x-small text-black-alpha-48">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-16">
                      {m.role === "owner" ? (
                        <Badge tone="heat">owner</Badge>
                      ) : (
                        <RoleSelect value={m.role} onChange={(role) => handleRoleChange(m, role)} />
                      )}
                    </td>
                    <td className="p-16">
                      {m.accepted_at ? (
                        <Badge tone="success">active</Badge>
                      ) : (
                        <Badge tone="accent">
                          <Warning className="size-3 mr-4" />
                          pending
                        </Badge>
                      )}
                    </td>
                    <td className="p-16 font-mono text-mono-x-small text-black-alpha-32">
                      {new Date(m.invited_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                    </td>
                    <td className="p-16 text-right">
                      {m.role !== "owner" && (
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => setRemoveConfirm(m)}
                          className="text-danger hover:text-danger"
                        >
                          <Trash className="size-3 mr-4" /> Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invite Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite team member" maxWidth={420}>
        <div className="space-y-16">
          <p className="text-body-medium text-black-alpha-64 leading-22">
            Send an invite to join your organization. They will receive an email with instructions.
          </p>
          <div>
            <label className="block text-label-small text-black-alpha-56 mb-8">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full h-40 rounded-md border border-border-faint bg-surface px-12 py-8 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>
          <div>
            <label className="block text-label-small text-black-alpha-56 mb-8">Role</label>
            <div className="flex flex-wrap gap-8">
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setInviteRole(role)}
                  className={`px-16 py-8 rounded-md border text-label-small transition-colors ${
                    inviteRole === role
                      ? "border-heat-100 bg-heat-4 text-accent-black"
                      : "border-border-faint text-black-alpha-72 hover:border-heat-30"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-end gap-8 pt-8">
            <Button variant="tertiary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviteMut.isPending}>
              {inviteMut.isPending ? "Sending…" : "Send invite"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal open={!!removeConfirm} onClose={() => setRemoveConfirm(null)} title="Remove team member" maxWidth={420}>
        {removeConfirm && (
          <div className="space-y-16">
            <p className="text-body-medium text-black-alpha-72 leading-22">
              Are you sure you want to remove <strong>{removeConfirm.email}</strong> from the team? This action can be undone by re-inviting them.
            </p>
            <div className="flex items-center justify-end gap-8">
              <Button variant="tertiary" onClick={() => setRemoveConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleRemove} disabled={removeMut.isPending}>
                {removeMut.isPending ? "Removing…" : "Remove member"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function RoleSelect({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-4 rounded-md px-10 py-6 text-mono-small text-black-alpha-72 hover:text-accent-black hover:bg-black-alpha-4 transition-colors -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint"
      >
        {value}
        <CaretDown className="size-3" />
      </button>
      {open && (
        <div className="absolute right-0 mt-4 z-10 min-w-160 bg-surface border border-border-faint rounded-md shadow-md p-4">
          {ROLES.filter((r) => r !== value).map((role) => (
            <button
              key={role}
              onClick={() => {
                onChange(role);
                setOpen(false);
              }}
              className="w-full text-left px-8 py-6 text-mono-small hover:bg-black-alpha-4 rounded-4 text-accent-black"
            >
              {role}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
