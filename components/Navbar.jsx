import { Menu, X, Wallet, Sun, Moon } from 'lucide-react';
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

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    if (!phantomAvailable) {
      window.open('https://phantom.app/', '_blank');
      return;
    }
    await onConnect();
    setMobileMenuOpen(false);
  };

  const handleDisconnect = async () => {
    await onDisconnect();
    setMobileMenuOpen(false);
  };

  const ConnectionStatus = () => {
    if (connectionError) {
      return (
        <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-500">Connection Error</p>
        </div>
      );
    }
    
    if (!phantomAvailable) {
      return (
        <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-600 dark:text-yellow-500">Install Phantom</p>
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
          />
          
          <MobileMenuButton 
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </div>

        <ConnectionStatus />

        {mobileMenuOpen && (
          <MobileMenu 
            walletConnected={walletConnected}
            publicKey={publicKey}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            phantomAvailable={phantomAvailable}
            formatAddress={formatAddress}
          />
        )}
      </div>
    </nav>
  );
};

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

const DesktopNavigation = ({ 
  walletConnected, 
  publicKey, 
  darkMode, 
  toggleDarkMode, 
  onConnect, 
  onDisconnect,
  phantomAvailable,
  formatAddress 
}) => (
  <div className="hidden md:flex items-center space-x-3 md:space-x-4">
    <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
    
    {walletConnected ? (
      <div className="flex items-center space-x-3 md:space-x-4">
        <AddressDisplay address={publicKey} formatAddress={formatAddress} />
        <DisconnectButton onDisconnect={onDisconnect} />
      </div>
    ) : (
      <ConnectButton onConnect={onConnect} phantomAvailable={phantomAvailable} />
    )}
  </div>
);

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

const ThemeToggle = ({ darkMode, toggleDarkMode }) => (
  <button
    onClick={toggleDarkMode}
    className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-solana-gray hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    {darkMode ? (
      <Sun className="h-4 w-4 md:h-5 md:w-5" />
    ) : (
      <Moon className="h-4 w-4 md:h-5 md:w-5" />
    )}
  </button>
);

const AddressDisplay = ({ address, formatAddress }) => (
  <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 dark:bg-solana-gray rounded-lg md:rounded-xl border border-solana-green/30">
    <p className="text-xs md:text-sm font-mono">{formatAddress(address)}</p>
  </div>
);

const DisconnectButton = ({ onDisconnect }) => (
  <button
    onClick={onDisconnect}
    className="btn-secondary text-sm md:text-base"
  >
    Disconnect
  </button>
);

const ConnectButton = ({ onConnect, phantomAvailable }) => (
  <button
    onClick={onConnect}
    className={`btn-primary text-sm md:text-base ${!phantomAvailable ? 'opacity-50' : ''}`}
    disabled={!phantomAvailable}
  >
    {phantomAvailable ? 'Connect' : 'Install'}
  </button>
);

const MobileMenu = ({ walletConnected, publicKey, onConnect, onDisconnect, phantomAvailable, formatAddress }) => (
  <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
    {walletConnected ? (
      <div className="space-y-3">
        <div className="flex flex-col space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">Wallet Address</p>
          <div className="px-3 py-2 bg-gray-100 dark:bg-solana-gray rounded-lg border border-solana-green/30">
            <p className="text-xs font-mono break-all">{publicKey || 'Not connected'}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onDisconnect}
            className="flex-1 btn-secondary text-sm py-2.5"
          >
            Disconnect
          </button>
        </div>
      </div>
    ) : (
      <div className="space-y-3">
        <button
          onClick={onConnect}
          className={`w-full btn-primary text-sm py-2.5 ${!phantomAvailable ? 'opacity-50' : ''}`}
          disabled={!phantomAvailable}
        >
          {phantomAvailable ? 'Connect Phantom Wallet' : 'Install Phantom'}
        </button>
        {!phantomAvailable && (
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Need Phantom wallet to connect
          </p>
        )}
      </div>
    )}
  </div>
);

export default Navbar;