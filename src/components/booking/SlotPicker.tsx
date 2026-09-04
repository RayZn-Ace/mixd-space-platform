import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dayAvailabilityQuery } from "@/lib/queries";

function toMinutes(hhmm: string) {
  const [h = "0", m = "0"] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

function toHHMM(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function SlotPicker({
  spaceId,
  locationId,
  date,
  start,
  end,
  onChange,
  stepMinutes = 60,
}: {
  spaceId: string;
  locationId: string;
  date: string;
  start: string;
  end: string;
  onChange: (next: { start: string; end: string }) => void;
  stepMinutes?: number;
}) {
  const { data, isLoading } = useQuery(dayAvailabilityQuery(spaceId, locationId, date));

  const slots = useMemo(() => {
    if (!data) return [];
    const open = toMinutes(data.opensAt);
    const close = toMinutes(data.closesAt);
    const out: { from: number; to: number; taken: boolean; past: boolean }[] = [];
    for (let t = open; t + stepMinutes <= close; t += stepMinutes) {
      const from = new Date(`${date}T${toHHMM(t)}`).getTime();
      const to = new Date(`${date}T${toHHMM(t + stepMinutes)}`).getTime();
      out.push({
        from: t,
        to: t + stepMinutes,
        taken: data.busy.some((b) => b.start < to && b.end > from),
        past: to <= Date.now(),
      });
    }
    return out;
  }, [data, date, stepMinutes]);

  const selStart = toMinutes(start);
  const selEnd = toMinutes(end);

  function pick(from: number, to: number) {
    if (from >= selStart && to <= selEnd && selEnd - selStart > stepMinutes) {
      onChange({ start: toHHMM(from), end: toHHMM(to) });
      return;
    }
    if (from > selStart && from < selEnd) {
      onChange({ start: start, end: toHHMM(to) });
      return;
    }
    if (from >= selEnd) {
      const blocked = slots.some((s) => s.from >= selStart && s.to <= to && s.taken);
      if (!blocked) {
        onChange({ start, end: toHHMM(to) });
        return;
      }
    }
    onChange({ start: toHHMM(from), end: toHHMM(to) });
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-11 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">No opening hours set for this day.</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((s) => {
          const selected = s.from >= selStart && s.to <= selEnd;
          const disabled = s.taken || s.past;
          return (
            <button
              key={s.from}
              type="button"
              disabled={disabled}
              onClick={() => pick(s.from, s.to)}
              className={
                "h-11 rounded-xl border text-sm transition-colors " +
                (disabled
                  ? "cursor-not-allowed border-border/60 bg-muted/50 text-muted-foreground line-through"
                  : selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:border-foreground")
              }
            >
              {toHHMM(s.from)}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Tap a start time, then tap a later time to extend. Greyed-out slots are already taken.
      </p>
    </div>
  );
}
