import type { ReactNode } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileTabBar } from "@/components/site/MobileTabBar";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}


export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="container-mixd pt-16 pb-10 lg:pt-24 lg:pb-14">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="display-lg mt-5 max-w-4xl">{title}</h1>
      {intro && <p className="mt-6 max-w-xl text-lg text-muted-foreground">{intro}</p>}
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border px-6 py-20 text-center">
      <p className="font-display text-xl tracking-tight">{title}</p>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
