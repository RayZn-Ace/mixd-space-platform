import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ next: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — MY MIXD." },
      { name: "description", content: "Sign in to MY MIXD. to manage bookings, access and invoices." },
      { property: "og:title", content: "Sign in — MY MIXD." },
      { property: "og:description", content: "Manage your MIXD.SPACE bookings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

const FIELD =
  "h-11 w-full border-0 border-b border-border bg-transparent px-0 text-base outline-none focus:border-foreground";

function LoginPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const target = next && next.startsWith("/") ? next : "/account";

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: target });
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in isn't available right now.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: target });
  }

  return (
    <SiteShell>
      <section className="container-mixd flex justify-center py-20 lg:py-28">
        <div className="w-full max-w-md">
          <p className="eyebrow">MY MIXD.</p>
          <h1 className="display-md mt-4">Welcome back.</h1>

          <form onSubmit={signIn} className="mt-10 space-y-6">
            <label className="block">
              <span className="eyebrow">Email</span>
              <input
                type="email"
                required
                className={FIELD}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="eyebrow">Password</span>
              <input
                type="password"
                required
                className={FIELD}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Button type="submit" className="w-full" disabled={loading}>
              Sign in
            </Button>
          </form>

          <div className="my-8 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>

          <p className="mt-10 text-sm text-muted-foreground">
            No account yet?{" "}
            <Link to="/register" className="link-underline text-foreground">
              Create one
            </Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
