# Yunus - Microfinance Platform

A decentralized microloan platform inspired by Kiva, enabling zero-interest loans for small businesses and entrepreneurs. Built on Base (Ethereum L2) using smart contracts and Next.js.

## Key Differences from RBF Model

Unlike Revenue-Based Financing (RBF) which involves revenue sharing and returns to investors, this platform operates on a Kiva-like model:

- **Zero Interest**: Lenders provide loans without expecting interest or returns
- **Fixed Repayment**: Borrowers repay exactly what they borrowed
- **Social Impact**: Focus on helping businesses rather than generating returns
- **Simple Terms**: No revenue sharing percentages or repayment caps

## Features

- **Zero-Interest Loans**: Borrowers repay only the principal amount
- **Crowdfunded Loans**: Multiple lenders can contribute to a single loan
- **Transparent Terms**: All loan terms are clearly defined upfront
- **On-chain Security**: Smart contracts ensure transparent and secure transactions
- **Business Verification**: Registry system for verified borrowers

## Tech Stack

- **Smart Contracts**: Solidity, OpenZeppelin
- **Blockchain**: Base (Ethereum L2)
- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi, Viem, Privy
- **Package Management**: Turborepo

## Project Structure

```
yunus/
├── contracts/          # Smart contracts
│   ├── src/           # Contract source files
│   └── script/        # Deployment scripts
├── apps/
│   └── web/           # Next.js frontend application
└── packages/          # Shared packages
```

## Smart Contracts

### MicroLoan.sol
Individual loan contract managing:
- Funding collection from multiple lenders
- Loan disbursement to borrower
- Repayment tracking
- Proportional distribution back to lenders

### MicroLoanFactory.sol
Factory contract for creating new loans with:
- Loan amount limits (100-10,000 USDC)
- Funding duration (1-30 days)
- Repayment duration (30-365 days)
- Grace period (7-30 days)

### BusinessRegistry.sol
Registry for verified businesses eligible for loans

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Foundry (for smart contract development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/microfund.git
cd microfund
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### Development

Run the development server:
```bash
npm run dev
```

Deploy contracts:
```bash
npm run deploy:contracts
```

Run tests:
```bash
npm run test:contracts
```

## Deployment

### Smart Contracts

Deploy to Base Sepolia testnet:
```bash
cd contracts
forge script script/DeployFactory.s.sol:DeployFactory --rpc-url base_sepolia --broadcast --verify
```

### Frontend

Build and deploy the Next.js app:
```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT