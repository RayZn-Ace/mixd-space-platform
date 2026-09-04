import { useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { XMark } from "@/components/site/XMark";

export type LeadKind =
  | "early_access"
  | "team_setup"
  | "business_address"
  | "contact"
  | "space_request";

const COPY: Record<LeadKind, { title: string; description: string; cta: string }> = {
  early_access: {
    title: "Get early access.",
    description: "We'll let you know when booking opens in Garbsen — and what it costs.",
    cta: "Get early access",
  },
  team_setup: {
    title: "Request a team setup.",
    description: "Tell us how many people and how often. We'll come back with a setup.",
    cta: "Request a team setup",
  },
  business_address: {
    title: "Business address interest.",
    description: "Leave your details and we'll send terms as soon as they're final.",
    cta: "Register interest",
  },
  contact: {
    title: "Talk to us.",
    description: "A question about a space, a date or a longer stay? Write to us.",
    cta: "Send message",
  },
  space_request: {
    title: "Request this space.",
    description: "We'll confirm availability and the final price by email.",
    cta: "Send request",
  },
};

const FIELD =
  "h-11 w-full rounded-xl border border-border bg-background px-3 text-base outline-none transition-colors focus:border-foreground";

export function LeadDialog({
  kind,
  trigger,
  className,
  presetMessage,
  onDone,
}: {
  kind: LeadKind;
  trigger?: ReactNode;
  className?: string;
  presetMessage?: string;
  onDone?: () => void;
}) {
  const copy = COPY[kind];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: presetMessage ?? "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("leads").insert({
      kind,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      message: form.message.trim() || null,
      source_path: path,
    });
    setSending(false);
    if (error) {
      toast.error("That didn't go through. Please email hello@mixd.space.");
      return;
    }
    toast.success("Thanks — we'll come back to you.");
    setForm({ name: "", email: "", phone: "", company: "", message: presetMessage ?? "" });
    setOpen(false);
    onDone?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className={className}>
            {copy.cta}
            <XMark className="ml-1 size-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight">{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="mt-2 space-y-3">
          <input
            className={FIELD}
            placeholder="Your name"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
          <input
            className={FIELD}
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className={FIELD}
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
            <input
              className={FIELD}
              placeholder="Company (optional)"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
            />
          </div>
          <textarea
            className="min-h-24 w-full rounded-xl border border-border bg-background p-3 text-base outline-none transition-colors focus:border-foreground"
            placeholder="What do you need?"
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="size-4 animate-spin" /> : copy.cta}
          </Button>
          <p className="text-xs text-muted-foreground">
            We only use your details to answer you. Nothing else.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** A quiet editorial lead-capture band for public pages. */
export function LeadBand({
  eyebrow = "Pre-launch",
  title,
  line,
  kind,
}: {
  eyebrow?: string;
  title: string;
  line: string;
  kind: LeadKind;
}) {
  return (
    <section className="container-mixd mt-24 lg:mt-32">
      <div className="grid gap-8 border-y border-border py-14 md:grid-cols-[1.2fr_auto] md:items-end lg:py-20">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <XMark className="size-3 text-accent" />
            {eyebrow}
          </p>
          <h2 className="display-md mt-5 max-w-2xl">{title}</h2>
          <p className="mt-4 max-w-md text-muted-foreground">{line}</p>
        </div>
        <LeadDialog kind={kind} />
      </div>
    </section>
  );
}
