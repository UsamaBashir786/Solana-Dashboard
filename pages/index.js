import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import WalletCard from '../components/WalletCard';
import SendSol from '../components/SendSol';
import TransactionsTable from '../components/TransactionsTable';
import QuickTips from '../components/QuickTips';
import { getProvider, isPhantomInstalled } from '../utils/solana';
import { saveWalletState, loadWalletState, clearWalletState } from '../utils/walletPersist';
import { Loader2, Wallet, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [provider, setProvider] = useState(null);
  const [phantomAvailable, setPhantomAvailable] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    } else if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Initialize wallet connection
  useEffect(() => {
    const initializeWallet = async () => {
      setInitializing(true);
      setConnectionError(null);

      try {
        const available = isPhantomInstalled();
        setPhantomAvailable(available);
        
        if (!available) {
          setInitializing(false);
          return;
        }

        const phantomProvider = getProvider();
        setProvider(phantomProvider);
        
        // Load previous wallet state
        const storedState = loadWalletState();
        const hasStoredWallet = storedState !== null;
        
        if (hasStoredWallet && phantomProvider) {
          try {
            console.log('Attempting silent reconnect with:', storedState.publicKey);
            
            // First check if wallet is already connected
            if (phantomProvider.publicKey) {
              // Wallet already connected (from previous session)
              const pubKeyStr = phantomProvider.publicKey.toString();
              setWalletConnected(true);
              setPublicKey(pubKeyStr);
              saveWalletState(pubKeyStr);
              console.log('Wallet already connected:', pubKeyStr);
            } else {
              // Attempt silent reconnect
              await phantomProvider.connect({ onlyIfTrusted: true });
              
              if (phantomProvider.publicKey) {
                const pubKeyStr = phantomProvider.publicKey.toString();
                setWalletConnected(true);
                setPublicKey(pubKeyStr);
                saveWalletState(pubKeyStr);
                console.log('Silent reconnect successful:', pubKeyStr);
              }
            }
          } catch (silentError) {
            console.log('Silent reconnect failed, user interaction required');
            // Don't clear state - keep it for manual reconnect
            setWalletConnected(false);
            setPublicKey(null);
            
            // Set a helpful message
            setConnectionError('Wallet detected. Click "Reconnect" to continue.');
          }
        }
        
        // Set up event listeners
        phantomProvider.on('accountChanged', (newPublicKey) => {
          if (newPublicKey) {
            const pubKeyStr = newPublicKey.toString();
            setPublicKey(pubKeyStr);
            setWalletConnected(true);
            saveWalletState(pubKeyStr);
          } else {
            handleDisconnect();
          }
        });
        
        phantomProvider.on('disconnect', () => {
          handleDisconnect();
        });
        
        phantomProvider.on('connect', () => {
          console.log('Phantom wallet connected');
          if (phantomProvider.publicKey) {
            const pubKeyStr = phantomProvider.publicKey.toString();
            saveWalletState(pubKeyStr);
          }
        });
        
      } catch (error) {
        console.error('Initialization error:', error);
        setConnectionError('Failed to initialize wallet connection');
      } finally {
        setInitializing(false);
      }
    };

    initializeWallet();
    
    return () => {
      if (provider) {
        provider.removeAllListeners();
      }
    };
  }, []);

  const handleConnect = async () => {
    if (!phantomAvailable) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    
    setConnectionError(null);
    
    try {
      const response = await provider.connect();
      const pubKeyStr = response.publicKey.toString();
      
      setWalletConnected(true);
      setPublicKey(pubKeyStr);
      
      // Save to persistent storage
      saveWalletState(pubKeyStr);
      
      console.log('Manual connect successful:', pubKeyStr);
    } catch (error) {
      console.error('Connection error:', error);
      
      if (error.code === 4001) {
        // User rejected the connection request
        setConnectionError('Connection rejected by user');
      } else {
        setConnectionError('Failed to connect wallet. Please try again.');
      }
      
      // Don't clear stored state on connection errors
      // This allows retry without losing the previous wallet
    }
  };

  const handleDisconnect = async () => {
    try {
      if (provider && provider.disconnect) {
        await provider.disconnect();
      }
      setWalletConnected(false);
      setPublicKey(null);
      
      // Clear persistent storage
      clearWalletState();
      
      console.log('Wallet disconnected and state cleared');
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

  const WalletNotConnectedView = () => {
    const hasSavedWallet = loadWalletState() !== null;
    
    return (
      <div className="text-center py-12 md:py-20">
        <div className="max-w-md mx-auto px-4">
          <div className="p-4 md:p-6 bg-gradient-to-r from-solana-purple/20 to-solana-green/20 rounded-xl md:rounded-2xl inline-block mb-6 md:mb-8">
            <Wallet className="h-16 w-16 md:h-24 md:w-24 text-gray-800 dark:text-white" />
          </div>
          
          {hasSavedWallet ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-800 dark:text-white">
                Welcome Back!
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
                Your wallet was detected. Click below to reconnect and continue.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleConnect}
                  className="btn-primary text-base md:text-lg px-6 py-3 md:px-8 md:py-4 w-full"
                >
                  Reconnect Wallet
                </button>
                <button
                  onClick={handleDisconnect}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Use a different wallet
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-800 dark:text-white">
                Connect Your Phantom Wallet
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-6 md:mb-8">
                Connect your Phantom wallet to access your SOL balance, send transactions, and view your transaction history on the Solana devnet.
              </p>
              <button
                onClick={handleConnect}
                className="btn-primary text-base md:text-lg px-6 py-3 md:px-8 md:py-4 w-full"
              >
                Connect Phantom Wallet
              </button>
            </>
          )}
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-4 md:mt-6">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    );
  };

  const LoadingView = () => {
    const hasSavedWallet = loadWalletState() !== null;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-solana-dark transition-colors duration-200">
        <div className="text-center">
          <div className="inline-block p-6 bg-gradient-to-r from-solana-purple/20 to-solana-green/20 rounded-2xl mb-6">
            <Loader2 className="h-16 w-16 text-solana-green animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {hasSavedWallet ? 'Reconnecting Wallet...' : 'Initializing Dashboard'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {hasSavedWallet 
              ? 'Restoring your wallet connection...' 
              : 'Setting up Solana connection...'}
          </p>
        </div>
      </div>
    );
  };

  if (initializing) return <LoadingView />;

  return (
    <div className="min-h-screen transition-colors duration-200 bg-gray-50 dark:bg-solana-dark">
    <Head>
    <title>Solana Wallet Dashboard</title>
    <meta name="description" content="Professional Solana wallet dashboard with Phantom integration" />
    
    {/* Use the Color version as main favicon */}
    <link rel="icon" href="/Solana-Logomark-Color.svg" type="image/svg+xml" />
    
    {/* Optional: Create dynamic favicon based on dark/light mode */}
    {darkMode ? (
      <link rel="icon" href="/Solana-Logomark-White.svg" type="image/svg+xml" />
    ) : (
      <link rel="icon" href="/Solana-Logomark-Black.svg" type="image/svg+xml" />
    )}
    
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  </Head>

      <main className="container mx-auto px-4 py-4 md:py-8">
        <Navbar
          walletConnected={walletConnected}
          publicKey={publicKey}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          connectionError={connectionError}
          phantomAvailable={phantomAvailable}
        />

        {!phantomAvailable ? (
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
        ) : walletConnected ? (
          <>
            <WalletCard publicKey={publicKey} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <SendSol 
                publicKey={publicKey} 
                signTransaction={signTransaction}
              />
              
              <QuickTips />
            </div>
            
            <TransactionsTable publicKey={publicKey} />
          </>
        ) : (
          <WalletNotConnectedView />
        )}
      </main>

      <Footer />
    </div>
  );
}

const Footer = () => (
  <footer className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 dark:border-white/10">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          <p className="text-sm text-gray-600 dark:text-gray-400">Solana Wallet Dashboard v1.0</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">Professional Web3 Portfolio Project</p>
        </div>
        <div className="flex space-x-4 md:space-x-6">
          <FooterLink href="https://solana.com" text="Solana Docs" />
          <FooterLink href="https://phantom.app" text="Phantom Docs" />
          <FooterLink href="https://github.com" text="GitHub" />
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4 md:mt-8">
        This dashboard uses Solana Devnet for testing purposes. No real funds are involved.
      </p>
    </div>
  </footer>
);

const FooterLink = ({ href, text }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-sm text-gray-600 dark:text-gray-400 hover:text-solana-green transition-colors"
  >
    {text}
  </a>
);