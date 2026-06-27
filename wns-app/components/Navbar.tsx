"use client";

import { useState } from "react";

export default function Navbar() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  async function handleConnect() {
    if (typeof window === "undefined") return;
    const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (!ethereum) {
      alert("MetaMask not found. Please install MetaMask to continue.");
      return;
    }
    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      setConnected(true);
    } catch {
      // user rejected
    }
  }

  function truncate(addr: string) {
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-accent font-mono font-bold text-lg leading-none">WNS</span>
          <span className="text-muted-foreground text-sm font-mono">.wei</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <button
            onClick={handleConnect}
            className="text-sm px-4 py-1.5 rounded border border-border hover:border-accent hover:text-accent transition-colors font-mono"
          >
            {connected ? truncate(address) : "Connect Wallet"}
          </button>
        </div>
      </div>
    </nav>
  );
}
