import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { splitsQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/mixd";
import { Button } from "@/components/ui/button";

export function SplitBill({
  bookingId,
  totalCents,
  reference,
}: {
  bookingId: string;
  totalCents: number;
  reference: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: splits } = useQuery(splitsQuery(bookingId));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = splits ?? [];
  const shares = rows.length + 1; // you + everyone added
  const perHead = Math.round(totalCents / shares);
  const covered = rows
    .filter((r) => r.status === "paid")
    .reduce((s, r) => s + r.amount_cents, 0);

  async function addPerson(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setBusy(true);
    const nextShares = rows.length + 2;
    const nextPerHead = Math.round(totalCents / nextShares);
    const { error } = await supabase.from("booking_splits").insert({
      booking_id: bookingId,
      created_by: user.id,
      name: name.trim(),
      email: email.trim() || null,
      amount_cents: nextPerHead,
    });
    if (!error) {
      await supabase
        .from("booking_splits")
        .update({ amount_cents: nextPerHead })
        .eq("booking_id", bookingId)
        .eq("status", "pending");
      setName("");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["splits", bookingId] });
    } else {
      toast.error("Couldn't add that person.");
    }
    setBusy(false);
  }

  async function toggle(id: string, status: string) {
    await supabase
      .from("booking_splits")
      .update({ status: status === "paid" ? "pending" : "paid" })
      .eq("id", id);
    qc.invalidateQueries({ queryKey: ["splits", bookingId] });
  }

  async function remove(id: string) {
    await supabase.from("booking_splits").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["splits", bookingId] });
  }

  async function share() {
    const text = `MIXD.SPACE booking ${reference} — your share is ${formatPrice(perHead)}.`;
    if (navigator.share) {
      try {
        await navigator.share({ text, title: "Split the cost" });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard?.writeText(text);
    toast.success("Copied — send it to your crew.");
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow">Split the cost</p>
        <Button size="sm" variant="ghost" onClick={share}>
          <Share2 className="size-4" /> Share
        </Button>
      </div>

      <p className="mt-4 font-display text-2xl tracking-tight">
        {formatPrice(perHead)} <span className="text-sm text-muted-foreground">per person</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {shares} {shares === 1 ? "person" : "people"} · {formatPrice(covered)} of{" "}
        {formatPrice(totalCents)} settled
      </p>

      <ul className="mt-5 space-y-2">
        <li className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 text-sm">
          <span>You</span>
          <span className="text-muted-foreground">{formatPrice(perHead)}</span>
        </li>
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-sm"
          >
            <span className="min-w-0">
              <span className="block truncate">{r.name}</span>
              {r.email && (
                <span className="block truncate text-xs text-muted-foreground">{r.email}</span>
              )}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => toggle(r.id, r.status)}
                className={
                  "rounded-full px-3 py-1 text-xs " +
                  (r.status === "paid"
                    ? "bg-foreground text-background"
                    : "border border-border text-muted-foreground")
                }
              >
                {r.status === "paid" ? "Paid" : "Mark paid"}
              </button>
              <span className="text-muted-foreground">{formatPrice(r.amount_cents)}</span>
              <button type="button" aria-label="Remove" onClick={() => remove(r.id)}>
                <Trash2 className="size-4 text-muted-foreground" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={addPerson} className="mt-5 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-xl border border-border bg-background px-3 text-base outline-none focus:border-foreground"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl border border-border bg-background px-3 text-base outline-none focus:border-foreground"
        />
        <Button type="submit" disabled={busy || !name.trim()}>
          Add
        </Button>
      </form>
    </div>
  );
}
