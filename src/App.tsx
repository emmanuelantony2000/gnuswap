import React, { createContext, useState, useEffect, useContext, useMemo, ReactElement } from 'react';
import styled from 'styled-components';

import Web3 from 'web3';
import { Button } from '@gnosis.pm/safe-react-components';
import SafeAppsSDK, { Opts as SDKOpts, SafeInfo } from '@gnosis.pm/safe-apps-sdk';
import { Stepper } from '@gnosis.pm/safe-react-components';

import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { ConnextModal } from '@connext/vector-modal';

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

const steps = [{ id: "1", label: "Loading" }, { id: "2", label: "Checking Metamask" }, { id: "3", label: "Done" }];

type SafeReactSDKContext = {
  sdk: SafeAppsSDK;
  connected: boolean;
  safe: SafeInfo;
};

const SafeContext = createContext<SafeReactSDKContext | undefined>(undefined);

interface Props {
  opts?: SDKOpts;
}

export const useSafeAppsSDK = (): SafeReactSDKContext => {
  const value = useContext(SafeContext);

  if (value === undefined) {
    throw new Error('You probably forgot to put <SafeProvider>.');
  }

  return value;
};

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const App: React.FC<Props> = ({ opts }) => {
  const [sdk] = useState(new SafeAppsSDK(opts));
  const [connected, setConnected] = useState(false);
  const [safe, setSafe] = useState<SafeInfo>({ safeAddress: '', network: 'RINKEBY' });
  const contextValue = useMemo(() => ({ sdk: sdk, connected, safe: safe }), [sdk, connected, safe]);

  useEffect(() => {
    const fetchSafeInfo = async () => {
      try {
        const safeInfo = await sdk.getSafeInfo();

        setSafe(safeInfo);
        setConnected(true);
      } catch (err) {
        setConnected(false);
      }
    };

    fetchSafeInfo();
  }, [sdk]);

  if (!connected) {
    return <Stepper steps={steps} activeStepIndex={0} orientation="vertical" />;
  }

  return <App1 contextValue={contextValue} />
}
const App1: React.FC<{
  contextValue: {
    sdk: SafeAppsSDK;
    connected: boolean;
    safe: SafeInfo;
  }
}> = ({ contextValue }) => {
  const { sdk, safe } = useSafeAppsSDK();
  const web3Provider = new SafeAppProvider(safe, sdk);

  const ethEnabled = async () => {
    if (window.ethereum) {
      await window.ethereum.send('eth_requestAccounts');
      window.web3 = new Web3(window.ethereum);
      return true;
    }
    return false;
  }
  if (!ethEnabled()) {
    return <SafeContext.Provider value={contextValue}><Stepper steps={steps} activeStepIndex={2} orientation="vertical" error /></SafeContext.Provider>;
  }

  return <App2 web3Provider={web3Provider} contextValue={contextValue} />
}

const App2: React.FC<{
  web3Provider: SafeAppProvider, contextValue: {
    sdk: SafeAppsSDK;
    connected: boolean;
    safe: SafeInfo;
  }
}> = ({ web3Provider, contextValue }) => {
  const [showModal, setShowModal] = React.useState(false);

  return <SafeContext.Provider value={contextValue}>
    <Stepper steps={steps} activeStepIndex={3} orientation="vertical" />
    <Container>
      <Button size="lg" color="primary" onClick={() => setShowModal(true)}>Open Connext</Button>
      <ConnextModal
        showModal={showModal}
        onClose={() => setShowModal(false)}
        onReady={params => console.log('MODAL IS READY =======>', params)}
        injectedProvider={web3Provider}
        loginProvider={window.ethereum}
        withdrawalAddress={'0x182CB9579A57756EF8854A37EC1b75F911eb19BB'}
        routerPublicIdentifier="vector7tbbTxQp8ppEQUgPsbGiTrVdapLdU5dH7zTbVuXRf1M4CEBU9Q"
        depositAssetId={'0x0000000000000000000000000000000000000000'}
        depositChainProvider="https://rinkeby.infura.io/v3/31a0f6f85580403986edab0be5f7673c"
        depositChainId={4}
        withdrawAssetId={'0x0000000000000000000000000000000000000000'}
        withdrawChainProvider="https://kovan.infura.io/v3/31a0f6f85580403986edab0be5f7673c"
        withdrawChainId={42}
        onDepositTxCreated={(txHash) => { console.log('Deposit Tx Created =======>', txHash) }}
      />
      { }
    </Container>
  </SafeContext.Provider >
    ;
};

export default App;