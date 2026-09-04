import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { SiteShell } from "@/components/site/SiteShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — MY MIXD." },
      {
        name: "description",
        content: "Create a MIXD.SPACE account to book desks, offices and meeting rooms.",
      },
      { property: "og:title", content: "Create your account — MY MIXD." },
      { property: "og:description", content: "Book workspace at MIXD.SPACE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegisterPage,
});

const FIELD =
  "h-11 w-full border-0 border-b border-border bg-transparent px-0 text-base outline-none focus:border-foreground";

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created.");
    navigate({ to: "/account" });
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
    navigate({ to: "/account" });
  }

  return (
    <SiteShell>
      <section className="container-mixd flex justify-center py-20 lg:py-28">
        <div className="w-full max-w-md">
          <p className="eyebrow">MY MIXD.</p>
          <h1 className="display-md mt-4">Create your account.</h1>

          <form onSubmit={submit} className="mt-10 space-y-6">
            <label className="block">
              <span className="eyebrow">Name</span>
              <input
                required
                className={FIELD}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
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
                minLength={8}
                className={FIELD}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <Button type="submit" className="w-full" disabled={loading}>
              Create account
            </Button>
          </form>

          <div className="my-8 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google}>
            Continue with Google
          </Button>

          <p className="mt-10 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="link-underline text-foreground">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
