import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { locationsQuery } from "@/lib/queries";
import { BOOKABLE_SPACE_TYPES, SPACE_TYPE_LABEL } from "@/lib/mixd";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const FIELD =
  "h-11 w-full border-0 border-b border-border bg-transparent px-0 text-sm text-foreground outline-none transition-colors focus:border-foreground";

export function BookingSearch({ className, compact }: { className?: string; compact?: boolean }) {
  const navigate = useNavigate();
  const { data: locations } = useQuery(locationsQuery);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(today());
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [people, setPeople] = useState(1);
  const [type, setType] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/spaces",
      search: {
        location: location || (locations?.[0]?.slug ?? ""),
        date,
        start,
        end,
        people,
        type: type || undefined,
      },
    });
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "grid gap-x-8 gap-y-5 border border-border bg-card p-6 sm:grid-cols-2 lg:grid-cols-6 lg:items-end lg:gap-x-6",
        compact && "p-5",
        className,
      )}
    >
      <label className="block">
        <span className="eyebrow">Location</span>
        <select className={FIELD} value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">All locations</option>
          {(locations ?? []).map((l) => (
            <option key={l.id} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="eyebrow">Date</span>
        <input
          type="date"
          className={FIELD}
          value={date}
          min={today()}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-4 lg:contents">
        <label className="block">
          <span className="eyebrow">From</span>
          <input
            type="time"
            className={FIELD}
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Until</span>
          <input
            type="time"
            className={FIELD}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:contents">
        <label className="block">
          <span className="eyebrow">People</span>
          <input
            type="number"
            min={1}
            max={50}
            className={FIELD}
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="eyebrow">Space</span>
          <select className={FIELD} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Any</option>
            {BOOKABLE_SPACE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SPACE_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full sm:col-span-2 lg:col-span-6 lg:mt-4">
        Find a space
      </Button>
    </form>
  );
}
