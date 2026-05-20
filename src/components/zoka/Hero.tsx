import QuantumField from "./QuantumField";

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
        <span className="zk-melt inline-block">A network without witnesses.</span>
        <br />
        <span className="zk-melt inline-block text-gradient font-light mt-2 text-[clamp(1rem,2vw,1.6rem)] tracking-[0.1em] uppercase font-mono" style={{ animationDelay: "1.5s" }}>
          Zero-Knowledge Proofs
        </span>
      </h1>
    </div>

    {/* Bottom-left CTA — drives users to the downloads section */}
    <div className="absolute bottom-16 md:bottom-20 left-6 md:left-10 z-10 animate-fade-in">
      <button
        onClick={onCta}
        className="group inline-flex items-center gap-3 px-6 py-3 border border-foreground/80 hover:bg-foreground hover:text-background transition-colors font-mono text-[10px] tracking-[0.3em] uppercase text-foreground"
        aria-label="Download ZSilent wallet"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
        Mainnet · Get ZSilent
        <span className="opacity-70 group-hover:translate-x-1 transition-transform">→</span>
      </button>
    </div>
  </section>
);
export default Hero;
