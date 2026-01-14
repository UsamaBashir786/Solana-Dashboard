import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import WalletCard from '../components/WalletCard';
import SendSol from '../components/SendSol';
import TransactionsTable from '../components/TransactionsTable';
import { getProvider, isPhantomInstalled } from '../utils/solana';
import { AlertTriangle, Info, Wallet, Loader2 } from 'lucide-react';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [provider, setProvider] = useState(null);
  const [phantomAvailable, setPhantomAvailable] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Apply dark mode class on initial load
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const initializeWallet = async () => {
      setInitializing(true);
      setConnectionError(null);

      try {
        // Check if Phantom is installed
        const available = isPhantomInstalled();
        setPhantomAvailable(available);
        
        if (!available) {
          setInitializing(false);
          return;
        }

        const phantomProvider = getProvider();
        setProvider(phantomProvider);
        
        // Try eager connection if previously connected 
        if (phantomProvider.isConnected) {
          const response = await phantomProvider.connect({ onlyIfTrusted: true });
          setWalletConnected(true);
          setPublicKey(response.publicKey.toString());
        }
        
        // Listen for account changes 
        phantomProvider.on('accountChanged', (newPublicKey) => {
          if (newPublicKey) {
            setPublicKey(newPublicKey.toString());
          } else {
            handleDisconnect();
          }
        });
        
        // Listen for disconnect events 
        phantomProvider.on('disconnect', () => {
          handleDisconnect();
        });
        
      } catch (error) {
        console.error('Initialization error:', error);
        setConnectionError('Failed to initialize wallet connection');
      } finally {
        setInitializing(false);
      }
    };

    initializeWallet();
    
    // Re-check when window changes
    window.addEventListener('load', () => {
      setPhantomAvailable(isPhantomInstalled());
    });
    
    return () => window.removeEventListener('load', () => {
      setPhantomAvailable(isPhantomInstalled());
    });
  }, [darkMode]);

  const handleConnect = async () => {
    if (!phantomAvailable) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    
    setConnectionError(null);
    
    try {
      const response = await provider.connect();
      setWalletConnected(true);
      setPublicKey(response.publicKey.toString());
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await provider.disconnect();
      setWalletConnected(false);
      setPublicKey(null);
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  const signTransaction = async (transaction) => {
    if (!provider) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const signedTransaction = await provider.signTransaction(transaction);
      return signedTransaction;
    } catch (error) {
      console.error('Signing error:', error);
      throw error;
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', newDarkMode);
  };

  // Global Loading State
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-solana-dark transition-colors duration-200">
        <div className="text-center">
          <div className="inline-block p-6 bg-gradient-to-r from-solana-purple/20 to-solana-green/20 rounded-2xl mb-6">
            <Loader2 className="h-16 w-16 text-solana-green animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Initializing Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Setting up Solana connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-solana-dark">
      <Head>
        <title>Solana Wallet Dashboard | Professional Web3 Interface</title>
        <meta name="description" content="Professional Solana wallet dashboard with Phantom integration" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-4 md:py-8">
        <Navbar
          walletConnected={walletConnected}
          publicKey={publicKey}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {connectionError && (
          <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl md:rounded-2xl">
            <div className="flex items-start md:items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-red-500/20 rounded-lg md:rounded-xl flex-shrink-0">
                <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-red-600 dark:text-red-500">Connection Error</h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mt-1">
                  {connectionError}
                </p>
              </div>
            </div>
          </div>
        )}

        {!phantomAvailable && (
          <div className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl md:rounded-2xl">
            <div className="flex items-start md:items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-yellow-500/20 rounded-lg md:rounded-xl flex-shrink-0">
                <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-yellow-600 dark:text-yellow-500">Phantom Wallet Required</h3>
                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mt-1">
                  Please install the Phantom wallet extension to use this dashboard. 
                  <a 
                    href="https://phantom.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-solana-green hover:underline ml-1 md:ml-2"
                  >
                    Download Phantom
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        {walletConnected ? (
          <>
            <WalletCard publicKey={publicKey} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <SendSol 
                publicKey={publicKey} 
                signTransaction={signTransaction}
              />
              
              <div className="glass-card p-4 md:p-6">
                <div className="flex items-start md:items-center mb-4 md:mb-6">
                  <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg md:rounded-xl mr-3 md:mr-4 flex-shrink-0">
                    <Info className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">Quick Tips</h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Using the dashboard</p>
                  </div>
                </div>
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-start space-x-2 md:space-x-3">
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-solana-green rounded-full mt-2 md:mt-2.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm md:text-base">Devnet SOL</p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Get free test SOL from faucets like solfaucet.com
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2 md:space-x-3">
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-solana-green rounded-full mt-2 md:mt-2.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm md:text-base">Transaction Speed</p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Devnet transactions confirm in ~0.5 seconds
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2 md:space-x-3">
                    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-solana-green rounded-full mt-2 md:mt-2.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm md:text-base">Security</p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Never share your private key. Phantom handles signing securely.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            
            <TransactionsTable publicKey={publicKey} />
          </>
        ) : phantomAvailable ? (
          <div className="text-center py-12 md:py-20">
            <div className="max-w-md mx-auto px-4">
              <div className="p-4 md:p-6 bg-gradient-to-r from-solana-purple/20 to-solana-green/20 rounded-xl md:rounded-2xl inline-block mb-6 md:mb-8">
                <Wallet className="h-16 w-16 md:h-24 md:w-24 text-gray-800 dark:text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-800 dark:text-white">Connect Your Phantom Wallet</h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
                Connect your Phantom wallet to access your SOL balance, send transactions, and view your transaction history on the Solana devnet.
              </p>
              <button
                onClick={handleConnect}
                className="btn-primary text-base md:text-lg px-6 py-3 md:px-8 md:py-4 w-full md:w-auto"
              >
                Connect Phantom Wallet
              </button>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-6">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 dark:border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">Solana Wallet Dashboard v1.0</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Built for Web3 recruiters and hiring managers</p>
            </div>
            <div className="flex space-x-4 md:space-x-6">
              <a 
                href="https://solana.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-solana-green transition-colors"
              >
                Solana Docs
              </a>
              <a 
                href="https://phantom.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-solana-green transition-colors"
              >
                Phantom Docs
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-solana-green transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4 md:mt-8">
            This dashboard uses Solana Devnet for testing purposes. No real funds are involved.
          </p>
        </div>
      </footer>
    </div>
  );
}