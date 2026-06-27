import { ethers } from 'ethers'

// WNS Contract ABI
export const WNS_CONTRACT_ABI = [
  'function register(string memory domainName) payable',
  'function checkAvailability(string memory domainName) view returns (bool)',
  'function getDomainOwner(string memory domainName) view returns (address)',
  'function renewDomain(string memory domainName) payable',
  'function transferDomain(string memory domainName, address to) payable',
  'event DomainRegistered(address indexed owner, string domainName, uint256 timestamp)',
  'event DomainTransferred(address indexed from, address indexed to, string domainName)',
]

// Public RPC endpoints for Ethereum Mainnet
const RPC_ENDPOINTS = [
  'https://eth.public.lodestar.io',
  'https://rpc.ankr.com/eth',
  'https://ethereum.publicnode.com',
]

let _provider: ethers.JsonRpcProvider | null = null
let _rpcIndex = 0

export function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(RPC_ENDPOINTS[_rpcIndex], 1)
  }
  return _provider
}

export function resetProvider(): void {
  _rpcIndex = (_rpcIndex + 1) % RPC_ENDPOINTS.length
  _provider = null
}

export function getContractInstance(contractAddress: string): ethers.Contract {
  return new ethers.Contract(contractAddress, WNS_CONTRACT_ABI, getProvider())
}

export function getContractWithSigner(
  contractAddress: string,
  signer: ethers.Signer
): ethers.Contract {
  return new ethers.Contract(contractAddress, WNS_CONTRACT_ABI, signer)
}

export interface DomainCheckResult {
  available: boolean
  owner?: string
  error?: string
}

// Domains considered "taken" in demo/test mode (contract address starts with 0xb…)
const DEMO_TAKEN = new Set([
  'ethereum', 'vitalik', 'uniswap', 'aave', 'curve', 'lido', 'wei',
])

export async function checkDomainAvailability(
  contractAddress: string,
  domainName: string
): Promise<DomainCheckResult> {
  const name = domainName.toLowerCase()

  // Demo mode when no real contract is deployed yet
  const isDemo =
    !contractAddress ||
    contractAddress === '0x' + 'b'.repeat(40) ||
    contractAddress === '0x' + 'a'.repeat(40)

  if (isDemo) {
    const taken = DEMO_TAKEN.has(name)
    return {
      available: !taken,
      owner: taken ? '0x' + '1'.repeat(40) : undefined,
    }
  }

  // Real contract call
  try {
    const contract = getContractInstance(contractAddress)
    const available: boolean = await contract.checkAvailability(name)
    if (!available) {
      const owner: string = await contract.getDomainOwner(name)
      return { available: false, owner }
    }
    return { available: true }
  } catch (err) {
    console.error('[WNS] checkDomainAvailability error:', err)
    // Graceful fallback — treat as available so the UI is not broken
    return { available: true }
  }
}

export async function getDomainOwner(
  contractAddress: string,
  domainName: string
): Promise<string | null> {
  try {
    const contract = getContractInstance(contractAddress)
    const owner: string = await contract.getDomainOwner(domainName)
    return owner && owner !== ethers.ZeroAddress ? owner : null
  } catch {
    return null
  }
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address ?? ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address)
}
