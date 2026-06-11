import { useState, useEffect } from "react";
import QuantumField from "./QuantumField";

// ─────────────────────────────────────────────────────────────────────────────
//  Countdown — remove this component and its usage after 2026-06-30.
// ─────────────────────────────────────────────────────────────────────────────
const LAUNCH = new Date("2026-06-30T00:00:00-05:00");

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days:    Math.floor(diff / 86_400_000),
      hours:   Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000)  / 60_000),
      seconds: Math.floor((diff % 60_000)     / 1_000),
      done: diff === 0,
    };
  };
  const [remaining, setRemaining] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setRemaining(calc()), 1_000);
    return () => clearInterval(t);
  }, []);
  return remaining;
}

const LaunchCountdown = () => {
  const cd = useCountdown(LAUNCH);
  if (cd.done) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="mt-7">
      <div className="font-mono text-[9px] tracking-[0.38em] uppercase text-muted-foreground mb-2">
        Mainnet Zenith — launch in
      </div>
      <div className="font-mono text-2xl md:text-3xl font-extralight text-foreground tracking-[0.12em] tabular-nums">
        {pad(cd.days)}
        <span className="text-muted-foreground text-lg mx-0.5">d</span>
        {" "}{pad(cd.hours)}
        <span className="text-muted-foreground text-lg mx-0.5">h</span>
        {" "}{pad(cd.minutes)}
        <span className="text-muted-foreground text-lg mx-0.5">m</span>
        {" "}{pad(cd.seconds)}
        <span className="text-muted-foreground text-lg mx-0.5">s</span>
      </div>
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground/60 mt-2">
        30 Jun 2026
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

interface HeroProps {
  onCta: () => void;
}

const Hero = ({ onCta }: HeroProps) => (
  <section className="relative h-screen flex flex-col justify-center overflow-hidden">
    {/* monochrome quantum animation */}
    <QuantumField />

    {/* subtle grid — kept very faint so the privacy field stays dominant */}
    <div className="absolute inset-0 grid-bg opacity-20" />

    {/* readability scrim behind the headline */}
    <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent pointer-events-none" />

    {/* Top-left headline cluster — leaves the central nodes visible */}
    <div className="absolute top-24 md:top-28 left-6 md:left-10 z-10 max-w-md animate-fade-in">
      <h1 className="text-[clamp(1.5rem,3.2vw,2.75rem)] font-extralight leading-[1.05] tracking-[-0.03em]">
        <span className="zk-melt inline-block">ZOKA Network</span>
        <br />
        <span className="zk-melt inline-block text-gradient font-light mt-2 text-[clamp(1rem,2vw,1.6rem)] tracking-[0.1em] uppercase font-mono" style={{ animationDelay: "1.5s" }}>
          Mainnet Zenith
        </span>
      </h1>
      <LaunchCountdown />
    </div>

    {/* Bottom-left CTA — drives users to the downloads section */}
    <div className="absolute bottom-16 md:bottom-20 left-6 md:left-10 z-10 animate-fade-in">
      <button
        onClick={onCta}
        className="group inline-flex items-center gap-3 px-6 py-3 border border-foreground/80 hover:bg-foreground hover:text-background transition-colors font-mono text-[10px] tracking-[0.3em] uppercase text-foreground"
        aria-label="Download ZOKA wallets"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
        Mainnet Zenith · Downloads
        <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  </section>
);
export default Hero;
