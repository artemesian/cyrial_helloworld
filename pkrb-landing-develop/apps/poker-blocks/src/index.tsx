import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import LanguageContextProvider from "./contexts/language/LanguageContextProvider";

ReactDOM.render(
  <React.StrictMode>
    <LanguageContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
