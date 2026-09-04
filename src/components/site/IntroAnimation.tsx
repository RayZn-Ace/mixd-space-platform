import { useEffect, useState } from "react";

const KEY = "mixd-intro-seen";
const WORDS = ["study.", "work.", "meet.", "create."];

/**
 * First-visit brand intro. Plays once per browser session, respects
 * prefers-reduced-motion and never blocks the page for more than ~3s.
 */
export function IntroAnimation() {
  const [phase, setPhase] = useState<"idle" | "playing" | "leaving" | "done">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      setPhase("done");
      return;
    }
    try {
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      /* private mode — intro simply replays */
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase("playing");
    document.body.style.overflow = "hidden";

    const leave = window.setTimeout(() => setPhase("leaving"), reduced ? 600 : 2900);
    const end = window.setTimeout(
      () => {
        setPhase("done");
        document.body.style.overflow = "";
      },
      reduced ? 1100 : 3800,
    );

    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(end);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "idle" || phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={
        "mixd-intro fixed inset-0 z-[100] flex items-center justify-center overflow-hidden " +
        (phase === "leaving" ? "mixd-intro--leaving" : "")
      }
    >
      <div className="mixd-intro-glow" />
      <div className="mixd-intro-grid" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="mixd-intro-logo font-display text-[clamp(2.5rem,11vw,7rem)] leading-none tracking-tight">
          {"MIXD".split("").map((c, i) => (
            <span key={i} className="mixd-intro-letter" style={{ animationDelay: `${i * 90}ms` }}>
              {c}
            </span>
          ))}
          <span className="mixd-intro-dot">.</span>
          <span className="mixd-intro-space">SPACE</span>
        </div>

        <div className="mixd-intro-rule" />

        <div className="mixd-intro-words mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-sans text-[clamp(0.8rem,3.4vw,1.15rem)] uppercase tracking-[0.35em]">
          {WORDS.map((w, i) => (
            <span
              key={w}
              className="mixd-intro-word"
              style={{ animationDelay: `${900 + i * 170}ms` }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      <div className="mixd-intro-curtain" />
    </div>
  );
}
