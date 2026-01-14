import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle, XCircle, Clock, Hash, RefreshCw, Loader2 } from 'lucide-react';
import { getRecentTransactions } from '../utils/solana';

const TransactionsTable = ({ publicKey }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async (isManualRefresh = false) => {
    if (!publicKey) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const txs = await getRecentTransactions(publicKey);
      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    
    const interval = setInterval(fetchTransactions, 15000);
    return () => clearInterval(interval);
  }, [publicKey]);

  const formatAmount = (lamports) => {
    const sol = lamports / 1e9;
    if (sol === 0) return '0';
    return sol > 0 ? `+${sol.toFixed(4)}` : `${sol.toFixed(4)}`;
  };

  const formatSignature = (sig) => {
    if (!sig) return '';
    return `${sig.slice(0, 4)}...${sig.slice(-4)}`;
  };

  // Skeleton Loaders
  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 md:h-16 bg-gray-100 dark:bg-solana-gray rounded-lg md:rounded-xl animate-pulse"></div>
      ))}
    </div>
  );

  const MobileCardSkeleton = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3 bg-gray-100 dark:bg-solana-gray rounded-lg animate-pulse">
          <div className="flex justify-between mb-2">
            <div className="h-4 w-16 bg-gray-200 dark:bg-solana-gray/50 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 dark:bg-solana-gray/50 rounded"></div>
          </div>
          <div className="h-3 w-32 bg-gray-200 dark:bg-solana-gray/50 rounded mb-2"></div>
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-gray-200 dark:bg-solana-gray/50 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 dark:bg-solana-gray/50 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const NoTransactionsState = () => (
    <div className="text-center py-8 md:py-12">
      <Clock className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">No transactions found</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Send your first transaction to see history</p>
    </div>
  );

  const NotConnectedState = () => (
    <div className="text-center py-8 md:py-12">
      <Clock className="h-8 w-8 md:h-12 md:w-12 text-gray-400 mx-auto mb-3 md:mb-4" />
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Connect wallet to view transactions</p>
    </div>
  );

  return (
    <div className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center">
          <div className="p-2 md:p-3 bg-solana-purple/20 rounded-lg md:rounded-xl mr-3 md:mr-4">
            <Hash className="h-4 w-4 md:h-6 md:w-6 text-solana-purple" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold">Recent Transactions</h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
              {loading ? 'Loading...' : `${transactions.length} transactions`}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchTransactions(true)}
          disabled={loading || refreshing || !publicKey}
          className="p-1.5 md:p-2 rounded-lg bg-gray-100 dark:bg-solana-gray hover:bg-gray-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
          aria-label="Refresh transactions"
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </button>
      </div>

      {!publicKey ? (
        <NotConnectedState />
      ) : loading ? (
        <>
          <div className="hidden md:block">
            <TableSkeleton />
          </div>
          <div className="md:hidden">
            <MobileCardSkeleton />
          </div>
        </>
      ) : transactions.length === 0 ? (
        <NoTransactionsState />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10">
                  <th className="text-left py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Signature</th>
                  <th className="text-left py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Time</th>
                  <th className="text-left py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">Fee</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {tx.status === 'Success' ? (
                          <>
                            <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-500" />
                            <span className="text-xs md:text-sm text-green-600 dark:text-green-500">Success</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-500" />
                            <span className="text-xs md:text-sm text-red-600 dark:text-red-500">Failed</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs md:text-sm">
                      <div className="flex items-center space-x-2">
                        <span>{formatSignature(tx.signature)}</span>
                        <a
                          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-solana-green hover:text-solana-purple transition-colors"
                          aria-label="View transaction"
                        >
                          <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs md:text-sm ${tx.amount > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                        {formatAmount(tx.amount)} SOL
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {tx.timestamp.split(',')[0]}
                    </td>
                    <td className="py-3 px-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      {(tx.fee / 1e9).toFixed(6)} SOL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {transactions.map((tx, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-solana-gray rounded-lg border border-gray-200 dark:border-white/10">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    {tx.status === 'Success' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-500 font-medium">Success</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                        <span className="text-xs text-red-600 dark:text-red-500 font-medium">Failed</span>
                      </>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${tx.amount > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {formatAmount(tx.amount)} SOL
                  </span>
                </div>
                
                <div className="mb-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Transaction ID</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono truncate mr-2">{tx.signature.slice(0, 12)}...</p>
                    <a
                      href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-solana-green hover:text-solana-purple transition-colors flex-shrink-0"
                      aria-label="View transaction"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <div>
                    <p>{tx.timestamp.split(',')[0]}</p>
                  </div>
                  <div>
                    <p>Fee: {(tx.fee / 1e9).toFixed(6)} SOL</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionsTable;