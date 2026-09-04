import { useState } from "react";
import { Envelope, Check } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Premium waitlist form (free-launch mode). Collects an email, saves it to the
 * Worker D1 waitlist, and tells the user premium is coming soon — no payment.
 */
export function WaitlistForm({
  source,
  compact = false,
}: {
  source: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [duplicate, setDuplicate] = useState(false);

  if (position !== null || duplicate) {
    return (
      <div
        className="rounded-md border border-border-faint bg-surface p-16 text-center"
        role="status"
      >
        <Check className="size-5 text-success mx-auto" weight="bold" aria-hidden />
        <p className="mt-8 text-body-medium text-accent-black font-medium">
          {duplicate ? "You're already on the list" : `You're #${position} on the waitlist`}
        </p>
        <p className="mt-4 text-body-small text-black-alpha-64 leading-22">
          Premium hasn&apos;t launched yet — it&apos;s coming soon. We&apos;ll email you
          the moment early access opens.
        </p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const res = await api.joinWaitlist(value, {
        name: name.trim() || undefined,
        source,
      });
      if (res.duplicate) setDuplicate(true);
      else setPosition(res.position ?? 1);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className={compact ? "space-y-8" : "space-y-12"}>
      <p className="text-body-small text-black-alpha-64 leading-22">
        Premium is coming soon — join the waitlist and we&apos;ll notify you at launch.
      </p>
      {!compact && (
        <div>
          <label htmlFor={`waitlist-name-${source}`} className="text-label-small text-accent-black block mb-6">
            Name <span className="text-black-alpha-32">(optional)</span>
          </label>
          <input
            id={`waitlist-name-${source}`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
            className="w-full h-44 rounded-md border border-border-faint bg-surface px-12 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
          />
        </div>
      )}
      <div>
        <label htmlFor={`waitlist-email-${source}`} className="text-label-small text-accent-black block mb-6">
          Work Email
        </label>
        <input
          id={`waitlist-email-${source}`}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          required
          autoComplete="email"
          aria-invalid={error ? "true" : undefined}
          className="w-full h-44 rounded-md border border-border-faint bg-surface px-12 text-body-medium text-accent-black placeholder:text-black-alpha-32 outline-none transition-all duration-200 focus:border-heat-100 focus:ring-2 focus:ring-heat-100/20"
        />
      </div>
      {error && (
        <p role="alert" className="text-mono-small text-danger">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full" size={compact ? "sm" : "lg"}>
        {pending ? (
          "Joining…"
        ) : (
          <>
            <Envelope className="size-4 mr-4" /> Join the waitlist
          </>
        )}
      </Button>
    </form>
  );
}
