import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import {
  getUserDomains,
  getTransactionHistory,
} from '@/app/actions/domains'
import RealNavbar from '@/components/RealNavbar'
import DomainCard from '@/components/DomainCard'
import TransactionHistory from '@/components/TransactionHistory'

export const metadata = {
  title: 'My Domains | Wei Name Service',
  description: 'Manage your .wei domains',
}

export default async function MyDomainsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const [domains, transactions] = await Promise.all([
    getUserDomains(),
    getTransactionHistory(),
  ])

  return (
    <div className="flex flex-col min-h-screen">
      <RealNavbar />
      <main className="flex-1 container mx-auto px-6 py-16 max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Domains
          </h1>
          <p className="text-muted-foreground">
            Manage your registered .wei domains on the blockchain
          </p>
        </div>

        {/* Domains Section */}
        <div className="mb-16">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Registered Domains ({domains.length})
          </h2>

          {domains.length === 0 ? (
            <div className="rounded border border-border bg-card/50 px-6 py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t registered any domains yet.
              </p>
              <a
                href="/"
                className="inline-block bg-accent text-accent-foreground font-semibold px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity"
              >
                Register Your First Domain
              </a>
            </div>
          ) : (
            <div className="grid gap-4">
              {domains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </div>
          )}
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="rounded border border-border bg-card/50 px-6 py-8 text-center text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <TransactionHistory transactions={transactions} />
          )}
        </div>
      </main>
    </div>
  )
}
