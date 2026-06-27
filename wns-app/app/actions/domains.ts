'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  domainRegistrations,
  searchHistory,
  transactions,
} from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function recordDomainSearch(
  domainName: string,
  isAvailable: boolean
) {
  const userId = await getUserId()

  await db.insert(searchHistory).values({
    userId,
    domainName,
    isAvailable,
  })

  revalidatePath('/')
}

export async function registerDomain(
  domainName: string,
  walletAddress: string,
  transactionHash: string,
  contractAddress: string
) {
  const userId = await getUserId()

  // Check if domain already registered by this user
  const existing = await db
    .select()
    .from(domainRegistrations)
    .where(
      and(
        eq(domainRegistrations.userId, userId),
        eq(domainRegistrations.domainName, domainName)
      )
    )

  if (existing.length > 0) {
    throw new Error('Domain already registered by user')
  }

  // Register domain
  const result = await db
    .insert(domainRegistrations)
    .values({
      userId,
      domainName,
      walletAddress,
      transactionHash,
      contractAddress,
      status: 'registered',
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/my-domains')

  return result[0]
}

export async function getUserDomains() {
  const userId = await getUserId()

  const domains = await db
    .select()
    .from(domainRegistrations)
    .where(eq(domainRegistrations.userId, userId))
    .orderBy(desc(domainRegistrations.registeredAt))

  return domains
}

export async function getSearchHistory() {
  const userId = await getUserId()

  const history = await db
    .select()
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.searchedAt))
    .limit(10)

  return history
}

export async function recordTransaction(
  transactionHash: string,
  domainName: string,
  action: string,
  walletAddress: string,
  status: string = 'pending'
) {
  const userId = await getUserId()

  const result = await db
    .insert(transactions)
    .values({
      userId,
      transactionHash,
      domainName,
      action,
      status,
      walletAddress,
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/my-domains')

  return result[0]
}

export async function updateTransactionStatus(
  transactionHash: string,
  status: string,
  gasUsed?: number,
  gasPrice?: string
) {
  const userId = await getUserId()

  // Verify transaction belongs to user
  const txns = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.transactionHash, transactionHash)
      )
    )

  if (txns.length === 0) {
    throw new Error('Transaction not found')
  }

  const result = await db
    .update(transactions)
    .set({
      status,
      ...(gasUsed && { gasUsed }),
      ...(gasPrice && { gasPrice }),
      updatedAt: new Date(),
    })
    .where(eq(transactions.transactionHash, transactionHash))
    .returning()

  revalidatePath('/my-domains')

  return result[0]
}

export async function getTransactionHistory() {
  const userId = await getUserId()

  const txns = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(20)

  return txns
}
