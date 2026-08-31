import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeSlash, SignOut, Sun, Moon, Copy, Check, Trash } from "@phosphor-icons/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CodeBlock } from "@/components/ui/code-block";
import { CurvyRect, Modal, useToast } from "@policyctl/design-system";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { MonoAnnotation } from "@/components/shared/EmptyState";

export function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { push } = useToast();
  const [reveal, setReveal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const apiKeyMasked = "pc_live_••••••••••••••••••••";

  const copyKey = async () => {
    // Copy the masked placeholder. In production, fetch the real key from the server.
    await navigator.clipboard.writeText("pc_live_••••••••••••••••••••");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  const onDelete = () => {
    if (confirmText !== "delete my account") {
      push({ title: "Type the phrase exactly", description: 'Type "delete my account" to confirm', tone: "warning" });
      return;
    }
    push({ title: "Account deletion queued", description: "Check your email to confirm." });
    setConfirmDelete(false);
    setConfirmText("");
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
            <span className="font-mono text-mono-small text-accent-black">{user?.email}</span>
          </li>
          <li className="flex justify-between items-center px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            <span className="text-body-medium text-black-alpha-56">Provider</span>
            <span className="font-mono text-mono-small text-accent-black">{user?.provider ?? "email"}</span>
          </li>
          <li className="flex justify-between items-center px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            <span className="text-body-medium text-black-alpha-56">Display name</span>
            <span className="font-mono text-mono-small text-accent-black">{user?.displayName ?? "—"}</span>
          </li>
        </ul>
      </Card>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h3 className="text-label-x-large text-accent-black">Control-plane API key</h3>
        <p className="mt-8 text-body-medium text-black-alpha-64 leading-22">
          Use this to link the CLI to the cloud dashboard.
        </p>
        <div className="mt-16 flex items-center gap-8">
          <code className="font-mono text-mono-medium text-accent-black flex-1 px-12 py-12 -mt-1 relative before:absolute before:inset-0 before:rounded-inherit before:border before:border-border-faint">
            {reveal ? "pc_live_1234abcd5678efgh" : apiKeyMasked}
          </code>
          <Button variant="tertiary" size="sm" onClick={() => setReveal((r) => !r)}>
            {reveal ? <EyeSlash className="size-3 mr-4" /> : <Eye className="size-3 mr-4" />}
            {reveal ? "Hide" : "Reveal"}
          </Button>
          <Button variant="tertiary" size="sm" onClick={copyKey}>
            {copied ? <Check className="size-3 mr-4" /> : <Copy className="size-3 mr-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="mt-16">
          <CodeBlock code="policyctl login --control-plane" lang="bash" title="cli" />
        </div>
      </Card>

      <Card className="p-24 lg:p-32">
        <CurvyRect sides="allSides" />
        <h3 className="text-label-x-large text-accent-black">Appearance</h3>
        <p className="mt-8 text-body-medium text-black-alpha-64 leading-22">
          Light is the shipped theme. Dark mode mirrors the same tokens with inverted surfaces.
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
          to confirm. This action is permanent.
        </p>
        <Input
          className="mt-16"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="delete my account"
        />
        <div className="mt-24 flex items-center justify-end gap-8">
          <Button variant="tertiary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onDelete}>
            Delete permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}