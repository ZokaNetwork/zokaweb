import { useEffect, useState } from "react";
import {
  X, Monitor, Github, FileText, BookOpen, Plus, Minus, Terminal,
  Download, Cpu, Server, Boxes, Lock, Eye, EyeOff, ScanLine,
} from "lucide-react";
import type { SectionKey } from "./Nav";

// ─────────────────────────────────────────────────────────────────────────────
//  Constants — update these in one place when releases / URLs change.
// ─────────────────────────────────────────────────────────────────────────────
const REPO_BASE = "https://github.com/ZokaNetwork";
const NETWORK_REPO = `${REPO_BASE}/ZokaNetwork`;
const WALLET_REPO = `${REPO_BASE}/zsilent-core`;
const EXPLORER_REPO = `${REPO_BASE}/zokaexplorer`;
const WEB_REPO = `${REPO_BASE}/zokaweb`;
const WALLET_RELEASES = `${WALLET_REPO}/releases/latest`;
const EXPLORER_URL = "https://explorer.zoka.network"; // ← update with the deployed URL when ready

// ─────────────────────────────────────────────────────────────────────────────
//  Tech section — 6 consolidated blocks + comparison + roadmap + honest limits
// ─────────────────────────────────────────────────────────────────────────────
interface TechBlock {
  id: string;
  title: string;
  content: React.ReactNode;
}

const techBlocks: TechBlock[] = [
  {
    id: "01",
    title: "Cryptography stack",
    content: (
      <div className="space-y-0">
        {[
          { id: "i", name: "Groth16 zk-SNARKs · BLS12-381", desc: "Prove transaction validity without revealing inputs, outputs or witness. Verification keys ship with every node (trusted-setup/) and a DIGEST file lets you reproduce the CRS." },
          { id: "ii", name: "Pedersen commitments", desc: "Hide transacted amounts behind commitments that add up homomorphically — the network can check inputs equal outputs without ever seeing a number." },
          { id: "iii", name: "Bulletproof range proofs", desc: "Stop overflow-based inflation while keeping amounts encrypted. Roughly 600 B per proof." },
          { id: "iv", name: "CLSAG ring signatures", desc: "Monero-style ring signature hides the spender among a ring of plausible candidates. Single-key signing, no extra trust assumption." },
          { id: "v", name: "Stealth addresses", desc: "Separate scan and spend keys mean every outgoing payment lands on a one-time address. The same recipient never receives twice on the same on-chain identifier." },
          { id: "vi", name: "Nullifiers", desc: "A deterministic, single-use tag prevents double-spend without linking it to any specific output. Spent notes leave nullifiers, not addresses." },
        ].map((l) => (
          <div key={l.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border last:border-0">
            <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">{l.id}</div>
            <div className="col-span-10 md:col-span-4 text-base font-light">{l.name}</div>
            <div className="col-span-12 md:col-span-7 text-sm text-muted-foreground font-light">{l.desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "02",
    title: "Consensus & mining",
    content: (
      <div className="space-y-0">
        {[
          { id: "i", name: "RandomX-compatible PoW", desc: "ZOKA's PoW backend (`zoka-randomx-v1`) is built around RandomX semantics: random program execution that favors general-purpose CPUs over ASICs and GPUs." },
          { id: "ii", name: "Key-rotating epochs", desc: "Mining keys rotate every 2,048 blocks (~2.8 days at 120 s blocks). Each epoch resets the RandomX cache and keeps the network friendly to fresh participants." },
          { id: "iii", name: "120 s block time · 60-block coinbase maturity", desc: "Probabilistic finality. A block is irreversible in practice after a handful of confirmations; deep-finality applications should wait for 12+ confirmations." },
          { id: "iv", name: "Private coinbase", desc: "Miner rewards are emitted as private outputs. The block tells the world that someone mined; the chain never tells anyone how much they earned or which address received it." },
          { id: "v", name: "No premine, no foundation cut", desc: "The genesis block is empty (`genesis_supply_zka: 0`). Every ZKA in circulation has been produced by a public block reward." },
        ].map((l) => (
          <div key={l.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border last:border-0">
            <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">{l.id}</div>
            <div className="col-span-10 md:col-span-4 text-base font-light">{l.name}</div>
            <div className="col-span-12 md:col-span-7 text-sm text-muted-foreground font-light">{l.desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "03",
    title: "What is hidden, what is not",
    content: (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <EyeOff className="w-4 h-4 text-foreground/80" />
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-foreground">Hidden</span>
          </div>
          <ul className="space-y-2 text-sm font-light text-muted-foreground">
            <li>· Sender (ring signature)</li>
            <li>· Receiver (stealth address)</li>
            <li>· Amount (Pedersen commitment)</li>
            <li>· Fee (also under Pedersen)</li>
            <li>· Coinbase reward value</li>
            <li>· Link between inputs and outputs</li>
          </ul>
        </div>
        <div className="p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-foreground/80" />
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-foreground">Public</span>
          </div>
          <ul className="space-y-2 text-sm font-light text-muted-foreground">
            <li>· Block height & timestamp</li>
            <li>· Transaction hash</li>
            <li>· Existence (a tx happened)</li>
            <li>· Nullifiers (anti-double-spend tags)</li>
            <li>· Network state root</li>
            <li>· PoW difficulty & block size</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "04",
    title: "Token economics — ZKA",
    content: (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[11px] mb-6">
          {[
            ["Symbol", "ZKA"],
            ["Decimals", "6"],
            ["Max supply", "23,000,000"],
            ["Initial reward", "12 ZKA"],
            ["Halving", "1,051,200 blocks (~4 y)"],
            ["Block time", "120 s"],
            ["Coinbase maturity", "60 blocks"],
            ["Tail emission", "None"],
          ].map(([k, v]) => (
            <div key={k} className="border border-border p-3">
              <div className="text-muted-foreground tracking-[0.2em] uppercase text-[9px]">{k}</div>
              <div className="text-foreground mt-1">{v}</div>
            </div>
          ))}
        </div>
        <div className="space-y-0">
          {[
            { id: "E0", name: "Era 0 · 12 ZKA", desc: "Blocks 0 → 1,051,200 · cumulative 12.6 M ZKA" },
            { id: "E1", name: "Era 1 · 6 ZKA", desc: "Blocks → 2,102,400 · cumulative 18.9 M ZKA" },
            { id: "E2", name: "Era 2 · 3 ZKA", desc: "Blocks → 3,153,600 · cumulative 22.0 M ZKA" },
            { id: "E3", name: "Era 3 · 1 ZKA", desc: "Integer shift exhausts; emission stops at the 23 M cap." },
          ].map((l) => (
            <div key={l.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border last:border-0">
              <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">{l.id}</div>
              <div className="col-span-10 md:col-span-4 text-base font-light">{l.name}</div>
              <div className="col-span-12 md:col-span-7 text-sm text-muted-foreground font-light">{l.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/80 mt-6 font-light">
          Verifiable in <code className="font-mono text-foreground/90">src/economics.rs</code>
          {" "}and{" "}<code className="font-mono text-foreground/90">docs/economics.testnet.v1.json</code>.
          1 ZKA = 1,000,000 atoms (the chain's smallest accounting unit).
        </p>
      </div>
    ),
  },
  {
    id: "05",
    title: "Fees & MEV protection",
    content: (
      <div className="space-y-0">
        {[
          { id: "i", name: "Encrypted fees", desc: "Fees are Pedersen-committed like any other amount. The protocol enforces a node-configurable floor; wallets can hint low / normal / high." },
          { id: "ii", name: "No address leaks at the mempool", desc: "Stealth addresses and ring signatures make the mempool look like a stream of opaque commitments. There is nothing to sandwich." },
          { id: "iii", name: "MEV-resistant by construction", desc: "Hidden amounts and one-time recipients structurally remove the inputs that front-running, sandwich and back-running attacks need." },
          { id: "iv", name: "No protocol-level taxes", desc: "There is no on-chain whitelist, blacklist, or skim on holding / sending / receiving." },
        ].map((l) => (
          <div key={l.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border last:border-0">
            <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">{l.id}</div>
            <div className="col-span-10 md:col-span-4 text-base font-light">{l.name}</div>
            <div className="col-span-12 md:col-span-7 text-sm text-muted-foreground font-light">{l.desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "06",
    title: "Network & nodes",
    content: (
      <div className="space-y-0">
        {[
          { id: "i", name: "libp2p transport", desc: "Nodes speak the protocol over standard libp2p TCP. Gossipsub propagates blocks and transactions; identify+ping handle peer health." },
          { id: "ii", name: "Public bootstrap on fly.io", desc: "A read-only mainnet seed node runs at zoka-bootstrap-zokachain.fly.dev. The signed network manifest (docs/mainnet-network.v1.json) is shipped in every release." },
          { id: "iii", name: "Two binaries", desc: "`zoka` is the CLI for wallet ops; `zokahd` is the full-node daemon. Both ship cross-platform; ZSilent Core bundles them and supervises the node from a desktop UI." },
          { id: "iv", name: "Embedded trusted setup", desc: "Groth16 proving/verifying parameters live under trusted-setup/. A DIGEST file lets every operator verify the CRS hash matches the network's expected value." },
          { id: "v", name: "Anonymous transport (planned)", desc: "Tor / I2P + Dandelion++ are on the roadmap for IP-layer privacy. The mainnet manifest already declares the policy so wallets can negotiate it once shipped." },
        ].map((l) => (
          <div key={l.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border last:border-0">
            <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">{l.id}</div>
            <div className="col-span-10 md:col-span-4 text-base font-light">{l.name}</div>
            <div className="col-span-12 md:col-span-7 text-sm text-muted-foreground font-light">{l.desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "07",
    title: "Comparison with other chains",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-left font-light text-sm border border-border">
          <thead className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-3">Feature</th>
              <th className="p-3 text-foreground">ZOKA</th>
              <th className="p-3">BTC</th>
              <th className="p-3">ETH</th>
              <th className="p-3">XMR</th>
              <th className="p-3">ZEC</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              ["Privacy by default", "✓", "—", "—", "✓", "opt"],
              ["Sender hidden", "✓", "—", "—", "✓", "✓"],
              ["Receiver hidden", "✓", "—", "—", "✓", "✓"],
              ["Amount hidden", "✓", "—", "—", "✓", "✓"],
              ["Fee hidden", "✓", "—", "—", "—", "part."],
              ["Block time", "120 s", "~600 s", "~12 s", "~120 s", "~75 s"],
              ["ASIC-resistant", "✓", "—", "n/a", "✓", "—"],
              ["No premine", "✓", "✓", "—", "✓", "—"],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-border last:border-0">
                <td className="p-3 text-foreground/90">{row[0]}</td>
                <td className="p-3 text-foreground">{row[1]}</td>
                <td className="p-3">{row[2]}</td>
                <td className="p-3">{row[3]}</td>
                <td className="p-3">{row[4]}</td>
                <td className="p-3">{row[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground/70 mt-3 font-light italic">
          Finality is probabilistic on every PoW chain in this table, including ZOKA.
          Wait for several confirmations for high-value settlement.
        </p>
      </div>
    ),
  },
  {
    id: "08",
    title: "Roadmap",
    content: (
      <div className="space-y-0">
        {[
          { id: "i", name: "Internal devnet", desc: "ZK circuits · single-operator setup · local validators · CLI.", status: "Done" },
          { id: "ii", name: "Public testnet", desc: "MPC ceremony · CRS digest shipped · permissionless mining.", status: "Done" },
          { id: "iii", name: "Mainnet v0.1.0", desc: "Public fly.io bootstrap · mainnet manifest signed · ZSilent Core desktop wallet released.", status: "Live" },
          { id: "iv", name: "Mobile wallets", desc: "Native Android + iOS clients. No ETA — desktop comes first.", status: "Not started" },
          { id: "v", name: "Anonymous transport", desc: "Tor / I2P + Dandelion++ on the node, end-to-end IP privacy from wallet to peer.", status: "Planned" },
          { id: "vi", name: "Post-quantum migration", desc: "Today's Groth16 is not PQ-safe. Future ceremony with PQ-friendly primitives.", status: "Research" },
        ].map((l) => (
          <div key={l.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border last:border-0">
            <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">{l.id}</div>
            <div className="col-span-10 md:col-span-4 text-base font-light">{l.name}</div>
            <div className="col-span-12 md:col-span-5 text-sm text-muted-foreground font-light">{l.desc}</div>
            <div className="col-span-12 md:col-span-2 font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/80 md:text-right">
              {l.status}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "09",
    title: "Honest limits",
    content: (
      <ul className="space-y-3 text-sm font-light text-muted-foreground">
        {[
          "A global passive adversary watching both ends of a link can correlate burst timing — Tor/I2P will mitigate, not eliminate.",
          "Groth16 over BLS12-381 is not post-quantum. Past privacy survives a future quantum break; new transactions after that break would not.",
          "A compromised spending key has no recovery backdoor. Custody is yours, with everything that implies.",
          "Reusing zpriv addresses across distinct off-chain identities can leak associations between them.",
          "The network never provides involuntary unmasking — only the user holding the key can reveal a transaction.",
          "Block time is 120 s. Don't treat the first confirmation as final; wait several blocks for irreversibility.",
        ].map((x) => (
          <li key={x} className="flex gap-3 border-b border-border pb-3 last:border-0">
            <span className="font-mono text-xs text-muted-foreground/70 mt-1">!</span>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    ),
  },
];

const TechAccordion = () => {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-12">
      <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
        ZOKA is a Rust blockchain where every value-bearing transaction is, by construction,
        opaque to any observer other than the sender and the recipient. The technical surface
        below is shipped — not promised. Each claim maps to code you can read.
      </p>
      <div className="border-t border-border">
        {techBlocks.map((ch) => {
          const isOpen = open === ch.id;
          return (
            <div
              key={ch.id}
              className="border-b border-border scroll-mt-24"
              ref={(el) => {
                if (el && isOpen) {
                  requestAnimationFrame(() => {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : ch.id)}
                className="w-full grid grid-cols-12 gap-4 py-6 text-left group items-center"
                aria-expanded={isOpen}
              >
                <div className="col-span-2 md:col-span-1 font-mono text-xs text-muted-foreground">
                  {ch.id}
                </div>
                <div className="col-span-9 md:col-span-10 text-lg md:text-xl font-extralight tracking-[-0.01em] text-foreground group-hover:text-foreground transition-colors">
                  {ch.title}
                </div>
                <div className="col-span-1 flex justify-end text-muted-foreground group-hover:text-foreground transition-colors">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              {isOpen && (
                <div className="pb-8 pl-0 md:pl-[8.333%] animate-fade-in">
                  {ch.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Download section — 3 real desktop builds + CLI tutorial
// ─────────────────────────────────────────────────────────────────────────────
const cliSteps: { id: string; icon: React.ComponentType<{ className?: string }>; title: string; body: React.ReactNode }[] = [
  {
    id: "01",
    icon: Download,
    title: "Get the code",
    body: (
      <div className="space-y-4">
        <p>
          The whole node lives on GitHub. Clone it and you have everything: the daemon,
          the wallet CLI, the Groth16 trusted setup and the mainnet manifest.
        </p>
        <a
          href={NETWORK_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-5 py-3 border border-border hover:border-foreground transition-colors font-mono text-[11px] tracking-[0.25em] uppercase text-foreground"
        >
          <Github className="w-4 h-4" />
          ZokaNetwork/ZokaNetwork
          <span className="opacity-60">↗</span>
        </a>
        <div className="font-mono text-xs bg-foreground/[0.03] border border-border p-4 text-foreground/90 overflow-x-auto">
          <div>git clone https://github.com/ZokaNetwork/ZokaNetwork.git</div>
          <div>cd ZokaNetwork</div>
        </div>
      </div>
    ),
  },
  {
    id: "02",
    icon: Cpu,
    title: "Install Rust",
    body: (
      <div className="space-y-4">
        <p>
          ZOKA is written in Rust. Install the toolchain once — it's official and free.
        </p>
        <div className="font-mono text-xs bg-foreground/[0.03] border border-border p-4 text-foreground/90 overflow-x-auto">
          <div className="text-muted-foreground"># macOS / Linux:</div>
          <div>curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh</div>
          <div className="text-muted-foreground mt-3"># Windows: download installer from rustup.rs</div>
          <div className="text-muted-foreground mt-3"># Verify:</div>
          <div>rustc --version</div>
        </div>
      </div>
    ),
  },
  {
    id: "03",
    icon: Server,
    title: "Build & run the node",
    body: (
      <div className="space-y-4">
        <p>
          Build with the <code className="font-mono text-foreground">randomx</code> feature
          (default on mainnet). The first build takes 5–15 minutes; after that it caches.
        </p>
        <div className="font-mono text-xs bg-foreground/[0.03] border border-border p-4 text-foreground/90 overflow-x-auto">
          <div>cargo build --release --features randomx --bin zoka --bin zokahd</div>
          <div className="text-muted-foreground mt-3"># Run a full node on mainnet:</div>
          <div>./target/release/zoka fullnode --network mainnet --password "&lt;node-pass&gt;"</div>
        </div>
      </div>
    ),
  },
  {
    id: "04",
    icon: Terminal,
    title: "Create a private wallet",
    body: (
      <div className="space-y-4">
        <p>
          Generate a shielded wallet. <span className="text-foreground">Save the seed phrase
          offline.</span> There is no recovery path — by design.
        </p>
        <div className="font-mono text-xs bg-foreground/[0.03] border border-border p-4 text-foreground/90 overflow-x-auto">
          <div>./target/release/zoka create my-wallet --network mainnet --password "&lt;wallet-pass&gt;"</div>
          <div className="text-muted-foreground mt-3"># Show your shielded address (starts with zka1...):</div>
          <div>./target/release/zoka wallets --network mainnet</div>
        </div>
      </div>
    ),
  },
  {
    id: "05",
    icon: Cpu,
    title: "Mine (optional)",
    body: (
      <div className="space-y-4">
        <p>
          Point the daemon at your wallet address. ZOKA is CPU-friendly; a normal laptop
          is enough to participate.
        </p>
        <div className="font-mono text-xs bg-foreground/[0.03] border border-border p-4 text-foreground/90 overflow-x-auto">
          <div>./target/release/zoka fullnode --network mainnet \</div>
          <div>&nbsp;&nbsp;--address zka1yourshieldedaddress... \</div>
          <div>&nbsp;&nbsp;--threads 4</div>
        </div>
        <p className="text-sm">
          Lower <span className="font-mono text-foreground">--threads</span> if the machine
          runs hot. Stop with <span className="font-mono text-foreground">Ctrl + C</span>.
        </p>
      </div>
    ),
  },
  {
    id: "06",
    icon: Terminal,
    title: "Stuck? Read the README",
    body: (
      <div className="space-y-4">
        <p>
          Every command and edge case lives in the repo's README and{" "}
          <span className="font-mono text-foreground">docs/</span> folder.
          Match errors against troubleshooting first.
        </p>
        <a
          href={`${NETWORK_REPO}#readme`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-5 py-3 border border-border hover:border-foreground transition-colors font-mono text-[11px] tracking-[0.25em] uppercase text-foreground"
        >
          Open the README
          <span className="opacity-60">↗</span>
        </a>
      </div>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Overlay frame
// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  active: SectionKey | null;
  onClose: () => void;
}

const content: Record<SectionKey, { eyebrow: string; title: React.ReactNode; body: React.ReactNode }> = {
  about: {
    eyebrow: "I. ABOUT · A MANIFESTO",
    title: (
      <>
        Privacy is not a feature.<br />
        <span className="text-muted-foreground">It is the precondition of freedom.</span>
      </>
    ),
    body: (
      <div className="space-y-12">
        {/* Author signature */}
        <div className="flex items-center gap-4 pb-6 border-b border-border">
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center font-mono text-[11px] tracking-[0.15em] text-foreground">
            NZ
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-foreground">
              Written by Natosh Zoka
            </span>
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              core dev @ ZokaNetwork
            </span>
          </div>
        </div>

        {/* Opening */}
        <div className="space-y-6">
          <p className="text-lg md:text-xl font-extralight leading-relaxed text-foreground">
            I did not build ZOKA to launch a token. I built it because I believe the right to
            transact in private is the last frontier of individual freedom — and that frontier
            is being eroded, block by block, ledger by ledger, in front of our eyes.
          </p>
          <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
            What follows is not a pitch. It is a position. If you disagree with it, ZOKA is
            probably not for you. If you read it and feel something settle into place, then
            welcome — you are already part of this.
          </p>
        </div>

        {/* Manifesto chapters */}
        <div className="space-y-0 border-t border-border">
          {[
            {
              id: "01",
              title: "Privacy is the default state of being human",
              body: (
                <>
                  Before currency, before contracts, before institutions — humans whispered.
                  We chose, in private, who to trust with our intentions. Privacy is not a
                  modern legal construct invented by lawyers; it is the default operating
                  mode of every honest social interaction. Anything that turns it into an
                  exception is the anomaly, not the other way around.
                </>
              ),
            },
            {
              id: "02",
              title: "A transparent ledger is a surveillance ledger",
              body: (
                <>
                  Bitcoin was a beautiful idea — but a fully transparent chain is, in
                  practice, a permanent surveillance database that anyone, including states
                  and corporations, can mine forever. Every coffee, every salary, every
                  donation — visible, correlatable, immutable. <span className="text-foreground">"Pseudonymous"</span> is
                  not privacy. It is a thin curtain in a room full of cameras.
                </>
              ),
            },
            {
              id: "03",
              title: "Standing on the shoulders of cypherpunks",
              body: (
                <>
                  ZOKA does not pretend to invent privacy. It inherits it. From{" "}
                  <span className="text-foreground">David Chaum</span> and his blind
                  signatures in 1982, to the <span className="text-foreground">Cypherpunks</span> of
                  the 90s who declared that <span className="italic">"privacy is necessary for an open society
                  in the electronic age"</span>. From <span className="text-foreground">Zcash</span> proving
                  that zk-SNARKs could shield value at scale, to{" "}
                  <span className="text-foreground">Monero</span> defending the principle that
                  privacy must be the default, never an option. From{" "}
                  <span className="text-foreground">Tor</span> and <span className="text-foreground">I2P</span> teaching
                  us how to hide the wire itself. Every line of ZOKA is a thank-you note to
                  those who came before, and refused to compromise.
                </>
              ),
            },
            {
              id: "04",
              title: "Optional privacy is no privacy",
              body: (
                <>
                  Any chain that lets you "turn on" private mode for some transactions has
                  already lost. The moment privacy is optional, using it becomes a signal —
                  a flag for any analyst to follow. ZOKA has no shielded mode and no
                  transparent mode. There is one mode. The protocol refuses, at the type
                  level, to broadcast value in cleartext.
                </>
              ),
            },
            {
              id: "05",
              title: "I do not ask you to trust me",
              body: (
                <>
                  I am one developer. I will make mistakes. The whole point of building on
                  zero-knowledge cryptography, MPC ceremonies and open code is so that you
                  do not have to take my word for anything. Verify the proofs. Audit the
                  circuits. Run a node. If ZOKA only works because you trust Natosh Zoka,
                  then ZOKA has already failed. It works because the math holds.
                </>
              ),
            },
            {
              id: "06",
              title: "Honest about what we cannot do",
              body: (
                <>
                  ZOKA will not protect you from a global passive adversary that watches
                  every wire on Earth. It will not save you if you reuse addresses across
                  your real identity. It is not post-quantum today. I will not promise
                  perfection, because perfect privacy is a marketing word, not a
                  cryptographic one. What I promise is the strongest privacy I know how to
                  ship, with the limits written down in plain text — not buried in a
                  footnote.
                </>
              ),
            },
            {
              id: "07",
              title: "No premine. No foundation. No backdoor.",
              body: (
                <>
                  There is no pre-mine, no founder allocation, no <span className="italic">"compliance"</span> view
                  key the protocol can hand over. The only entity that can ever reveal a
                  ZOKA transaction is the user who owns the key. Not me. Not a foundation.
                  Not a regulator. If that scares some people, good. It means the design is
                  doing its job.
                </>
              ),
            },
            {
              id: "08",
              title: "Why I am writing this",
              body: (
                <>
                  Most of what I do happens in silence — circuits, consensus, refactors that
                  nobody will ever read. But once, I owe it to whoever is reading this to
                  state the thing out loud: <span className="text-foreground">privacy is not a crime, it is a civic
                  infrastructure.</span> ZOKA is my contribution to that infrastructure. Use it
                  to pay for things. Use it to receive a salary without your employer
                  knowing the rest of your life. Use it to donate to causes that the next
                  regime might criminalize. Use it for nothing, just to know it exists.
                  <br />
                  <br />
                  That is enough for me.
                </>
              ),
            },
          ].map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-12 gap-4 md:gap-6 py-8 border-b border-border last:border-0"
            >
              <div className="col-span-12 md:col-span-1 font-mono text-xs text-muted-foreground">
                {c.id}
              </div>
              <div className="col-span-12 md:col-span-11 space-y-3">
                <h3 className="text-xl md:text-2xl font-extralight tracking-[-0.01em] text-foreground">
                  {c.title}
                </h3>
                <p className="text-base text-muted-foreground font-light leading-relaxed">
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Whitepaper / Litepaper CTA — moved here from its own section */}
        <div className="pt-4">
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
            Further reading
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                id: "wp", tag: "Technical",
                name: "Whitepaper",
                desc: "Formal cryptographic specification for researchers and engineers.",
                version: "v1.0",
                href: "/ZOKA_Whitepaper_v1.0.pdf",
                cta: "Read whitepaper",
                Icon: FileText,
              },
              {
                id: "lp", tag: "For everyone",
                name: "Litepaper",
                desc: "What ZOKA is, why privacy matters, how to use it. Plain language, no math.",
                version: "v1.0",
                href: "/ZOKA_Litepaper_v1.0.pdf",
                cta: "Read litepaper",
                Icon: BookOpen,
              },
            ].map((d) => {
              const Icon = d.Icon;
              return (
                <a
                  key={d.id}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col justify-between p-6 border border-border hover:border-foreground transition-colors min-h-[200px]"
                >
                  <div className="flex items-start justify-between">
                    <Icon className="w-5 h-5 text-foreground/80" />
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                      {d.tag}
                    </span>
                  </div>
                  <div className="mt-6">
                    <div className="text-2xl font-extralight text-foreground">{d.name}</div>
                    <div className="text-sm text-muted-foreground font-light mt-2 leading-relaxed">
                      {d.desc}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground inline-flex items-center gap-2">
                      {d.cta}
                      <span className="opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70">
                      {d.version}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Closing signature */}
        <div className="pt-6 flex flex-col gap-2">
          <p className="text-base md:text-lg font-light text-foreground italic">
            "Verify what is true. Reveal nothing else."
          </p>
          <div className="flex items-center gap-3 mt-4">
            <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-foreground">
              — Natosh Zoka
            </span>
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              core dev @ ZokaNetwork
            </span>
          </div>
        </div>
      </div>
    ),
  },
  tech: {
    eyebrow: "II. TECH · WHAT WE SHIPPED",
    title: (
      <>
        A pure-Rust blockchain,<br />
        <span className="text-muted-foreground">privacy by construction.</span>
      </>
    ),
    body: <TechAccordion />,
  },
  download: {
    eyebrow: "III. DOWNLOAD · ZSILENT CORE",
    title: (
      <>
        Your keys,<br />
        <span className="text-gradient">your silence.</span>
      </>
    ),
    body: (
      <div className="space-y-14">
        {/* Status banner */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 border border-border bg-foreground/[0.02]">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(160_84%_55%)] opacity-60" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[hsl(160_84%_55%)]" />
            </span>
            <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-foreground">
              Mainnet · v0.1.0
            </span>
          </div>
          <span className="hidden md:block h-4 w-px bg-border" />
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Permissionless mining · Open peers · No KYC
          </span>
        </div>

        {/* Intro */}
        <div className="space-y-4">
          <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
            <span className="text-foreground">ZSilent Core</span> is the desktop wallet for ZOKA.
            It bundles the node daemon, supervises sync, runs the miner with one toggle,
            and gives you a private send / receive interface — all without ever asking for
            an email, a phone number or a KYC document.
          </p>
          <p className="text-sm text-muted-foreground font-light">
            Built with Compose Desktop. v0.1.0 ships across Windows and Linux. Installers are
            produced by GitHub Actions on each tagged release; the build steps are
            reproducible from source.
          </p>
        </div>

        {/* OS download cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { id: "win", name: "Windows", desc: "10 · 11 · Server", badge: ".msi", Icon: Monitor, status: "available" },
            { id: "linux", name: "Linux", desc: "Debian / Ubuntu / Fedora", badge: ".deb / .rpm", Icon: Boxes, status: "available" },
          ].map((w) => {
            const Icon = w.Icon;
            return (
              <a
                key={w.id}
                href={WALLET_RELEASES}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex flex-col justify-between p-5 border border-border hover:border-foreground transition-colors min-h-[180px]"
              >
                <div className="flex items-start justify-between">
                  <Icon className="w-5 h-5 text-foreground/80" />
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    {w.badge}
                  </span>
                </div>
                <div className="mt-6">
                  <div className="text-xl font-extralight text-foreground">{w.name}</div>
                  <div className="text-xs text-muted-foreground font-light mt-1">{w.desc}</div>
                </div>
                <div className="mt-4 font-mono text-[10px] tracking-[0.25em] uppercase text-foreground inline-flex items-center gap-2">
                  Download
                  <span className="opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Honest status for unshipped platforms */}
        <div className="space-y-3">
          <div className="p-5 border border-border border-dashed">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-foreground">macOS</div>
                <div className="text-sm text-muted-foreground font-light mt-1">
                  jpackage builds run on Apple silicon but need code signing for distribution.
                  Coming in a later release.
                </div>
              </div>
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground/80">
                Planned
              </span>
            </div>
          </div>
          <div className="p-5 border border-border border-dashed">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-foreground">Mobile</div>
                <div className="text-sm text-muted-foreground font-light mt-1">
                  Native Android and iOS clients are not built yet. Desktop comes first.
                </div>
              </div>
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground/80">
                Not started
              </span>
            </div>
          </div>
        </div>

        {/* Verify your install */}
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-5">
            Verify what you downloaded
          </div>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-4">
            Each release ships with SHA-256 checksums on the GitHub Releases page. You can
            also reproduce the build yourself from <a href={WALLET_REPO} className="text-foreground underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">ZokaNetwork/zsilent-core</a>{" "}
            — the workflow in <code className="font-mono text-foreground/90">.github/workflows/release.yml</code> is the same one that produces the published binaries.
          </p>
          <a
            href={WALLET_RELEASES}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-5 py-3 border border-border hover:border-foreground transition-colors font-mono text-[11px] tracking-[0.25em] uppercase text-foreground"
          >
            <Github className="w-4 h-4" />
            Open latest release
            <span className="opacity-60">↗</span>
          </a>
        </div>

        {/* Advanced path: CLI tutorial */}
        <div>
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
            Advanced
          </div>
          <h3 className="text-2xl md:text-3xl font-extralight tracking-[-0.01em] text-foreground mb-3">
            Run the node from the terminal.
          </h3>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-8">
            Prefer a server, headless VPS, or building from source? Skip the desktop wallet
            and run the Rust node directly. Same network, same privacy, same binaries that
            ZSilent uses internally.
          </p>

          <div className="space-y-0 border-t border-border">
            {cliSteps.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-12 gap-4 md:gap-6 py-8 border-b border-border last:border-0"
                >
                  <div className="col-span-12 md:col-span-1 font-mono text-xs text-muted-foreground">
                    {s.id}
                  </div>
                  <div className="col-span-12 md:col-span-11 space-y-4">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-foreground/70" />
                      <h3 className="text-xl md:text-2xl font-extralight tracking-[-0.01em] text-foreground">
                        {s.title}
                      </h3>
                    </div>
                    <div className="text-base text-muted-foreground font-light leading-relaxed space-y-3">
                      {s.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
  },
  explorer: {
    eyebrow: "IV. EXPLORER · SEE THE CHAIN",
    title: (
      <>
        Watch blocks land.<br />
        <span className="text-muted-foreground">Never break privacy.</span>
      </>
    ),
    body: (
      <div className="space-y-12">
        <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
          <span className="text-foreground">zokaexplorer</span> is the public block explorer for ZOKA.
          Look up blocks by height, transactions by hash, and watch live network state — without
          turning the explorer into a surveillance tool. Sender, recipient and amount are{" "}
          <span className="text-foreground">absent from every transaction page</span>,
          because they are absent from the chain itself.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={EXPLORER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-6 py-3 border border-foreground/80 hover:bg-foreground hover:text-background transition-colors font-mono text-[11px] tracking-[0.3em] uppercase text-foreground"
          >
            <ScanLine className="w-4 h-4" />
            Open explorer
            <span className="opacity-70 group-hover:translate-x-1 transition-transform">↗</span>
          </a>
          <a
            href={EXPLORER_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-6 py-3 border border-border hover:border-foreground transition-colors font-mono text-[11px] tracking-[0.3em] uppercase text-foreground"
          >
            <Github className="w-4 h-4" />
            Source on GitHub
            <span className="opacity-60">↗</span>
          </a>
        </div>

        {/* What you'll see */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { Icon: Boxes, title: "Blocks", desc: "Height, timestamp, miner address commitment, tx count, difficulty, hash." },
            { Icon: Lock, title: "Transactions", desc: "Tx hash, ring size, nullifier count, proof status — never sender, receiver or amount." },
            { Icon: Eye, title: "Live metrics", desc: "Hashrate, peer count, block-time average, chain height. Read-only — no wallet operations." },
          ].map((b) => {
            const Icon = b.Icon;
            return (
              <div key={b.title} className="p-5 border border-border">
                <Icon className="w-5 h-5 text-foreground/80 mb-3" />
                <div className="text-base text-foreground font-light">{b.title}</div>
                <div className="text-sm text-muted-foreground font-light mt-2 leading-relaxed">
                  {b.desc}
                </div>
              </div>
            );
          })}
        </div>

        {/* Privacy by absence */}
        <div className="p-6 border border-border bg-foreground/[0.02]">
          <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
            What the explorer cannot show you
          </div>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            The explorer reads the same chain everyone reads. It does not have a privileged
            view key, a back-channel to the RPC, or any out-of-band data. If the explorer
            could surface sender, receiver or amount, the entire privacy model would be
            broken. It cannot — because the chain does not store that information in cleartext.
          </p>
        </div>
      </div>
    ),
  },
  github: {
    eyebrow: "V. GITHUB · OPEN SOURCE",
    title: (
      <>
        Open source,<br />
        <span className="text-muted-foreground">verifiable by anyone.</span>
      </>
    ),
    body: (
      <div className="space-y-12">
        <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
          ZOKA is split into four public repositories. Read the code, run the workflows,
          build your own binary, fork what you need. Every release is reproducible from these
          sources.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              name: "ZokaNetwork/ZokaNetwork",
              tag: "Network · Rust",
              desc: "Node, daemon, CLI, cryptography, consensus, P2P. Ships with the trusted setup and the mainnet manifest.",
              href: NETWORK_REPO,
            },
            {
              name: "ZokaNetwork/zsilent-core",
              tag: "Wallet · Kotlin Compose Desktop",
              desc: "Cross-platform desktop wallet. Bundles zoka + zokahd, drives onboarding, mining, send / receive. Releases under v0.1.0+.",
              href: WALLET_REPO,
            },
            {
              name: "ZokaNetwork/zokaexplorer",
              tag: "Explorer · Vite + React",
              desc: "Public block explorer. Read-only RPC client; never sees secret keys; surfaces only what the chain itself publishes.",
              href: EXPLORER_REPO,
            },
            {
              name: "ZokaNetwork/zokaweb",
              tag: "Site · Vite + React",
              desc: "This landing page. Static, no analytics, no third-party trackers. Hosts the whitepaper and litepaper PDFs.",
              href: WEB_REPO,
            },
          ].map((r) => (
            <a
              key={r.name}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col justify-between p-6 border border-border hover:border-foreground transition-colors min-h-[180px]"
            >
              <div className="flex items-start justify-between">
                <Github className="w-5 h-5 text-foreground/80" />
                <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  {r.tag}
                </span>
              </div>
              <div className="mt-6">
                <div className="font-mono text-sm text-foreground tracking-[0.05em]">{r.name}</div>
                <div className="text-sm text-muted-foreground font-light mt-2 leading-relaxed">
                  {r.desc}
                </div>
              </div>
              <div className="mt-4 font-mono text-[10px] tracking-[0.25em] uppercase text-foreground inline-flex items-center gap-2">
                Open repo
                <span className="opacity-60 group-hover:opacity-100 transition-opacity">↗</span>
              </div>
            </a>
          ))}
        </div>

        <p className="font-mono text-xs text-muted-foreground/70">
          github.com/ZokaNetwork
        </p>
      </div>
    ),
  },
};

const SectionOverlay = ({ active, onClose }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!active) return null;
  const data = content[active];

  return (
    <div
      className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(235 90% 60% / 0.12), transparent 60%)" }}
      />

      <button
        onClick={onClose}
        className="absolute top-6 right-6 md:top-8 md:right-10 z-10 w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative h-full overflow-y-auto no-scrollbar">
        <div className="min-h-full flex flex-col justify-start pt-24 pb-24">
          <div className="max-w-5xl mx-auto px-6 md:px-10 w-full">
            <div className="font-mono text-[11px] tracking-[0.4em] text-muted-foreground mb-10 uppercase animate-fade-in">
              {data.eyebrow}
            </div>
            <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-extralight leading-[1.05] tracking-[-0.03em] mb-12 animate-fade-in">
              {data.title}
            </h2>
            <div className="text-base md:text-lg text-muted-foreground font-light leading-relaxed animate-fade-in">
              {data.body}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionOverlay;
