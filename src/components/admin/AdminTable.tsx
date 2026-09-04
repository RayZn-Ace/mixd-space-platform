import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminHeader({
  eyebrow,
  title,
  intro,
  search,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  children?: ReactNode;
}) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="display-md mt-3">{title}</h1>
      {intro && <p className="mt-4 max-w-xl text-sm text-muted-foreground">{intro}</p>}
      {(search || children) && (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-y border-border py-4">
          {search && (
            <input
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? "Search"}
              className="h-9 w-full max-w-xs rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-foreground"
            />
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export function AdminTable({
  head,
  rows,
  className,
}: {
  head: string[];
  rows: { key: string; cells: ReactNode[] }[];
  className?: string;
}) {
  return (
    <div className={cn("no-scrollbar w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {head.map((h) => (
              <th
                key={h}
                className="py-3 pr-6 text-left text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-border/70 transition-colors hover:bg-surface">
              {r.cells.map((c, i) => (
                <td key={i} className="py-4 pr-6 align-middle">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TONE: Record<string, string> = {
  active: "bg-foreground text-background",
  paid: "bg-foreground text-background",
  confirmed: "bg-foreground text-background",
  pending: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground line-through",
  inactive: "bg-muted text-muted-foreground",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.12em]",
        TONE[value] ?? "bg-surface text-foreground",
      )}
    >
      {value.replace(/_/g, " ")}
    </span>
  );
}
