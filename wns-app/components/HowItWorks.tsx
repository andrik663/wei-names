const steps = [
  {
    number: "01",
    title: "Search a name",
    description: "Check if your desired .wei name is available.",
  },
  {
    number: "02",
    title: "Commit",
    description:
      "Submit a commitment hash to prevent frontrunning. Wait 60 seconds.",
  },
  {
    number: "03",
    title: "Register",
    description:
      "Pay 0.001 ETH/yr and receive your .wei name as an ERC-721 NFT.",
  },
  {
    number: "04",
    title: "Manage",
    description:
      "Link your address, set a contenthash to host a website on IPFS, or create subdomains.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="border-t border-border bg-muted px-6 py-20"
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-xs font-mono tracking-widest text-accent uppercase mb-3">
          Process
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-balance">
          How registration works
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="border border-border rounded bg-card p-5 flex flex-col gap-3"
            >
              <span className="font-mono text-accent text-xs">{step.number}</span>
              <h3 className="font-semibold text-foreground text-sm">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
