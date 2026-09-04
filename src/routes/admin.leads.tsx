import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminHeader, AdminTable, StatusBadge } from "@/components/admin/AdminTable";
import { EmptyState } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/mixd";

export const Route = createFileRoute("/admin/leads")({
  component: AdminLeads,
});

const KIND_LABEL: Record<string, string> = {
  early_access: "Early access",
  team_setup: "Team setup",
  business_address: "Business address",
  contact: "Contact",
  space_request: "Space request",
};

const NEXT_STATUS: Record<string, string> = {
  new: "contacted",
  contacted: "closed",
  closed: "new",
};

function AdminLeads() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function advance(id: string, status: string) {
    const { error } = await supabase
      .from("leads")
      .update({ status: NEXT_STATUS[status] ?? "new" })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Lead updated.");
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    }
  }

  const rows = (data ?? []).filter((l) =>
    `${l.name} ${l.email} ${l.company ?? ""} ${l.kind}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <AdminHeader
        eyebrow="Leads"
        title="Everyone who reached out."
        intro="Requests from the public website: early access, team setups, business address and general contact."
        search={{ value: q, onChange: setQ, placeholder: "Search name, email, company" }}
      >
        <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
          {rows.length} {rows.length === 1 ? "lead" : "leads"}
        </span>
      </AdminHeader>

      {isLoading && <div className="mt-10 h-24 animate-pulse bg-muted" />}
      {!isLoading && rows.length === 0 && (
        <div className="mt-10">
          <EmptyState
            title="No leads yet."
            description="Requests sent through the website land here."
          />
        </div>
      )}
      {rows.length > 0 && (
        <div className="mt-10">
          <AdminTable
            head={["Received", "Type", "Name", "Contact", "Message", "Status", ""]}
            rows={rows.map((l) => ({
              key: l.id,
              cells: [
                formatDate(l.created_at),
                KIND_LABEL[l.kind] ?? l.kind,
                <span key="n">
                  <span className="block">{l.name}</span>
                  {l.company && (
                    <span className="block text-xs text-muted-foreground">{l.company}</span>
                  )}
                </span>,
                <span key="c" className="block">
                  <a className="link-underline" href={`mailto:${l.email}`}>
                    {l.email}
                  </a>
                  {l.phone && (
                    <span className="block text-xs text-muted-foreground">{l.phone}</span>
                  )}
                </span>,
                <span key="m" className="block max-w-xs text-muted-foreground">
                  {l.message ?? "—"}
                </span>,
                <StatusBadge key="s" value={l.status} />,
                <Button key="a" size="sm" variant="outline" onClick={() => advance(l.id, l.status)}>
                  Mark {NEXT_STATUS[l.status] ?? "new"}
                </Button>,
              ],
            }))}
          />
        </div>
      )}
    </div>
  );
}
