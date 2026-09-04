import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeSlash, SignOut, Copy, Check, Trash, Key } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeBlock } from "@/components/ui/code-block";
import { CurvyRect, Modal, useToast } from "@policyctl/design-system";
import { useAuth } from "@/lib/auth";
import { useBilling, useGenerateApiKey, useDeleteOrg, useOrgs, useCurrentOrgId } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { MonoAnnotation } from "@/components/shared/EmptyState";

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const billing = useBilling();
  const orgsQuery = useOrgs();
  const generateApiKey = useGenerateApiKey();
  const deleteOrg = useDeleteOrg();

  const currentOrgId = useCurrentOrgId();
  const currentOrg =
    orgsQuery.data?.orgs?.find((o) => o.id === currentOrgId) ?? orgsQuery.data?.orgs?.[0];
  const deletePhrase = currentOrg ? `delete ${currentOrg.name}` : "delete this organization";

  const [reveal, setReveal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const hasApiKey = billing.data?.has_api_key ?? false;

  const generateNewKey = async () => {
    try {
      const result = await generateApiKey.mutateAsync();
      setGeneratedKey(result.key);
      setReveal(true);
      setCopied(false);
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    } catch (e: any) {
      push({ title: "Failed to generate key", description: e?.message ?? "Try again." });
    }
  };

  const copyKey = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  const onDelete = async () => {
    if (confirmText !== deletePhrase) {
      push({
        title: "Type the phrase exactly",
        description: `Type "${deletePhrase}" to confirm`,
        tone: "warning",
      });
      return;
    }
    if (!currentOrg) return;
    const orgId = currentOrg.id;
    setIsDeleting(true);
    try {
      await deleteOrg.mutateAsync(orgId);
      push({
        title: "Organization deleted",
        description: `"${currentOrg.name}" and all associated data have been removed.`,
      });
      await logout();
      navigate("/");
    } catch (e: any) {
      push({ title: "Deletion failed", description: e?.message ?? "Please try again." });
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-24">
      <MonoAnnotation>[ settings ]</MonoAnnotation>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h2 className="text-label-x-large">Account</h2>
        <ul className="mt-16 space-y-12">
          <InfoRow label="Email" value={user?.email ?? "—"} />
          <InfoRow label="Name" value={user?.displayName ?? "—"} mono />
          <InfoRow label="User ID" value={user?.id ?? "—"} mono />
        </ul>
      </Card>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h2 className="text-label-x-large">Control-plane API key</h2>
        <p className="mt-8 text-body-medium leading-22 text-black-alpha-64">
          Use this to link the CLI to the cloud dashboard. Keys are stored as SHA-256 hashes
          and never logged.
        </p>
        <div className="mt-16 flex items-center gap-8">
          <code className="relative flex-1 border border-border-faint px-12 py-12 font-mono text-mono-medium before:absolute before:inset-0 before:rounded-inherit">
            {generatedKey && reveal ? generatedKey : hasApiKey ? "pc_live_••••••••••••••••" : "— no key generated"}
          </code>
          {!generatedKey && (
            <Button variant="tertiary" size="sm" onClick={generateNewKey} disabled={generateApiKey.isPending}>
              <Key className="size-3 mr-4" aria-hidden />
              {hasApiKey ? "Regenerate" : "Generate"}
            </Button>
          )}
          {generatedKey && reveal && (
            <>
              <Button variant="tertiary" size="sm" onClick={() => setReveal((r) => !r)}>
                {reveal ? <EyeSlash className="size-3 mr-4" aria-hidden /> : <Eye className="size-3 mr-4" aria-hidden />}
                {reveal ? "Hide" : "Reveal"}
              </Button>
              <Button variant="tertiary" size="sm" onClick={copyKey}>
                {copied ? <Check className="size-3 mr-4" aria-hidden /> : <Copy className="size-3 mr-4" aria-hidden />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </>
          )}
        </div>
        {generatedKey && reveal && (
          <div className="mt-16">
            <p className="mb-8 text-body-small text-black-alpha-56">
              Save this key now — it won&apos;t be shown again.
            </p>
            <CodeBlock code={`policyctl login`} lang="bash" title="cli" />
          </div>
        )}
        {!generatedKey && hasApiKey && (
          <p className="mt-8 text-body-small text-black-alpha-48">
            A key is already active. Click &quot;Regenerate&quot; to rotate it.
          </p>
        )}
      </Card>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h2 className="text-label-x-large">Session</h2>
        <div className="mt-16">
          <Button variant="secondary" onClick={onLogout}>
            <SignOut className="size-3 mr-4" aria-hidden /> Sign out
          </Button>
        </div>
      </Card>

      <Card className="border-danger/30 p-24 lg:p-32">
        <CurvyRect sides="allSides" color="rgba(239,68,68,0.3)" />
        <h2 className="text-label-x-large text-danger">Danger zone</h2>
        <p className="mt-8 text-body-medium leading-22 text-black-alpha-64">
          Permanently delete the {currentOrg ? `"${currentOrg.name}" ` : ""}organization and all
          associated data. This cannot be undone.
        </p>
        <div className="mt-16">
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash className="size-3 mr-4" aria-hidden /> Delete organization
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete organization"
        maxWidth={420}
      >
        <p className="text-body-medium leading-22 text-black-alpha-72">
          Type <code className="font-mono text-mono-small text-accent-black">{deletePhrase}</code>{" "}
          to confirm. This will permanently delete{currentOrg ? ` "${currentOrg.name}"` : " the organization"},
          all policies, violations, subscriptions, and Stripe customer data. This cannot be undone.
        </p>
        <Input
          id="delete-confirm"
          className="mt-16"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={deletePhrase}
          aria-invalid={confirmText.length > 0 && confirmText !== deletePhrase ? "true" : undefined}
        />
        <div className="mt-24 flex items-center justify-end gap-8">
          <Button variant="tertiary" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={confirmText !== deletePhrase || isDeleting}>
            {isDeleting ? "Deleting…" : "Delete permanently"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <li className="relative flex items-center justify-between border border-border-faint px-12 py-12 before:absolute before:inset-0 before:rounded-inherit">
      <span className="text-body-medium text-black-alpha-56">{label}</span>
      <span className={mono ? "font-mono text-mono-small" : "text-body-medium"}>{value}</span>
    </li>
  );
}
