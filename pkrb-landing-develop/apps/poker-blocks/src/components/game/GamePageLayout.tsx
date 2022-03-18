import { Box, useTheme } from '@mui/material';
import VerticalNav from './VerticalNav';
import { Outlet } from 'react-router-dom';
import Scrollbars from 'react-custom-scrollbars-2';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletProvider,
  ConnectionProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

const wallets = [new PhantomWalletAdapter()];

export default function GamePageLayout() {
  const theme = useTheme();
  let CONNECTION_URL = 'https://api.devnet.solana.com';

  return (
    <ConnectionProvider endpoint={CONNECTION_URL}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              height: '100vh',
            }}
          >
            <VerticalNav />
            <Box
              sx={{
                background: theme.gradient.background,
                padding: '0 0%',
              }}
            >
              <Scrollbars>
                <Outlet></Outlet>
              </Scrollbars>
            </Box>
          </Box>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
