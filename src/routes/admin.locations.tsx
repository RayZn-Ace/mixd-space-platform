import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { locationsQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/SiteShell";

export const Route = createFileRoute("/admin/locations")({
  component: AdminLocations,
});

const FIELD =
  "h-10 w-full border-0 border-b border-border bg-transparent px-0 text-sm outline-none focus:border-foreground";

const BLANK = {
  name: "",
  slug: "",
  address_line1: "",
  postal_code: "",
  city: "",
  country: "Deutschland",
  contact_email: "",
  contact_phone: "",
  parking_info: "",
  getting_there: "",
  hero_image_url: "",
  description: "",
};


function AdminLocations() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(locationsQuery);
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof BLANK, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
    const { error } = editing
      ? await supabase.from("locations").update(payload).eq("id", editing)
      : await supabase.from("locations").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "Location updated." : "Location created.");
    setForm(BLANK);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["locations"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Location deleted.");
      qc.invalidateQueries({ queryKey: ["locations"] });
    }
  }

  return (
    <div>
      <p className="eyebrow">Locations</p>
      <h1 className="display-md mt-3">Every location.</h1>

      <div className="mt-10 grid gap-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {isLoading && <div className="h-24 animate-pulse bg-muted" />}
          {!isLoading && (data ?? []).length === 0 && (
            <EmptyState title="No locations yet." description="Add the first one on the right." />
          )}
          <ul className="divide-y divide-border border-y border-border">
            {(data ?? []).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div>
                  <p className="font-display text-lg tracking-tight">{l.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {l.address_line1}, {l.postal_code} {l.city} · /{l.slug}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(l.id);
                      setForm({
                        name: l.name,
                        slug: l.slug,
                        address_line1: l.address_line1 ?? "",
                        postal_code: l.postal_code ?? "",
                        city: l.city ?? "",
                        country: l.country ?? "Deutschland",
                        contact_email: l.contact_email ?? "",
                        contact_phone: l.contact_phone ?? "",
                        parking_info: l.parking_info ?? "",
                        getting_there: l.getting_there ?? "",
                        hero_image_url: l.hero_image_url ?? "",
                        description: l.description ?? "",

                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(l.id)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={save} className="h-fit border border-border p-6">
          <p className="eyebrow">{editing ? "Edit location" : "New location"}</p>
          <div className="mt-6 space-y-5">
            {(
              [
                ["name", "Name"],
                ["slug", "Slug"],
                ["address_line1", "Address"],
                ["postal_code", "Postal code"],
                ["city", "City"],
                ["country", "Country"],
                ["contact_email", "Contact email"],
                ["contact_phone", "Contact phone"],
                ["parking_info", "Parking info"],
                ["getting_there", "Getting there"],
                ["hero_image_url", "Hero image URL"],
                ["description", "Description"],

              ] as [keyof typeof BLANK, string][]
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="eyebrow">{label}</span>
                <input
                  className={FIELD}
                  value={form[key]}
                  required={key === "name"}
                  onChange={(e) => set(key, e.target.value)}
                />
              </label>
            ))}
          </div>
          <div className="mt-8 flex gap-2">
            <Button type="submit" disabled={saving}>
              {editing ? "Save changes" : "Create location"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setForm(BLANK);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
