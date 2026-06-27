# Wei Name Service - Smart Contract Deployment Guide

## Overview

The Wei Name Service (WNS) is a decentralized domain registration system built on Ethereum. This guide explains how to deploy the smart contract and configure the application.

## Smart Contract Deployment

### Prerequisites

- Node.js and npm installed
- Hardhat or Foundry for contract compilation and deployment
- An Ethereum wallet with mainnet ETH for gas fees
- Access to Infura, Alchemy, or another RPC provider

### Using Hardhat (Recommended)

1. **Install Hardhat**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

2. **Add the contract file**
```bash
cp contracts/WeiNameService.sol hardhat/contracts/
```

3. **Configure Hardhat** (`hardhat.config.js`)
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

4. **Create deployment script** (`hardhat/scripts/deploy.js`)
```javascript
async function main() {
  const WNS = await ethers.getContractFactory("WeiNameService");
  const wns = await WNS.deploy();
  await wns.deployed();
  console.log("WNS deployed to:", wns.address);
  return wns.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

5. **Deploy to mainnet**
```bash
export MAINNET_RPC_URL="your_rpc_url"
export PRIVATE_KEY="your_private_key"
npx hardhat run scripts/deploy.js --network mainnet
```

### Using Foundry

1. **Install Foundry**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Deploy**
```bash
forge create contracts/WeiNameService.sol:WeiNameService \
  --rpc-url $MAINNET_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Application Configuration

### 1. Set Environment Variables

After deploying the contract, update your `.env.local`:

```env
NEXT_PUBLIC_WNS_CONTRACT_ADDRESS=0x<your-deployed-contract-address>
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth.public.lodestar.io
```

### 2. Set Up Database

The app uses Neon PostgreSQL with Better Auth. Environment variables are automatically configured by the Neon integration:

- `DATABASE_URL` - Automatically provided
- `BETTER_AUTH_SECRET` - Must be set (generate with: `openssl rand -base64 32`)

### 3. Verify Contract ABI

The contract ABI is defined in `lib/web3/contract.ts`. After deployment, verify the functions match:

- `register(string memory domainName) payable`
- `checkAvailability(string memory domainName) view returns (bool)`
- `getDomainOwner(string memory domainName) view returns (address)`
- `renewDomain(string memory domainName) payable`
- `transferDomain(string memory domainName, address to) payable`

## Testing

### Local Testing with Hardhat

1. **Start local network**
```bash
npx hardhat node
```

2. **Deploy to local network**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Run tests**
```bash
npx hardhat test
```

### Testing with the Web App

1. **Connect MetaMask to localhost:8545** (Hardhat node)
2. **Register a test domain** using the UI
3. **Check contract state** in Hardhat console

## Mainnet Deployment Checklist

- [ ] Smart contract code audited
- [ ] Gas costs estimated and acceptable
- [ ] Contract deployed to mainnet
- [ ] Contract address verified on Etherscan
- [ ] `NEXT_PUBLIC_WNS_CONTRACT_ADDRESS` set in production env vars
- [ ] `BETTER_AUTH_SECRET` set in production
- [ ] All environment variables configured
- [ ] Application tested on staging
- [ ] Domain registration functionality tested with real wallet

## Security Considerations

1. **Private Keys**: Never commit private keys. Use environment variables.
2. **Contract Upgrades**: This contract is immutable. Plan carefully before deployment.
3. **Rate Limiting**: Consider adding rate limiting to prevent spam registrations.
4. **Gas Limits**: Set reasonable limits on registration fees.

## Monitoring

Monitor contract activity:

- **Etherscan**: https://etherscan.io/address/`NEXT_PUBLIC_WNS_CONTRACT_ADDRESS`
- **Transaction history**: View in Etherscan or directly from the app dashboard

## Troubleshooting

### Contract deployment fails
- Ensure you have sufficient ETH for gas
- Check RPC endpoint connectivity
- Verify contract syntax with `npx hardhat compile`

### Transactions fail in UI
- Verify contract address is correct
- Check MetaMask network is Ethereum Mainnet
- Ensure wallet has sufficient ETH for gas
- Check contract ABI matches deployed functions

### Domain registrations not appearing in database
- Verify `DATABASE_URL` is set correctly
- Check database migrations have run
- Ensure `BETTER_AUTH_SECRET` is set
