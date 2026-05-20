import { useState } from "react";
import Nav, { type SectionKey } from "@/components/zoka/Nav";
import Hero from "@/components/zoka/Hero";
import SectionOverlay from "@/components/zoka/SectionOverlay";

const Index = () => {
  const [active, setActive] = useState<SectionKey | null>(null);

  return (
    <main className="relative h-screen overflow-hidden bg-background">
      <Nav active={active} onSelect={setActive} onHome={() => setActive(null)} />
      <Hero onCta={() => setActive("download")} />
      <SectionOverlay active={active} onClose={() => setActive(null)} />
    </main>
  );
};

export default Index;
