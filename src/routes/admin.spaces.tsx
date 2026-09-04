import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { locationsQuery, spacesQuery } from "@/lib/queries";
import { SPACE_TYPE_LABEL, formatPrice, type SpaceType } from "@/lib/mixd";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/SiteShell";

export const Route = createFileRoute("/admin/spaces")({
  component: AdminSpaces,
});

const FIELD =
  "h-10 w-full border-0 border-b border-border bg-transparent px-0 text-sm outline-none focus:border-foreground";

const TYPES: SpaceType[] = [
  "flex_desk",
  "dedicated_desk",
  "private_office",
  "team_office",
  "meeting_room",
  "workshop_space",
  "other",
];

function AdminSpaces() {
  const qc = useQueryClient();
  const { data: locations } = useQuery(locationsQuery);
  const { data: spaces, isLoading } = useQuery(spacesQuery());

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<SpaceType>("flex_desk");
  const [locationId, setLocationId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [sizeSqm, setSizeSqm] = useState("");
  const [hourly, setHourly] = useState("");
  const [daily, setDaily] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["spaces"] });

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const location = locationId || locations?.[0]?.id;
    if (!location) {
      toast.error("Create a location first.");
      return;
    }
    setSaving(true);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const { data: space, error } = await supabase
      .from("spaces")
      .insert({
        name,
        code: code.trim() || null,
        slug,
        space_type: type,
        location_id: location,
        capacity: capacity ? Number(capacity) : null,
        size_sqm: sizeSqm ? Number(sizeSqm) : null,
      })
      .select("id")
      .single();
    if (error || !space) {
      setSaving(false);
      toast.error(error?.message ?? "Could not create space.");
      return;
    }
    const rates = [
      hourly && { space_id: space.id, rate_type: "hourly" as const, price_cents: Math.round(Number(hourly) * 100) },
      daily && { space_id: space.id, rate_type: "daily" as const, price_cents: Math.round(Number(daily) * 100) },
    ].filter(Boolean) as { space_id: string; rate_type: "hourly" | "daily"; price_cents: number }[];
    if (rates.length) await supabase.from("pricing_rules").insert(rates);
    setSaving(false);
    toast.success("Space created.");
    setName("");
    setCode("");
    setCapacity("");
    setSizeSqm("");
    setHourly("");
    setDaily("");
    refresh();
  }

  async function saveCode(id: string, value: string) {
    const next = value.trim().toUpperCase() || null;
    const { error } = await supabase.from("spaces").update({ code: next }).eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  }

  async function setStatus(id: string, status: "active" | "inactive" | "maintenance") {
    const { error } = await supabase.from("spaces").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else refresh();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("spaces").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Space deleted.");
      refresh();
    }
  }

  return (
    <div>
      <p className="eyebrow">Spaces</p>
      <h1 className="display-md mt-3">Rooms and desks.</h1>

      <div className="mt-10 grid gap-16 lg:grid-cols-[1.5fr_1fr]">
        <div>
          {isLoading && <div className="h-24 animate-pulse bg-muted" />}
          {!isLoading && (spaces ?? []).length === 0 && (
            <EmptyState title="No spaces yet." description="Add the first space on the right." />
          )}
          <ul className="divide-y divide-border border-y border-border">
            {(spaces ?? []).map((s) => {
              const hourlyRate = s.pricing_rules?.find((r) => r.rate_type === "hourly");
              const dailyRate = s.pricing_rules?.find((r) => r.rate_type === "daily");
              return (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                  <div>
                    <input
                      defaultValue={(s as { code?: string | null }).code ?? ""}
                      placeholder="CODE"
                      aria-label={`Code for ${s.name}`}
                      onBlur={(e) => saveCode(s.id, e.target.value)}
                      className="mb-1 w-28 border-b border-border bg-transparent text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground outline-none focus:border-foreground"
                    />
                    <p className="font-display text-lg tracking-tight">{s.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {SPACE_TYPE_LABEL[s.space_type]} · {s.locations?.name}
                      {s.capacity ? ` · ${s.capacity} people` : ""}
                      {hourlyRate ? ` · ${formatPrice(hourlyRate.price_cents)}/h` : ""}
                      {dailyRate ? ` · ${formatPrice(dailyRate.price_cents)}/day` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border border-border bg-transparent px-2 py-1 text-xs"
                      value={s.status}
                      onChange={(e) => setStatus(s.id, e.target.value as "active")}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <form onSubmit={create} className="h-fit border border-border p-6">
          <p className="eyebrow">New space</p>
          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="eyebrow">Name</span>
              <input required className={FIELD} value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="block">
              <span className="eyebrow">Code (DESK.01)</span>
              <input
                className={FIELD}
                placeholder="DESK.01"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </label>
            <label className="block">
              <span className="eyebrow">Type</span>
              <select className={FIELD} value={type} onChange={(e) => setType(e.target.value as SpaceType)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {SPACE_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="eyebrow">Location</span>
              <select className={FIELD} value={locationId} onChange={(e) => setLocationId(e.target.value)}>
                {(locations ?? []).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow">Capacity</span>
                <input type="number" min={1} className={FIELD} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </label>
              <label className="block">
                <span className="eyebrow">Size m²</span>
                <input type="number" min={0} className={FIELD} value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="eyebrow">€ / hour</span>
                <input type="number" min={0} step="0.5" className={FIELD} value={hourly} onChange={(e) => setHourly(e.target.value)} />
              </label>
              <label className="block">
                <span className="eyebrow">€ / day</span>
                <input type="number" min={0} step="1" className={FIELD} value={daily} onChange={(e) => setDaily(e.target.value)} />
              </label>
            </div>
          </div>
          <Button type="submit" className="mt-8" disabled={saving}>
            Create space
          </Button>
        </form>
      </div>
    </div>
  );
}
