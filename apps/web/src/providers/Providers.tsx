'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApolloProvider } from '@apollo/client';
import { getClient } from '@/lib/apollo';
import { http } from 'viem';
import { metaMask, coinbaseWallet, walletConnect, injected } from 'wagmi/connectors';
import { PaymentProvider } from './payment/PaymentProvider';

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    metaMask(),
    injected(),
    coinbaseWallet({
      appName: 'Yunus',
      appLogoUrl: 'https://your-logo-url.com',
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={getClient()}>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
        config={{
          appearance: {
            theme: 'light',
            accentColor: '#059669', // jade green to match theme
          },
          defaultChain: baseSepolia,
          supportedChains: [baseSepolia],
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          externalWallets: {
            metamask: {},
            coinbaseWallet: {},
            walletConnect: {},
          },
          loginMethods: ['wallet'],
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <PaymentProvider>
              {children}
            </PaymentProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </ApolloProvider>
  );
}