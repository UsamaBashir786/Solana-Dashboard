import { Menu, X, Wallet, Sun, Moon, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import { useState } from 'react';

const Navbar = ({ 
  walletConnected, 
  publicKey, 
  onConnect, 
  onDisconnect, 
  darkMode, 
  toggleDarkMode,
  connectionError,
  phantomAvailable 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    setReconnecting(true);
    if (!phantomAvailable) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    await onConnect();
    setMobileMenuOpen(false);
    setReconnecting(false);
  };

  const handleDisconnect = async () => {
    await onDisconnect();
    setMobileMenuOpen(false);
  };

  const handleReconnect = async () => {
    setReconnecting(true);
    await handleConnect();
  };

  const ConnectionStatus = () => {
    const savedWallet = localStorage.getItem('solanaWallet');
    
    if (connectionError) {
      return (
        <div className="mt-3 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-500">Connection Error</p>
        </div>
      );
    }
    
    if (savedWallet && !walletConnected) {
      return (
        <div className="mt-3 flex items-center justify-between px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Wallet className="h-3 w-3 text-blue-600 dark:text-blue-500" />
            <p className="text-xs text-blue-600 dark:text-blue-500">
              Wallet detected: {formatAddress(savedWallet)}
            </p>
          </div>
          <button
            onClick={handleReconnect}
            disabled={reconnecting}
            className="text-xs text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors flex items-center space-x-1 disabled:opacity-50"
          >
            {reconnecting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Reconnecting...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3" />
                <span>Reconnect</span>
              </>
            )}
          </button>
        </div>
      );
    }
    
    return null;
  };

  const PhantomWarning = () => {
    if (!phantomAvailable) {
      return (
        <div className="mt-3 flex items-center space-x-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">
              Phantom wallet not detected
            </p>
            <a 
              href="https://phantom.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-yellow-700 dark:text-yellow-400 hover:underline mt-0.5 block"
            >
              Install Phantom extension
            </a>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <nav className="sticky top-0 z-50 glass-card mb-4 md:mb-8">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <LogoSection />
          
          <DesktopNavigation 
            walletConnected={walletConnected}
            publicKey={publicKey}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            phantomAvailable={phantomAvailable}
            formatAddress={formatAddress}
            reconnecting={reconnecting}
          />
          
          <MobileMenuButton 
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </div>

        <ConnectionStatus />
        <PhantomWarning />

        {mobileMenuOpen && (
          <MobileMenu 
            walletConnected={walletConnected}
            publicKey={publicKey}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            phantomAvailable={phantomAvailable}
            formatAddress={formatAddress}
            reconnecting={reconnecting}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        )}
      </div>
    </nav>
  );
};

// Logo Section
const LogoSection = () => (
  <div className="flex items-center space-x-2 md:space-x-3">
    <div className="p-1.5 md:p-2 bg-gradient-to-r from-solana-purple to-solana-green rounded-lg md:rounded-xl">
      <Wallet className="h-6 w-6 md:h-8 md:w-8 text-solana-dark" />
    </div>
    <div>
      <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
        Solana Dashboard
      </h1>
      <p className="hidden md:block text-xs md:text-sm text-gray-600 dark:text-gray-400">
        Professional Web3 Wallet Interface
      </p>
    </div>
  </div>
);

// Desktop Navigation
const DesktopNavigation = ({ 
  walletConnected, 
  publicKey, 
  darkMode, 
  toggleDarkMode, 
  onConnect, 
  onDisconnect,
  phantomAvailable,
  formatAddress,
  reconnecting 
}) => (
  <div className="hidden md:flex items-center space-x-3 md:space-x-4">
    <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    
    {walletConnected ? (
      <div className="flex items-center space-x-3 md:space-x-4">
        <AddressDisplay address={publicKey} formatAddress={formatAddress} />
        <DisconnectButton onDisconnect={onDisconnect} />
      </div>
    ) : (
      <ConnectButton 
        onConnect={onConnect} 
        phantomAvailable={phantomAvailable} 
        reconnecting={reconnecting}
      />
    )}
  </div>
);

// Mobile Menu Button
const MobileMenuButton = ({ mobileMenuOpen, setMobileMenuOpen, darkMode, toggleDarkMode }) => (
  <div className="flex md:hidden items-center space-x-2">
    <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="p-1.5 rounded-lg bg-gray-100 dark:bg-solana-gray hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
      aria-label="Toggle menu"
    >
      {mobileMenuOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </button>
  </div>
);

// Theme Toggle
const ThemeToggle = ({ darkMode, toggleDarkMode }) => (
  <button
    onClick={toggleDarkMode}
    className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-solana-gray hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    {darkMode ? (
      <Sun className="h-4 w-4 md:h-5 md:w-5" />
    ) : (
      <Moon className="h-4 w-4 md:h-5 md:w-5" />
    )}
  </button>
);

// Address Display
const AddressDisplay = ({ address, formatAddress }) => (
  <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 dark:bg-solana-gray rounded-lg md:rounded-xl border border-solana-green/30">
    <p className="text-xs md:text-sm font-mono">{formatAddress(address)}</p>
  </div>
);

// Disconnect Button
const DisconnectButton = ({ onDisconnect }) => (
  <button
    onClick={onDisconnect}
    className="btn-secondary text-sm md:text-base px-4 md:px-6"
  >
    Disconnect
  </button>
);

// Connect Button
const ConnectButton = ({ onConnect, phantomAvailable, reconnecting }) => {
  const savedWallet = localStorage.getItem('solanaWallet');
  
  return (
    <button
      onClick={onConnect}
      className={`btn-primary text-sm md:text-base px-4 md:px-6 ${
        !phantomAvailable ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        reconnecting ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      disabled={!phantomAvailable || reconnecting}
    >
      {reconnecting ? (
        <span className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting...</span>
        </span>
      ) : phantomAvailable ? (
        savedWallet ? 'Reconnect' : 'Connect'
      ) : (
        'Install'
      )}
    </button>
  );
};

// Mobile Menu
const MobileMenu = ({ 
  walletConnected, 
  publicKey, 
  onConnect, 
  onDisconnect, 
  phantomAvailable, 
  formatAddress,
  reconnecting,
  setMobileMenuOpen 
}) => {
  const savedWallet = localStorage.getItem('solanaWallet');

  const handleMobileConnect = async () => {
    await onConnect();
    setMobileMenuOpen(false);
  };

  const handleMobileDisconnect = async () => {
    await onDisconnect();
    setMobileMenuOpen(false);
  };

  return (
    <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
      {walletConnected ? (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Wallet Address</p>
            <div className="px-3 py-2 bg-gray-100 dark:bg-solana-gray rounded-lg border border-solana-green/30">
              <p className="text-xs font-mono break-all">{publicKey || 'Not connected'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleMobileDisconnect}
              className="btn-secondary text-sm py-2.5"
            >
              Disconnect
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('solanaWallet');
                window.location.reload();
              }}
              className="px-4 py-2.5 text-sm bg-gray-100 dark:bg-solana-gray text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              Switch Wallet
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {savedWallet && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-500" />
                <p className="text-xs text-blue-600 dark:text-blue-500 font-medium">
                  Previously connected wallet detected
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Address: {formatAddress(savedWallet)}
              </p>
            </div>
          )}
          
          <button
            onClick={handleMobileConnect}
            className={`w-full btn-primary text-sm py-2.5 ${
              !phantomAvailable ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              reconnecting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={!phantomAvailable || reconnecting}
          >
            {reconnecting ? (
              <span className="flex items-center justify-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </span>
            ) : phantomAvailable ? (
              savedWallet ? 'Reconnect Wallet' : 'Connect Phantom Wallet'
            ) : (
              'Install Phantom'
            )}
          </button>
          
          {savedWallet && (
            <button
              onClick={() => {
                localStorage.removeItem('solanaWallet');
                window.location.reload();
              }}
              className="w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Use different wallet
            </button>
          )}
          
          {!phantomAvailable && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                <p className="text-xs text-yellow-600 dark:text-yellow-500">
                  Phantom wallet extension required
                </p>
              </div>
              <a 
                href="https://phantom.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-yellow-700 dark:text-yellow-400 hover:underline mt-1 block"
              >
                Install Phantom →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;