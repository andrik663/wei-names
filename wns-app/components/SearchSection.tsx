"use client";

import { useState } from "react";
import RegistrationFlow from "./RegistrationFlow";

const TAKEN_NAMES = ["alice", "bob", "vitalik", "wei", "eth", "admin", "root", "andrik"];

export default function SearchSection() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [status, setStatus] = useState<"idle" | "available" | "taken">("idle");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const name = query.trim().toLowerCase().replace(/\.wei$/, "");
    if (!name) return;
    setSearched(name);
    setStatus(TAKEN_NAMES.includes(name) ? "taken" : "available");
  }

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-xs font-mono tracking-widest text-accent uppercase mb-4">
        Wei Name Service
      </p>
      <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance mb-4 leading-tight">
        Your identity on<br />the blockchain.
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-md mb-12 leading-relaxed">
        Register a <span className="text-foreground font-mono">.wei</span> name and link it to
        your Ethereum address, website, and more.
      </p>

      <form
        onSubmit={handleSearch}
        className="flex w-full max-w-lg gap-0 rounded border border-border focus-within:border-accent transition-colors overflow-hidden"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="yourname"
          className="flex-1 bg-card px-4 py-3 text-foreground font-mono text-base outline-none placeholder:text-muted-foreground"
          autoComplete="off"
          spellCheck={false}
        />
        <span className="flex items-center px-3 bg-card text-muted-foreground font-mono text-sm border-l border-border">
          .wei
        </span>
        <button
          type="submit"
          className="bg-accent text-accent-foreground font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {status !== "idle" && (
        <div className="mt-6 w-full max-w-lg">
          {status === "taken" ? (
            <div className="flex items-center justify-between px-4 py-3 rounded border border-border bg-card">
              <span className="font-mono text-foreground">{searched}.wei</span>
              <span className="text-xs font-mono text-red-400 bg-red-400/10 px-2 py-1 rounded">
                Taken
              </span>
            </div>
          ) : (
            <RegistrationFlow name={searched} />
          )}
        </div>
      )}
    </section>
  );
}
