'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  getContractWithSigner,
  formatAddress,
  WNS_CONTRACT_ABI,
} from '@/lib/web3/contract'
import {
  registerDomain,
  recordTransaction,
  updateTransactionStatus,
} from '@/app/actions/domains'

type Step =
  | 'available'
  | 'connecting'
  | 'approving'
  | 'waiting'
  | 'registering'
  | 'done'
  | 'error'

const REGISTRATION_PRICE = 0.1 // 0.1 ETH

interface RegistrationFlowProps {
  name: string
  contractAddress: string
}

export default function RealRegistrationFlow({
  name,
  contractAddress,
}: RegistrationFlowProps) {
  const [step, setStep] = useState<Step>('available')
  const [duration, setDuration] = useState(1)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setStep('available')
    setDuration(1)
    setWalletAddress(null)
    setTransactionHash(null)
    setError(null)
  }, [name])

  const total = (REGISTRATION_PRICE * duration).toFixed(3)

  async function connectWallet() {
    try {
      setError(null)
      setIsLoading(true)

      if (!window.ethereum) {
        setError(
          'MetaMask not found. Please install MetaMask to continue.'
        )
        return
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0])
        setStep('approving')
      }
    } catch (err) {
      console.error('[v0] Wallet connection error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to connect wallet'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRegister() {
    if (!walletAddress) {
      setError('Wallet not connected')
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      setStep('registering')

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = getContractWithSigner(contractAddress, signer)

      // Parse ETH amount
      const priceInWei = ethers.utils.parseEther(total)

      // Execute registration
      const tx = await contract.register(name, { value: priceInWei })
      setTransactionHash(tx.hash)

      // Record transaction in DB
      await recordTransaction(
        tx.hash,
        name,
        'register',
        walletAddress,
        'pending'
      )

      // Update transaction status
      await updateTransactionStatus(
        tx.hash,
        'confirming'
      )

      // Wait for confirmation
      const receipt = await tx.wait(1)

      if (receipt) {
        await registerDomain(
          name,
          walletAddress,
          tx.hash,
          contractAddress
        )

        await updateTransactionStatus(
          tx.hash,
          'confirmed',
          receipt.gasUsed?.toNumber(),
          receipt.effectiveGasPrice?.toString()
        )

        setStep('done')
      }
    } catch (err) {
      console.error('[v0] Registration error:', err)
      setStep('error')
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded border border-accent/30 bg-card overflow-hidden">
      {/* Name header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-mono text-foreground font-semibold">
          {name}.wei
        </span>
        <span className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded">
          Available
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Duration selector */}
        {(step === 'available' || step === 'approving') && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Duration</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDuration((d) => Math.max(1, d - 1))}
                className="w-7 h-7 rounded border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm disabled:opacity-50"
                disabled={isLoading}
              >
                -
              </button>
              <span className="font-mono text-sm w-16 text-center text-foreground">
                {duration} yr{duration > 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setDuration((d) => Math.min(5, d + 1))}
                className="w-7 h-7 rounded border border-border text-muted-foreground hover:border-accent hover:text-accent transition-colors text-sm disabled:opacity-50"
                disabled={isLoading}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Price breakdown */}
        {step !== 'done' && (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{REGISTRATION_PRICE} ETH/yr × {duration} yr</span>
              <span className="font-mono text-foreground">{total} ETH</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Est. gas fee</span>
              <span className="font-mono text-foreground">~0.001 ETH</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1 mt-1 font-semibold">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono text-accent">
                ~{(parseFloat(total) + 0.001).toFixed(3)} ETH
              </span>
            </div>
          </div>
        )}

        {/* Wallet info */}
        {walletAddress && (
          <div className="text-xs bg-accent/5 border border-accent/20 rounded px-3 py-2">
            <p className="text-muted-foreground mb-1">Connected Wallet</p>
            <p className="font-mono text-foreground">{formatAddress(walletAddress)}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-xs bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded px-3 py-2">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Transaction hash */}
        {transactionHash && (
          <div className="text-xs bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded px-3 py-2">
            <p className="text-muted-foreground mb-1">Transaction</p>
            <p className="font-mono text-blue-600 dark:text-blue-400 break-all">
              {formatAddress(transactionHash)}
            </p>
          </div>
        )}

        {/* CTA */}
        {step === 'available' && (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground font-semibold py-2.5 rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}

        {step === 'approving' && (
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full bg-accent text-accent-foreground font-semibold py-2.5 rounded text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Register Domain'}
          </button>
        )}

        {(step === 'connecting' || step === 'registering') && (
          <button
            disabled
            className="w-full bg-accent/40 text-accent-foreground font-semibold py-2.5 rounded text-sm cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Spinner />
            {step === 'connecting'
              ? 'Connecting...'
              : 'Confirming transaction...'}
          </button>
        )}

        {step === 'waiting' && (
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Transaction submitted. Waiting for confirmation...
            </p>
            <Spinner />
          </div>
        )}

        {step === 'done' && (
          <div className="text-center space-y-2 py-2">
            <div className="text-accent text-2xl">✓</div>
            <p className="font-semibold text-foreground text-sm">
              {name}.wei is yours!
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your domain has been registered on Ethereum.
              <br />
              View it in your dashboard.
            </p>
          </div>
        )}

        {step === 'error' && (
          <button
            onClick={() => {
              setStep('available')
              setError(null)
              setTransactionHash(null)
            }}
            className="w-full bg-accent text-accent-foreground font-semibold py-2.5 rounded text-sm hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
