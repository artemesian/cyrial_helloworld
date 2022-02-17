import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { DEVNET_CONNECTION_URL } from "./constants";
import "./index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import reportWebVitals from "./reportWebVitals";

const wallets = [new PhantomWalletAdapter()];

ReactDOM.render(
  <React.StrictMode>
    <ConnectionProvider endpoint={DEVNET_CONNECTION_URL}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
