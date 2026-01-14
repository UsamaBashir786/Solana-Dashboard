import { useState, useEffect } from 'react';
import { Wallet, RefreshCw, TrendingUp, Coins, Loader2 } from 'lucide-react';
import { getBalance, formatBalance } from '../utils/solana';

const WalletCard = ({ publicKey }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usdValue, setUsdValue] = useState(0);

  const fetchBalance = async (isManualRefresh = false) => {
    if (!publicKey) {
      setBalance(0);
      setUsdValue(0);
      setLoading(false);
      return;
    }
    
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const lamports = await getBalance(publicKey);
      setBalance(lamports);
      
      const solPrice = 100;
      setUsdValue((lamports / 1e9) * solPrice);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(0);
      setUsdValue(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <NoWalletCard />
        <NoWalletCard />
        <NetworkStatsCard />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      <BalanceCard 
        balance={balance}
        usdValue={usdValue}
        loading={loading}
        refreshing={refreshing}
        fetchBalance={fetchBalance}
      />
      
      <WalletInfoCard 
        publicKey={publicKey}
        loading={loading}
      />
      
      <NetworkStatsCard />
    </div>
  );
};

const NoWalletCard = () => (
  <div className="stat-card">
    <div className="flex items-center mb-3 md:mb-4">
      <IconWrapper color="purple">
        <Wallet className="h-4 w-4 md:h-6 md:w-6 text-gray-400" />
      </IconWrapper>
    </div>
    <CardTitle>Wallet Status</CardTitle>
    <p className="text-gray-600 dark:text-gray-400">Connect wallet to view</p>
  </div>
);

const BalanceCard = ({ balance, usdValue, loading, refreshing, fetchBalance }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between mb-3 md:mb-4">
      <IconWrapper color="purple">
        <Coins className="h-4 w-4 md:h-6 md:w-6 text-solana-purple" />
      </IconWrapper>
      <RefreshButton refreshing={refreshing} loading={loading} fetchBalance={fetchBalance} />
    </div>
    <CardTitle>SOL Balance</CardTitle>
    
    {loading && !refreshing ? (
      <BalanceSkeleton />
    ) : (
      <>
        <BalanceDisplay balance={balance} />
        <USDValueDisplay usdValue={usdValue} />
      </>
    )}
  </div>
);

const WalletInfoCard = ({ publicKey, loading }) => {
  const formatAddress = (address) => {
    if (!address) return 'Not connected';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="stat-card">
      <div className="flex items-center mb-3 md:mb-4">
        <IconWrapper color="green">
          <Wallet className="h-4 w-4 md:h-6 md:w-6 text-solana-green" />
        </IconWrapper>
      </div>
      <CardTitle>Wallet Address</CardTitle>
      
      {loading ? (
        <AddressSkeleton />
      ) : (
        <>
          <AddressDisplay address={formatAddress(publicKey)} />
          <NetworkInfo>Connected to Solana Devnet</NetworkInfo>
        </>
      )}
    </div>
  );
};

const NetworkStatsCard = () => (
  <div className="stat-card">
    <div className="flex items-center mb-3 md:mb-4">
      <IconWrapper color="blue">
        <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-blue-500" />
      </IconWrapper>
    </div>
    <CardTitle>Network Status</CardTitle>
    
    <StatusIndicator />
    <StatText>Transactions: ~0.5s</StatText>
    <StatText>Fee: ≈ $0.00025</StatText>
  </div>
);

// Rest of the helper components remain the same...
const IconWrapper = ({ color, children }) => {
  const bgColor = {
    purple: 'bg-solana-purple/20',
    green: 'bg-solana-green/20',
    blue: 'bg-blue-500/20'
  }[color] || 'bg-solana-purple/20';

  return (
    <div className={`p-2 md:p-3 ${bgColor} rounded-lg md:rounded-xl`}>
      {children}
    </div>
  );
};

const RefreshButton = ({ refreshing, loading, fetchBalance }) => (
  <button
    onClick={() => fetchBalance(true)}
    disabled={refreshing || loading}
    className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-solana-gray hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
    aria-label="Refresh balance"
  >
    {refreshing ? (
      <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
    ) : (
      <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
    )}
  </button>
);

const CardTitle = ({ children }) => (
  <h3 className="text-sm md:text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2">
    {children}
  </h3>
);

const BalanceSkeleton = () => (
  <div className="space-y-2">
    <div className="h-8 md:h-12 w-32 bg-gray-200 dark:bg-solana-gray rounded-lg animate-pulse"></div>
    <div className="h-4 w-24 bg-gray-200 dark:bg-solana-gray rounded animate-pulse"></div>
  </div>
);

const BalanceDisplay = ({ balance }) => (
  <p className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
    {formatBalance(balance)} SOL
  </p>
);

const USDValueDisplay = ({ usdValue }) => (
  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
    ≈ ${usdValue.toFixed(2)} USD
  </p>
);

const AddressSkeleton = () => (
  <div className="space-y-2">
    <div className="h-6 w-40 bg-gray-200 dark:bg-solana-gray rounded animate-pulse"></div>
    <div className="h-4 w-32 bg-gray-200 dark:bg-solana-gray rounded animate-pulse"></div>
  </div>
);

const AddressDisplay = ({ address }) => (
  <div className="flex items-center">
    <p className="font-mono text-xs md:text-sm bg-gray-100 dark:bg-solana-gray px-2 md:px-3 py-1.5 md:py-2 rounded-lg truncate w-full">
      {address}
    </p>
  </div>
);

const NetworkInfo = ({ children }) => (
  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 md:mt-4">{children}</p>
);

const StatusIndicator = () => (
  <div className="flex items-center space-x-1.5 md:space-x-2 mb-1.5 md:mb-2">
    <div className="h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500 rounded-full animate-pulse"></div>
    <p className="text-xs md:text-sm text-green-600 dark:text-green-500 font-semibold">
      Devnet Active
    </p>
  </div>
);

const StatText = ({ children }) => (
  <p className="text-xs text-gray-600 dark:text-gray-400">{children}</p>
);

export default WalletCard;