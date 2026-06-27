const tiers = [
  { chars: "1 char", price: "0.320 ETH/yr", note: "Ultra premium" },
  { chars: "2 chars", price: "0.032 ETH/yr", note: "Premium" },
  { chars: "3 chars", price: "0.016 ETH/yr", note: "Short" },
  { chars: "4+ chars", price: "0.001 ETH/yr", note: "Standard", highlight: true },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="border-t border-border px-6 py-20"
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono tracking-widest text-accent uppercase mb-3">
          Pricing
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
          Annual registration fees
        </h2>
        <p className="text-muted-foreground text-sm mb-12 leading-relaxed">
          Shorter names cost more. All names 4+ characters start at 0.001 ETH/yr.
          <br />
          Payment accepted in ETH, USDC, or DAI.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.chars}
              className={`border rounded p-5 flex flex-col gap-2 ${
                tier.highlight
                  ? "border-accent bg-accent/5"
                  : "border-border bg-card"
              }`}
            >
              <span className="text-xs font-mono text-muted-foreground">
                {tier.chars}
              </span>
              <span
                className={`font-mono font-bold text-lg ${
                  tier.highlight ? "text-accent" : "text-foreground"
                }`}
              >
                {tier.price}
              </span>
              <span className="text-xs text-muted-foreground">{tier.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
