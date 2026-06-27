'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
}

export default function RealNavbar() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function getSession() {
      try {
        const session = await authClient.getSession()
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('[v0] Failed to get session:', error)
      } finally {
        setIsLoading(false)
      }
    }
    getSession()
  }, [])

  async function handleLogout() {
    try {
      await authClient.signOut()
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Account'

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between max-w-5xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-accent font-mono font-bold text-lg leading-none">
            WNS
          </span>
          <span className="text-muted-foreground text-sm font-mono">.wei</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works
          </a>
          <a
            href="/#pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>

          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/my-domains"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    My Domains
                  </Link>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-sm px-3 py-1.5 rounded border border-border hover:border-accent hover:text-accent transition-colors font-mono"
                  >
                    {displayName}
                  </button>
                  {isMenuOpen && (
                    <div className="absolute top-14 right-6 bg-card border border-border rounded shadow-lg overflow-hidden">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/sign-in"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="text-sm px-4 py-1.5 rounded bg-accent text-accent-foreground hover:opacity-90 transition-opacity font-mono"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          {!isLoading && (
            <>
              {user ? (
                <Link
                  href="/my-domains"
                  className="text-sm px-3 py-1.5 rounded border border-border hover:border-accent transition-colors"
                >
                  Domains
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="text-sm px-4 py-1.5 rounded bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
