import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/site/SiteShell";
import { formatDate, formatPrice, formatTime } from "@/lib/mixd";
import type { BookingStatus } from "@/lib/mixd";

export const Route = createFileRoute("/admin/bookings")({
  component: AdminBookings,
});

const STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
];

function AdminBookings() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [date, setDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, spaces(name), locations(name), profiles:user_id(full_name,email)")
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = (data ?? []).filter((b) => {
    if (status && b.status !== status) return false;
    if (date && new Date(b.starts_at).toISOString().slice(0, 10) !== date) return false;
    return true;
  });

  async function update(id: string, next: BookingStatus) {
    const { error } = await supabase.from("bookings").update({ status: next }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Buchung aktualisiert.");
      qc.invalidateQueries({ queryKey: ["admin-bookings"] });
    }
  }

  return (
    <div>
      <p className="eyebrow">Buchungen</p>
      <h1 className="display-md mt-3">Alle Buchungen und Anfragen.</h1>

      <div className="mt-8 flex flex-wrap gap-6 border-y border-border py-5">
        <label className="block">
          <span className="eyebrow">Datum</span>
          <input
            type="date"
            className="h-10 border-0 border-b border-border bg-transparent text-sm outline-none focus:border-foreground"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Status</span>
          <select
            className="h-10 border-0 border-b border-border bg-transparent text-sm outline-none focus:border-foreground"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Alle</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading && <div className="mt-8 h-24 animate-pulse bg-muted" />}
      {!isLoading && rows.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="Keine passenden Buchungen."
            description="Probiere ein anderes Datum oder einen anderen Status."
          />
        </div>
      )}

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {rows.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div>
              <p className="font-display text-base tracking-tight">
                {b.reference} · {b.spaces?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(b.starts_at)} · {formatTime(b.starts_at)} – {formatTime(b.ends_at)} ·{" "}
                {b.locations?.name} · {formatPrice(b.total_cents, b.currency)}
              </p>
            </div>
            <select
              className="border border-border bg-transparent px-2 py-1 text-xs"
              value={b.status}
              onChange={(e) => update(b.id, e.target.value as BookingStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
