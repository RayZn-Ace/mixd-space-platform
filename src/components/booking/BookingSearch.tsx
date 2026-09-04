import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { locationsQuery } from "@/lib/queries";
import { BOOKABLE_SPACE_TYPES, SPACE_TYPE_LABEL } from "@/lib/mixd";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const FIELD =
  "h-11 w-full border-0 border-b border-border bg-transparent px-0 text-sm text-foreground outline-none transition-colors focus:border-foreground";

const HERO_LABEL = "text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";
const HERO_INPUT =
  "w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60";

export function BookingSearch({
  className,
  compact,
  variant = "default",
}: {
  className?: string;
  compact?: boolean;
  variant?: "default" | "hero";
}) {
  const navigate = useNavigate();
  const { data: locations } = useQuery(locationsQuery);
  const singleLocation = (locations ?? []).length === 1 ? locations![0] : null;
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
        location: singleLocation?.slug ?? location ?? "",
        date,
        start,
        end,
        people,
        type: type || undefined,
      },
    });
  };


  if (variant === "hero") {
    return (
      <form
        onSubmit={submit}
        className={cn(
          "flex flex-col gap-1 overflow-hidden rounded-3xl bg-white p-2 shadow-2xl ring-8 ring-white/10 sm:flex-row sm:items-stretch",
          className,
        )}
      >
        <div className="flex flex-1 flex-col justify-center border-b border-border/40 px-5 py-3 sm:border-b-0 sm:border-r">
          <label className={HERO_LABEL}>Location</label>
          <select
            className={cn(HERO_INPUT, "appearance-none")}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="">Anywhere</option>
            {(locations ?? []).map((l) => (
              <option key={l.id} value={l.slug}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-1 flex-col justify-center border-b border-border/40 px-5 py-3 sm:border-b-0 sm:border-r">
          <label className={HERO_LABEL}>When</label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className={cn(HERO_INPUT, "min-w-0 flex-1")}
              value={date}
              min={today()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center border-b border-border/40 px-5 py-3 sm:border-b-0 sm:border-r">
          <label className={HERO_LABEL}>Time</label>
          <div className="flex items-center gap-1">
            <input
              type="time"
              className={cn(HERO_INPUT, "min-w-0 flex-1")}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="time"
              className={cn(HERO_INPUT, "min-w-0 flex-1")}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center border-b border-border/40 px-5 py-3 sm:border-b-0 sm:border-r">
          <label className={HERO_LABEL}>Space</label>
          <select className={cn(HERO_INPUT, "appearance-none")} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Any space</option>
            {BOOKABLE_SPACE_TYPES.map((t) => (
              <option key={t} value={t}>
                {SPACE_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          className="group shrink-0 rounded-2xl bg-accent px-7 py-6 text-base font-semibold text-accent-foreground hover:bg-accent/90 sm:py-0"
        >
          Find a spot
          <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>
    );
  }

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
          <option value="">Anywhere</option>
          {(locations ?? []).map((l) => (
            <option key={l.id} value={l.slug}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="eyebrow">Date</span>
        <input type="date" className={FIELD} value={date} min={today()} onChange={(e) => setDate(e.target.value)} />
      </label>

      <div className="grid grid-cols-2 gap-4 lg:contents">
        <label className="block">
          <span className="eyebrow">From</span>
          <input type="time" className={FIELD} value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="block">
          <span className="eyebrow">Until</span>
          <input type="time" className={FIELD} value={end} onChange={(e) => setEnd(e.target.value)} />
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
