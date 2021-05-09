import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'styled-components';
import { theme, Loader, Title, Stepper } from '@gnosis.pm/safe-react-components';
import GlobalStyle from './GlobalStyle';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
