import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from './App';
import './index.css';

// 1. Set up the React Query Client (Required by Wagmi)
const queryClient = new QueryClient();

// 2. Configure Wagmi to support injected wallets like Rabby/MetaMask
const config = createConfig({
  chains: [hardhat, sepolia], 
  connectors: [injected()], // This enables Rabby Wallet connection
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'), // Local Hardhat network
    [sepolia.id]: http(),
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wrap the app with Wagmi and Query Providers first */}
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Then your BrowserRouter */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);