import { Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/site/Header";
import { XMark } from "@/components/site/XMark";


const COLUMNS: { title: string; links: { to: string; label: string }[] }[] = [
  {
    title: "Spaces",
    links: [
      { to: "/coworking", label: "Desks" },
      { to: "/private-offices", label: "Private Offices" },
      { to: "/meeting-rooms", label: "Meeting Rooms" },
      { to: "/team-offices", label: "Team Offices" },
    ],
  },
  {
    title: "Products",
    links: [
      { to: "/memberships", label: "Memberships" },
      { to: "/business-address", label: "Business Address" },
      { to: "/teams", label: "MIXD for Teams" },
      { to: "/spaces", label: "All spaces" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/locations", label: "Locations" },
      { to: "/contact", label: "Contact" },
      { to: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/legal/imprint", label: "Imprint" },
      { to: "/legal/privacy", label: "Privacy" },
      { to: "/legal/terms", label: "Booking conditions" },
      { to: "/register", label: "Create account" },
    ],
  },
];


export function Footer() {
  return (
    <footer className="mt-28 border-t border-border bg-surface">
      <div className="container-mixd grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(4,1fr)] lg:py-20">
        <div>
          <Wordmark className="h-12" />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            work. meet. create.
            <br />
            Different people. Different work. One space.
          </p>
          <address className="mt-8 text-sm not-italic text-muted-foreground">
            MIXD.SPACE Garbsen
            <br />
            Erlenweg 18
            <br />
            30827 Garbsen-Berenbostel
          </address>
          <Link
            to="/contact"
            className="link-underline mt-5 inline-flex items-center gap-2 text-sm text-foreground"
          >
            <XMark className="size-3 text-accent" /> Talk to us
          </Link>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="eyebrow">{col.title}</p>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.to + l.label}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-mixd flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} MIXD.SPACE</span>
        <span className="flex items-center gap-2">
          <XMark className="size-2.5 text-accent" />
          Pre-launch — spaces and rates shown are examples.
        </span>
        <span>Garbsen · Deutschland</span>
      </div>

    </footer>
  );
}
