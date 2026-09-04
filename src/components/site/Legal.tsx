import type { ReactNode } from "react";
import { XMark } from "@/components/site/XMark";

export function LegalNote() {
  return (
    <p className="flex items-start gap-3 border border-border bg-surface p-5 text-sm text-muted-foreground">
      <XMark className="mt-0.5 size-3 shrink-0 text-accent" />
      Final legal copy will be added before launch. The text below is a working placeholder and is
      not legal advice.
    </p>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="eyebrow">{title}</h2>
      <div className="mt-4 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
