'use client'

import { formatAddress } from '@/lib/web3/contract'

interface Transaction {
  id: number
  domainName: string
  action: string
  status: string
  transactionHash: string
  createdAt: Date
  walletAddress: string
  gasUsed: number | null
  gasPrice: string | null
  value: string | null
}

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export default function TransactionHistory({
  transactions,
}: TransactionHistoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-400/10 text-green-600 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400'
      case 'failed':
        return 'bg-red-400/10 text-red-600 dark:text-red-400'
      default:
        return 'bg-blue-400/10 text-blue-600 dark:text-blue-400'
    }
  }

  const getActionLabel = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-3 text-muted-foreground font-semibold">
              Domain
            </th>
            <th className="text-left px-4 py-3 text-muted-foreground font-semibold">
              Action
            </th>
            <th className="text-left px-4 py-3 text-muted-foreground font-semibold">
              Date
            </th>
            <th className="text-left px-4 py-3 text-muted-foreground font-semibold">
              Status
            </th>
            <th className="text-left px-4 py-3 text-muted-foreground font-semibold">
              Transaction
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              className="border-b border-border hover:bg-card/50 transition-colors"
            >
              <td className="px-4 py-3">
                <span className="font-mono text-foreground font-semibold">
                  {tx.domainName}.wei
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {getActionLabel(tx.action)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(tx.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-mono px-2 py-1 rounded capitalize ${getStatusColor(
                    tx.status
                  )}`}
                >
                  {tx.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <a
                  href={`https://etherscan.io/tx/${tx.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-accent hover:underline text-xs"
                >
                  {formatAddress(tx.transactionHash)}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
