import React, { useEffect, useState } from 'react';
import './App.scss';
import { useLocalStorage } from './hooks/useLocalStorage/useLocalStorage';
import { getWalletBySource } from './lib/wallets';
import { Wallet, WalletAccount } from './lib/types';
import Welcome from './components/Welcome';
import {
  BrowserRouter,
  Route,
  Link, Routes, useNavigate
} from 'react-router-dom';
import AccountList from './components/AccountList';
import Layout from './components/Layout';
import { OpenSelectWallet, WalletContext } from './contexts';
import SelectWalletModal from './components/SelectWalletModal';

function App () {
  const [walletKey, setWalletKey] = useLocalStorage('wallet-key');
  const [currentWallet, setCurrentWallet] = useState(getWalletBySource(walletKey));
  const [isSelectWallet, setIsSelectWallet] = useState(false);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);

  const selectWallet = async (wallet: Wallet) => {
    setCurrentWallet(currentWallet);
    if (wallet?.installed) {
      await wallet.enable();
      setWalletKey(wallet.extensionName);

      wallet.subscribeAccounts((infos) => {
        infos && setAccounts(infos)
      }).then((unsub) => {
        unsub && unsub();
      }).catch(console.error)
    }
  }

  const walletContext = {
    wallet: getWalletBySource(walletKey),
    accounts: accounts,
    setWallet: (wallet: Wallet | undefined) => {
      wallet && selectWallet(wallet)
    }
  }

  const selectWalletContext = {
    isOpen: isSelectWallet,
    open: () => {
      setIsSelectWallet(true)
    },
    close: () => {
      setIsSelectWallet(false)
    }
  }

  useEffect(
    () => {
      const wallet = getWalletBySource(walletKey);
      if (wallet) {
        const fetchInfo = async () => {
          await wallet.enable();

          wallet.subscribeAccounts((infos) => {
            infos && setAccounts(infos)
          }).then((unsub) => {
            unsub && unsub();
          }).catch(console.error)
        }

        setTimeout(fetchInfo, 100);
      }
    },
    [walletKey],
  );

  return (
    <WalletContext.Provider value={walletContext}>
      <OpenSelectWallet.Provider value={selectWalletContext}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout/>}>
              <Route index element={<Welcome/>}/>
              <Route path="/welcome" element={<Welcome/>}/>
              <Route path="/account-list" element={<AccountList/>}/>
            </Route>
          </Routes>
        </BrowserRouter>
      </OpenSelectWallet.Provider>
    </WalletContext.Provider>
  );
}

export default App;
