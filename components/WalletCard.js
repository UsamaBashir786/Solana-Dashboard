import { useState, useEffect } from 'react';
import { Wallet, RefreshCw, TrendingUp, Coins } from 'lucide-react';
import { getBalance, formatBalance } from '../utils/solana';

const WalletCard = ({ publicKey }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [usdValue, setUsdValue] = useState(0);

  const fetchBalance = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      const lamports = await getBalance(publicKey);
      setBalance(lamports);
      
      // Mock USD conversion
      const solPrice = 100;
      setUsdValue((lamports / 1e9) * solPrice);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Balance Card */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="p-2 md:p-3 bg-solana-purple/20 rounded-lg md:rounded-xl">
            <Coins className="h-4 w-4 md:h-6 md:w-6 text-solana-purple" />
          </div>
          <button
            onClick={fetchBalance}
            disabled={loading}
            className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-solana-gray hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Refresh balance"
          >
            <RefreshCw className={`h-3 w-3 md:h-4 md:w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <h3 className="text-sm md:text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2">SOL Balance</h3>
        {loading ? (
          <div className="h-8 md:h-12 w-24 md:w-32 bg-gray-100 dark:bg-solana-gray rounded animate-pulse"></div>
        ) : (
          <>
            <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {formatBalance(balance)} SOL
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 md:mt-2">≈ ${usdValue.toFixed(2)} USD</p>
          </>
        )}
      </div>

      {/* Wallet Info Card */}
      <div className="stat-card">
        <div className="flex items-center mb-3 md:mb-4">
          <div className="p-2 md:p-3 bg-solana-green/20 rounded-lg md:rounded-xl">
            <Wallet className="h-4 w-4 md:h-6 md:w-6 text-solana-green" />
          </div>
        </div>
        <h3 className="text-sm md:text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2">Wallet Address</h3>
        <div className="flex items-center">
          <p className="font-mono text-xs md:text-sm bg-gray-100 dark:bg-solana-gray px-2 md:px-3 py-1.5 md:py-2 rounded-lg truncate w-full">
            {publicKey ? formatAddress(publicKey) : 'Not connected'}
          </p>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 md:mt-4">Connected to Solana Devnet</p>
      </div>

      {/* Network Stats Card */}
      <div className="stat-card">
        <div className="flex items-center mb-3 md:mb-4">
          <div className="p-2 md:p-3 bg-blue-500/20 rounded-lg md:rounded-xl">
            <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-blue-500" />
          </div>
        </div>
        <h3 className="text-sm md:text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2">Network Status</h3>
        <div className="flex items-center space-x-1.5 md:space-x-2 mb-1.5 md:mb-2">
          <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500 rounded-full animate-pulse"></div>
          <p className="text-xs md:text-sm text-green-600 dark:text-green-500 font-semibold">Devnet Active</p>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">Transactions: ~0.5s</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Fee: ≈ $0.00025</p>
      </div>
    </div>
  );
};

export default WalletCard;