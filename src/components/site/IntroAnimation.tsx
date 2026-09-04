import { useEffect, useState } from "react";
import logoLight from "@/assets/mixd-logo-light.png.asset.json";

const KEY = "mixd-intro-seen";
const WORDS = ["study.", "work.", "meet.", "create."];

/**
 * First-visit brand intro built around the MIXD.SPACE logo.
 * Plays once per browser session, respects prefers-reduced-motion.
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

    const leave = window.setTimeout(() => setPhase("leaving"), reduced ? 500 : 2900);
    const end = window.setTimeout(
      () => {
        setPhase("done");
        document.body.style.overflow = "";
      },
      reduced ? 900 : 3800,
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

      <div className="mixd-intro-stage relative flex flex-col items-center px-6 text-center">
        <div className="relative overflow-hidden">
          <img src={logoLight.url} alt="" className="mixd-intro-mark" />
          <div className="mixd-intro-beam" />
        </div>

        <div className="mixd-intro-rule" />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-sans text-[clamp(0.7rem,3vw,0.95rem)] uppercase tracking-[0.4em]">
          {WORDS.map((w, i) => (
            <span
              key={w}
              className="mixd-intro-word"
              style={{ animationDelay: `${1500 + i * 150}ms` }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
