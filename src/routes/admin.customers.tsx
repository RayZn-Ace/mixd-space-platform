import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/site/SiteShell";
import { AdminTable, AdminHeader, StatusBadge } from "@/components/admin/AdminTable";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const [{ data: profiles, error }, { data: bookings }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("bookings").select("user_id,total_cents,status"),
      ]);
      if (error) throw error;
      return (profiles ?? []).map((p) => {
        const own = (bookings ?? []).filter(
          (b) => b.user_id === p.id && b.status !== "cancelled",
        );
        return {
          ...p,
          bookings: own.length,
          spent: own.reduce((s, b) => s + b.total_cents, 0),
        };
      });
    },
  });

  const rows = (data ?? []).filter((p) =>
    q
      ? `${p.full_name ?? ""} ${p.email ?? ""}`.toLowerCase().includes(q.toLowerCase())
      : true,
  );

  return (
    <div>
      <AdminHeader
        eyebrow="Customers"
        title="Everyone who works here."
        search={{ value: q, onChange: setQ, placeholder: "Search name or email" }}
      />
      {isLoading ? (
        <div className="mt-10 h-40 w-full animate-pulse bg-muted" />
      ) : rows.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No customers yet."
            description="Accounts appear here as soon as someone signs up or books."
          />
        </div>
      ) : (
        <AdminTable
          className="mt-10"
          head={["Name", "Email", "Bookings", "Spent", "Status"]}
          rows={rows.map((p) => ({
            key: p.id,
            cells: [
              p.full_name ?? "—",
              p.email ?? "—",
              String(p.bookings),
              new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
                p.spent / 100,
              ),
              <StatusBadge key="s" value={p.status ?? "active"} />,
            ],
          }))}
        />
      )}
    </div>
  );
}
