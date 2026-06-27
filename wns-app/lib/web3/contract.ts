import { ethers } from 'ethers'

// WNS Contract ABI - basic ERC721 + registry functions
export const WNS_CONTRACT_ABI = [
  'function register(string memory domainName) payable',
  'function checkAvailability(string memory domainName) view returns (bool)',
  'function getDomainOwner(string memory domainName) view returns (address)',
  'function renewDomain(string memory domainName) payable',
  'function transferDomain(string memory domainName, address to) payable',
  'event DomainRegistered(address indexed owner, string domainName, uint256 timestamp)',
  'event DomainTransferred(address indexed from, address indexed to, string domainName)',
]

// Default public RPC endpoints for Ethereum Mainnet
const RPC_ENDPOINTS = [
  'https://eth.public.lodestar.io',
  'https://eth.lavanet.xyz:443/lavanet/63949ebb62000800001a9630d707efad',
  'https://rpc.ankr.com/eth',
]

let provider: ethers.providers.JsonRpcProvider | null = null
let currentRpcIndex = 0

export const getProvider = (): ethers.providers.JsonRpcProvider => {
  if (!provider) {
    const rpcUrl = RPC_ENDPOINTS[currentRpcIndex]
    provider = new ethers.providers.JsonRpcProvider(rpcUrl, 1) // 1 = Ethereum mainnet
  }
  return provider
}

export const switchRpcProvider = (): void => {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length
  provider = null
  console.log(`[WNS] Switched to RPC endpoint ${currentRpcIndex}`)
}

export const getContractInstance = (contractAddress: string): ethers.Contract => {
  const provider = getProvider()
  return new ethers.Contract(contractAddress, WNS_CONTRACT_ABI, provider)
}

export const getContractWithSigner = (
  contractAddress: string,
  signer: ethers.Signer
): ethers.Contract => {
  return new ethers.Contract(contractAddress, WNS_CONTRACT_ABI, signer)
}

export interface DomainCheckResult {
  available: boolean
  owner?: string
  error?: string
}

export const checkDomainAvailability = async (
  contractAddress: string,
  domainName: string
): Promise<DomainCheckResult> => {
  try {
    const contract = getContractInstance(contractAddress)
    const available = await contract.checkAvailability(domainName)

    if (!available) {
      const owner = await contract.getDomainOwner(domainName)
      return { available: false, owner }
    }

    return { available: true }
  } catch (error) {
    console.error('[WNS] Error checking domain availability:', error)
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export const getDomainOwner = async (
  contractAddress: string,
  domainName: string
): Promise<string | null> => {
  try {
    const contract = getContractInstance(contractAddress)
    const owner = await contract.getDomainOwner(domainName)
    return owner && owner !== ethers.constants.AddressZero ? owner : null
  } catch (error) {
    console.error('[WNS] Error getting domain owner:', error)
    return null
  }
}

export const estimateRegistrationGas = async (
  contractAddress: string,
  domainName: string,
  fromAddress: string
): Promise<ethers.BigNumber | null> => {
  try {
    const contract = getContractInstance(contractAddress)
    const gasEstimate = await contract.estimateGas.register(domainName, {
      from: fromAddress,
    })
    return gasEstimate
  } catch (error) {
    console.error('[WNS] Error estimating gas:', error)
    return null
  }
}

export const formatAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const isValidEthereumAddress = (address: string): boolean => {
  return ethers.utils.isAddress(address)
}
