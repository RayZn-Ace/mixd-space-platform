import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";
import { AdminTable, AdminHeader, StatusBadge } from "@/components/admin/AdminTable";
import { addonsQuery } from "@/lib/queries";
import { formatPrice } from "@/lib/mixd";

export const Route = createFileRoute("/admin/addons")({
  component: AdminAddons,
});

function AdminAddons() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(addonsQuery);

  async function toggle(id: string, active: boolean) {
    const { error } = await supabase.from("addons").update({ active: !active }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(active ? "Add-on paused." : "Add-on live.");
      qc.invalidateQueries({ queryKey: ["addons"] });
    }
  }

  return (
    <div>
      <AdminHeader
        eyebrow="Add-ons"
        title="Extras sold with a booking."
        intro="Everything here shows up in the Extras step of the booking flow and is billed with the booking."
      />
      {isLoading ? (
        <div className="mt-10 h-40 w-full animate-pulse bg-muted" />
      ) : (data ?? []).length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No add-ons yet." description="Add parking, catering or equipment." />
        </div>
      ) : (
        <AdminTable
          className="mt-10"
          head={["Add-on", "Price", "Billed", "Status", ""]}
          rows={(data ?? []).map((a) => ({
            key: a.id,
            cells: [
              a.name,
              formatPrice(a.price_cents),
              a.price_type.replace("per_", "per "),
              <StatusBadge key="s" value={a.active ? "active" : "inactive"} />,
              <Button key="b" size="sm" variant="outline" onClick={() => toggle(a.id, a.active)}>
                {a.active ? "Pause" : "Activate"}
              </Button>,
            ],
          }))}
        />
      )}
    </div>
  );
}
