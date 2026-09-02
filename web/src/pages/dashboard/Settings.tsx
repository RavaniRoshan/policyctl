import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeSlash, SignOut, Sun, Moon, Copy, Check, Trash, ArrowRight, Key } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeBlock } from "@/components/ui/code-block";
import { CurvyRect, Modal, useToast } from "@policyctl/design-system";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useBilling, useGenerateApiKey, useDeleteOrg, useOrgs } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { MonoAnnotation } from "@/components/shared/EmptyState";

export function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { push } = useToast();
  const queryClient = useQueryClient();
  const billing = useBilling();
  const orgsQuery = useOrgs();
  const generateApiKey = useGenerateApiKey();
  const deleteOrg = useDeleteOrg();
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
      // Invalidate billing status so has_api_key flips to true.
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
    if (confirmText !== "delete my account") {
      push({ title: "Type the phrase exactly", description: 'Type "delete my account" to confirm', tone: "warning" });
      return;
    }
    const orgs = orgsQuery.data?.orgs;
    if (!orgs || orgs.length === 0) return;
    const orgId = orgs[0].id;
    setIsDeleting(true);
    try {
      await deleteOrg.mutateAsync(orgId);
      push({ title: "Account deleted", description: "Your account and all associated data have been removed." });
      await logout();
      navigate("/");
    } catch (e: any) {
      push({ title: "Deletion failed", description: e?.message ?? "Please try again." });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-24 max-w-2xl">
      <MonoAnnotation>[ settings ]</MonoAnnotation>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h3 className="text-label-x-large text-accent-black">Account</h3>
        <ul className="mt-16 space-y-12 -mt-1">
          <li className="flex justify-between items-center px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            <span className="text-body-medium text-black-alpha-56">Email</span>
            <span className="text-body-medium text-accent-black">{user?.email}</span>
          </li>
          <li className="flex justify-between items-center px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            <span className="text-body-medium text-black-alpha-56">Name</span>
            <span className="font-mono text-mono-small text-accent-black">{user?.displayName ?? "—"}</span>
          </li>
          <li className="flex justify-between items-center px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            <span className="text-body-medium text-black-alpha-56">User ID</span>
            <span className="font-mono text-mono-small text-accent-black">{user?.id ?? "—"}</span>
          </li>
        </ul>
      </Card>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h3 className="text-label-x-large text-accent-black">Control-plane API key</h3>
        <p className="mt-8 text-body-medium text-black-alpha-64 leading-22">
          Use this to link the CLI to the cloud dashboard. Keys are stored as SHA-256 hashes and never logged.
        </p>
        <div className="mt-16 flex items-center gap-8">
          <code className="font-mono text-mono-medium text-accent-black flex-1 px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            {generatedKey && reveal ? generatedKey : hasApiKey ? "pc_live_•••••••••••••••• regenerated" : "— no key generated"}
          </code>
          {!generatedKey && (
            <Button variant="tertiary" size="sm" onClick={generateNewKey} disabled={generateApiKey.isPending}>
              <Key className="size-3 mr-4" />
              {hasApiKey ? "Regenerate" : "Generate"}
            </Button>
          )}
          {generatedKey && reveal && (
            <>
              <Button variant="tertiary" size="sm" onClick={() => setReveal((r) => !r)}>
                {reveal ? <EyeSlash className="size-3 mr-4" /> : <Eye className="size-3 mr-4" />}
                {reveal ? "Hide" : "Reveal"}
              </Button>
              <Button variant="tertiary" size="sm" onClick={copyKey}>
                {copied ? <Check className="size-3 mr-4" /> : <Copy className="size-3 mr-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </>
          )}
        </div>
        {generatedKey && reveal && (
          <div className="mt-16">
            <p className="text-body-small text-black-alpha-56 mb-8">Save this key now — it won't be shown again.</p>
            <CodeBlock code={`echo '${generatedKey}' > ~/.config/policyctl/api-key`} lang="bash" title="cli" />
          </div>
        )}
        {!generatedKey && hasApiKey && (
          <p className="mt-8 text-body-small text-black-alpha-48">A key is already active. Click "Regenerate" to rotate it.</p>
        )}
      </Card>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h3 className="text-label-x-large text-accent-black">Billing</h3>
        <p className="mt-8 text-body-medium text-black-alpha-64 leading-22">
          Manage your subscription and payment method.
        </p>
        <div className="mt-16">
          {user && (
            <Link
              to="/dashboard/billing"
              className="inline-flex items-center gap-4 px-16 py-8 rounded-full bg-heat-100 text-accent-white text-label-medium font-medium hover:bg-heat-90 transition-colors"
            >
              Manage subscription
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </Card>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h3 className="text-label-x-large text-accent-black">Appearance</h3>
        <p className="mt-8 text-body-medium text-black-alpha-72 leading-22">
          Match your environment. Tokens swap automatically.
        </p>
        <div className="mt-16 flex items-center gap-8">
          <Button
            variant={theme === "light" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTheme("light")}
          >
            <Sun className="size-3 mr-4" /> Light
          </Button>
          <Button
            variant={theme === "dark" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTheme("dark")}
          >
            <Moon className="size-3 mr-4" /> Dark
          </Button>
          <Button
            variant={theme === "system" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTheme("system")}
          >
            System
          </Button>
        </div>
      </Card>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h3 className="text-label-x-large text-accent-black">Session</h3>
        <div className="mt-16">
          <Button variant="secondary" onClick={onLogout}>
            <SignOut className="size-3 mr-4" /> Sign out
          </Button>
        </div>
      </Card>

      <Card className="p-24 lg:p-32 border-danger/30">
        <CurvyRect sides="allSides" color="rgba(239,68,68,0.3)" />
        <h3 className="text-label-x-large text-danger">Danger zone</h3>
        <p className="mt-8 text-body-medium text-black-alpha-64 leading-22">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>
        <div className="mt-16">
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash className="size-3 mr-4" /> Delete account
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete account"
        maxWidth={420}
      >
        <p className="text-body-medium text-black-alpha-72 leading-22">
          Type <code className="font-mono text-mono-small text-accent-black">delete my account</code>{" "}
          to confirm. This will permanently delete your org, all policies, violations, subscriptions,
          and Stripe customer data. This cannot be undone.
        </p>
        <Input
          id="delete-confirm"
          className="mt-16"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="delete my account"
          aria-invalid={confirmText.length > 0 && confirmText !== "delete my account" ? "true" : undefined}
        />
        <div className="mt-24 flex items-center justify-end gap-8">
          <Button variant="tertiary" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onDelete}
            disabled={confirmText !== "delete my account" || isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete permanently"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}