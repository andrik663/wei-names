export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-8 bg-card">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-accent font-mono font-bold">WNS</span>
            <span className="text-muted-foreground font-mono text-sm">.wei</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Wei Name Service — Decentralized naming on Ethereum
          </p>
        </div>

        <div className="flex gap-6 text-xs text-muted-foreground">
          <a
            href="https://github.com/andrik663/wei-names"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://wei.domains"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            wei.domains
          </a>
          <a
            href="https://etherscan.io"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Etherscan
          </a>
        </div>
      </div>
    </footer>
  );
}
