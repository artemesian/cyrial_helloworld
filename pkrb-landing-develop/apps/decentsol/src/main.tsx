import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import LanguageContextProvider from './contexts/language/LanguageContextProvider';

import App from './app';

ReactDOM.render(
  <React.StrictMode>
    <LanguageContextProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
