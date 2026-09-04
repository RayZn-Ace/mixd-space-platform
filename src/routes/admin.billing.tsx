import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/site/SiteShell";
import { AdminTable, AdminHeader, StatusBadge } from "@/components/admin/AdminTable";
import { formatDate, formatPrice } from "@/lib/mixd";

export const Route = createFileRoute("/admin/billing")({
  component: AdminBilling,
});

function AdminBilling() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*, bookings(reference)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = payments ?? [];
  const captured = rows.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);
  const open = rows.filter((p) => p.status !== "paid").reduce((s, p) => s + p.amount_cents, 0);

  return (
    <div>
      <AdminHeader
        eyebrow="Payments & invoices"
        title="Money in, on one screen."
        intro="Payments currently run through the demo provider. Swapping in a live provider does not change this view."
      />

      <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
        <Kpi label="Captured" value={formatPrice(captured)} />
        <Kpi label="Open / on site" value={formatPrice(open)} />
        <Kpi label="Invoices" value={String((invoices ?? []).length)} />
      </div>

      <h2 className="display-md mt-16">Payments</h2>
      {isLoading ? (
        <div className="mt-6 h-32 w-full animate-pulse bg-muted" />
      ) : rows.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No payments yet."
            description="Every booking payment lands here with its provider reference."
          />
        </div>
      ) : (
        <AdminTable
          className="mt-6"
          head={["Date", "Booking", "Method", "Amount", "Status"]}
          rows={rows.map((p) => ({
            key: p.id,
            cells: [
              formatDate(p.created_at),
              p.bookings?.reference ?? "—",
              (p.method ?? "—").replace(/_/g, " "),
              formatPrice(p.amount_cents, p.currency),
              <StatusBadge key="s" value={p.status} />,
            ],
          }))}
        />
      )}

      <h2 className="display-md mt-16">Invoices</h2>
      {(invoices ?? []).length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No invoices issued."
            description="Invoices are generated per booking or per membership cycle."
          />
        </div>
      ) : (
        <AdminTable
          className="mt-6"
          head={["Number", "Issued", "Amount", "Status"]}
          rows={(invoices ?? []).map((i) => ({
            key: i.id,
            cells: [
              i.number,
              i.issued_at ? formatDate(i.issued_at) : "—",
              formatPrice(i.amount_cents, i.currency),
              <StatusBadge key="s" value={i.status} />,
            ],
          }))}
        />
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background p-6">
      <p className="eyebrow">{label}</p>
      <p className="mt-4 font-display text-3xl tracking-tight">{value}</p>
    </div>
  );
}
