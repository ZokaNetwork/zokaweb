import { Menu, X } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export type SectionKey = "about" | "tech" | "download" | "explorer" | "docs" | "github";

const links: { key: SectionKey; label: string }[] = [
  { key: "about", label: "About" },
  { key: "tech", label: "Tech" },
  { key: "download", label: "Download" },
  { key: "explorer", label: "Explorer" },
  { key: "docs", label: "Docs" },
  { key: "github", label: "GitHub" },
];

interface NavProps {
  active: SectionKey | null;
  onSelect: (key: SectionKey) => void;
  onHome: () => void;
}

const Nav = ({ active, onSelect, onHome }: NavProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleHome = () => {
    onHome();
    setMobileOpen(false);
  };

  const handleSelect = (key: SectionKey) => {
    onSelect(key);
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/30">
      <nav className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
        <button
          onClick={handleHome}
          className="font-mono text-sm tracking-[0.3em] text-foreground hover:opacity-70 transition-opacity"
          aria-label="ZOKA home"
        >
          ZOKA
        </button>

        <div className="hidden md:flex items-center gap-6 lg:gap-10 font-mono text-[11px] tracking-[0.25em] uppercase">
          {links.map((l) => (
            <button
              key={l.key}
              onClick={() => handleSelect(l.key)}
              className={`transition-colors duration-500 ${
                active === l.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </button>
          ))}
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground shadow-sm transition-colors hover:bg-background"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-navigation"
        className={`md:hidden overflow-hidden border-t border-border/40 bg-background/95 shadow-lg transition-[max-height,opacity] duration-300 ease-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col px-6 py-4 font-mono text-xs uppercase tracking-[0.22em]">
          {links.map((l) => (
            <button
              key={l.key}
              onClick={() => handleSelect(l.key)}
              className={`flex min-h-12 items-center justify-between border-b border-border/30 text-left transition-colors duration-300 last:border-b-0 ${
                active === l.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{l.label}</span>
              {active === l.key && <span className="h-1.5 w-1.5 rounded-full bg-foreground" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Nav;
