import { cn } from "@/lib/utils";

/**
 * The MIXD "X" — the recurring brand asset.
 * Used subtly: dividers, markers, list bullets, signage numbers.
 */
export function XMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-4", className)}
    >
      <path
        d="M4 4 L20 20 M20 4 L4 20"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** A quiet section divider with the X sitting on the line. */
export function XDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4", className)} aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      <XMark className="size-3 text-accent" />
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Space code badge — DESK.01, MEET.02 … editable per space in MIXD.OS. */
export function SpaceCode({ code, className }: { code?: string | null; className?: string }) {
  if (!code) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border border-border px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    >
      <XMark className="size-2.5 text-accent" />
      {code}
    </span>
  );
}
