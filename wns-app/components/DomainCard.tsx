'use client'

import { formatAddress } from '@/lib/web3/contract'

interface Domain {
  id: number
  domainName: string
  walletAddress: string
  registeredAt: Date
  expiresAt: Date | null
  status: string
  transactionHash: string | null
}

interface DomainCardProps {
  domain: Domain
}

export default function DomainCard({ domain }: DomainCardProps) {
  const registeredDate = new Date(domain.registeredAt).toLocaleDateString(
    'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' }
  )

  const expiresDate = domain.expiresAt
    ? new Date(domain.expiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Never'

  const isExpired =
    domain.expiresAt && new Date(domain.expiresAt) < new Date()

  return (
    <div className="rounded border border-border bg-card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground font-mono">
            {domain.domainName}.wei
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Owner: {formatAddress(domain.walletAddress)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono px-2 py-1 rounded ${
              isExpired
                ? 'bg-red-400/10 text-red-600 dark:text-red-400'
                : 'bg-green-400/10 text-green-600 dark:text-green-400'
            }`}
          >
            {isExpired ? 'Expired' : 'Active'}
          </span>
          <span className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded capitalize">
            {domain.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p className="text-muted-foreground mb-1">Registered</p>
          <p className="font-mono text-foreground">{registeredDate}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Expires</p>
          <p className="font-mono text-foreground">{expiresDate}</p>
        </div>
      </div>

      {domain.transactionHash && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
          <a
            href={`https://etherscan.io/tx/${domain.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-accent hover:underline break-all"
          >
            {formatAddress(domain.transactionHash)}
          </a>
        </div>
      )}

      <div className="flex gap-2">
        <button className="flex-1 bg-accent text-accent-foreground font-semibold py-2 rounded text-sm hover:opacity-90 transition-opacity">
          Manage
        </button>
        <button className="flex-1 border border-border text-foreground font-semibold py-2 rounded text-sm hover:bg-card transition-colors">
          Renew
        </button>
      </div>
    </div>
  )
}
