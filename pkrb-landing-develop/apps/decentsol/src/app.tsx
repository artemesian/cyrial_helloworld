import { useRoutes } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import { IntlProvider } from 'react-intl';
import { routes } from './routes/routes';
import { useLanguage } from './contexts/language/LanguageContextProvider';
import { frMessage } from './languages/fr/index';
import { enMessage } from './languages/en-us/index';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletProvider,
  ConnectionProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import './solana-wallet.styles.css';

const wallets = [new PhantomWalletAdapter()];

function App() {
  const CONNECTION_URL = 'https://api.devnet.solana.com';

  const routing = useRoutes(routes);
  const { activeLanguage } = useLanguage();
  const activeMessage = activeLanguage === 'Fr' ? frMessage : enMessage;

  return (
    <ConnectionProvider endpoint={CONNECTION_URL}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <IntlProvider
            messages={activeMessage}
            locale={activeLanguage}
            defaultLocale="Fr"
          >
            <ThemeProvider theme={theme}>{routing}</ThemeProvider>
          </IntlProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
