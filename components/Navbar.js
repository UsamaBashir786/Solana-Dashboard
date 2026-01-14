import { useState, useEffect } from 'react';
import { Wallet, Sun, Moon, Menu, X } from 'lucide-react';
import { getProvider, isPhantomInstalled } from '../utils/solana';

const Navbar = ({ walletConnected, publicKey, onConnect, onDisconnect, darkMode, toggleDarkMode }) => {
  const [phantomAvailable, setPhantomAvailable] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setPhantomAvailable(isPhantomInstalled());
  }, []);

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

  return (
    <nav className="sticky top-0 z-50 glass-card mb-4 md:mb-8">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="p-1.5 md:p-2 bg-gradient-to-r from-solana-purple to-solana-green rounded-lg md:rounded-xl">
              <Wallet className="h-6 w-6 md:h-8 md:w-8 text-solana-dark" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                Solana Dashboard
              </h1>
              <p className="hidden md:block text-xs md:text-sm text-gray-600 dark:text-gray-400">Professional Web3 Wallet Interface</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 md:space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-solana-gray hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <Moon className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </button>

            {walletConnected ? (
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 dark:bg-solana-gray rounded-lg md:rounded-xl border border-solana-green/30">
                  <p className="text-xs md:text-sm font-mono">{formatAddress(publicKey)}</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="btn-secondary text-sm md:text-base"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className={`btn-primary text-sm md:text-base ${!phantomAvailable ? 'opacity-50' : ''}`}
                disabled={!phantomAvailable}
              >
                {phantomAvailable ? 'Connect' : 'Install'}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-solana-gray hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            
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
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
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
                    onClick={handleDisconnect}
                    className="flex-1 btn-secondary text-sm py-2.5"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleConnect}
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
        )}
      </div>
    </nav>
  );
};

export default Navbar;