import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/site/SiteShell";
import { AdminTable, AdminHeader, StatusBadge } from "@/components/admin/AdminTable";
import { membershipsQuery } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/mixd";

export const Route = createFileRoute("/admin/memberships")({
  component: AdminMemberships,
});

function AdminMemberships() {
  const { data: plans, isLoading } = useQuery(membershipsQuery);
  const { data: subs } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membership_subscriptions")
        .select("*, memberships(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const active = (subs ?? []).filter((s) => s.status === "active");
  const mrr = active.reduce((sum, s) => {
    const plan = (plans ?? []).find((p) => p.id === s.membership_id);
    return sum + (plan?.monthly_price_cents ?? 0);
  }, 0);

  return (
    <div>
      <AdminHeader
        eyebrow="Memberships"
        title="Plans and subscribers."
        intro="Plan pricing is editable in the database and drives member discounts across booking."
      />

      <div className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-3">
        <Kpi label="Active plans" value={String((plans ?? []).filter((p) => p.active).length)} />
        <Kpi label="Active subscribers" value={String(active.length)} />
        <Kpi label="Recurring / month" value={formatPrice(mrr)} />
      </div>

      <h2 className="display-md mt-16">Plans</h2>
      {isLoading ? (
        <div className="mt-6 h-32 w-full animate-pulse bg-muted" />
      ) : (
        <AdminTable
          className="mt-6"
          head={["Plan", "Price", "Credits", "Discount", "Status"]}
          rows={(plans ?? []).map((p) => ({
            key: p.id,
            cells: [
              p.name,
              formatPrice(p.monthly_price_cents),
              String(p.included_credits ?? 0),
              `${p.discount_percent ?? 0}%`,
              <StatusBadge key="s" value={p.active ? "active" : "inactive"} />,
            ],
          }))}
        />
      )}

      <h2 className="display-md mt-16">Subscribers</h2>
      {(subs ?? []).length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No subscribers yet."
            description="Members appear here the moment someone activates a plan."
          />
        </div>
      ) : (
        <AdminTable
          className="mt-6"
          head={["Plan", "Started", "Credits left", "Status"]}
          rows={(subs ?? []).map((s) => ({
            key: s.id,
            cells: [
              s.memberships?.name ?? "—",
              s.started_at ? formatDate(s.started_at) : "—",
              String(s.credits_remaining ?? 0),
              <StatusBadge key="s" value={s.status} />,
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
