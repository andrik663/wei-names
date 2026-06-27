'use client'

import { useState } from 'react'
import { checkDomainAvailability } from '@/lib/web3/contract'
import { DEFAULT_WNS_CONTRACT_ADDRESS } from '@/lib/web3/deployContract'
import { recordDomainSearch } from '@/app/actions/domains'
import RealRegistrationFlow from './RealRegistrationFlow'

interface SearchStatus {
  state: 'idle' | 'searching' | 'available' | 'taken' | 'error'
  domainName?: string
  owner?: string
  error?: string
}

export default function RealSearchSection() {
  const [query, setQuery] = useState('')
  const [searchStatus, setSearchStatus] = useState<SearchStatus>({ state: 'idle' })
  const [isSearching, setIsSearching] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const name = query.trim().toLowerCase().replace(/\.wei$/, '')

    if (!name || name.length < 3) {
      setSearchStatus({
        state: 'error',
        error: 'Domain name must be at least 3 characters',
      })
      return
    }

    if (!/^[a-z0-9-]+$/.test(name)) {
      setSearchStatus({
        state: 'error',
        error: 'Domain can only contain letters, numbers, and hyphens',
      })
      return
    }

    setIsSearching(true)
    setSearchStatus({ state: 'searching', domainName: name })

    try {
      const result = await checkDomainAvailability(
        DEFAULT_WNS_CONTRACT_ADDRESS,
        name
      )

      if (result.error) {
        setSearchStatus({
          state: 'error',
          error:
            result.error ||
            'Unable to check availability. Please try again.',
        })
      } else       if (result.available) {
        setSearchStatus({ state: 'available', domainName: name })
      } else {
        setSearchStatus({
          state: 'taken',
          domainName: name,
          owner: result.owner,
        })
      }
    } catch (error) {
      console.error('[v0] Search error:', error)
      setSearchStatus({
        state: 'error',
        error: 'Network error. Please try again.',
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-xs font-mono tracking-widest text-accent uppercase mb-4">
        Wei Name Service
      </p>
      <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance mb-4 leading-tight">
        Your identity on
        <br />
        the blockchain.
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-md mb-12 leading-relaxed">
        Register a{' '}
        <span className="text-foreground font-mono">.wei</span> domain
        and link it to your Ethereum address, website, and more.
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
          className="flex-1 bg-card px-4 py-3 text-foreground font-mono text-base outline-none placeholder:text-muted-foreground disabled:opacity-50"
          autoComplete="off"
          spellCheck={false}
          disabled={isSearching}
        />
        <span className="flex items-center px-3 bg-card text-muted-foreground font-mono text-sm border-l border-border">
          .wei
        </span>
        <button
          type="submit"
          className="bg-accent text-accent-foreground font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          disabled={isSearching}
        >
          {isSearching ? 'Checking...' : 'Search'}
        </button>
      </form>

      {searchStatus.state !== 'idle' && (
        <div className="mt-6 w-full max-w-lg">
          {searchStatus.state === 'searching' && (
            <div className="flex items-center justify-center px-4 py-3 rounded border border-border bg-card">
              <span className="text-muted-foreground text-sm">
                Checking blockchain...
              </span>
            </div>
          )}

          {searchStatus.state === 'error' && (
            <div className="flex items-center justify-between px-4 py-3 rounded border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
              <span className="font-mono text-red-600 dark:text-red-400 text-sm">
                {searchStatus.error}
              </span>
              <button
                onClick={() => setSearchStatus({ state: 'idle' })}
                className="text-red-600 dark:text-red-400 text-xs hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {searchStatus.state === 'taken' && (
            <div className="flex items-center justify-between px-4 py-3 rounded border border-border bg-card">
              <div className="text-left">
                <span className="font-mono text-foreground block">
                  {searchStatus.domainName}.wei
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Owner: {searchStatus.owner
                    ? `${searchStatus.owner.slice(0, 6)}...${searchStatus.owner.slice(-4)}`
                    : 'Unknown'}
                </span>
              </div>
              <span className="text-xs font-mono text-red-400 bg-red-400/10 px-2 py-1 rounded">
                Taken
              </span>
            </div>
          )}

          {searchStatus.state === 'available' && (
            <div className="rounded border border-accent/30 bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-mono text-foreground font-semibold">
                  {searchStatus.domainName}.wei
                </span>
                <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
                  Available
                </span>
              </div>
              <div className="px-4 py-6 text-center">
                <p className="text-muted-foreground mb-4">
                  This domain is available for registration!
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Sign in to register this domain with your wallet
                </p>
                <a
                  href="/sign-in"
                  className="inline-block bg-accent text-accent-foreground font-semibold px-6 py-2 rounded text-sm hover:opacity-90 transition-opacity"
                >
                  Sign In to Register
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
