import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  clusterApiUrl, 
  Transaction, 
  SystemProgram 
} from '@solana/web3.js';

// Use a single persistent connection
let connection;

const getConnection = () => {
  if (!connection) {
    connection = new Connection(
      clusterApiUrl('devnet'), 
      { 
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      }
    );
  }
  return connection;
};

export const formatBalance = (lamports) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
};

export const getBalance = async (publicKey) => {
  try {
    if (!publicKey) return 0;
    
    const conn = getConnection();
    const balance = await conn.getBalance(new PublicKey(publicKey));
    return balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

export const getRecentTransactions = async (publicKey) => {
  try {
    if (!publicKey) return [];
    
    const conn = getConnection();
    const pubKey = new PublicKey(publicKey);
    
    // Get signatures with timeout
    const signatures = await Promise.race([
      conn.getSignaturesForAddress(pubKey, { limit: 5 }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Transaction fetch timeout')), 10000)
      )
    ]);
    
    const transactions = await Promise.all(
      signatures.slice(0, 5).map(async (sig) => {
        try {
          const tx = await conn.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
          });
          
          return {
            signature: sig.signature,
            status: sig.err ? 'Failed' : 'Success',
            timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString() : 'N/A',
            amount: tx?.meta?.postBalances?.[0] - tx?.meta?.preBalances?.[0] || 0,
            fee: tx?.meta?.fee || 0
          };
        } catch (error) {
          console.error('Error fetching transaction details:', error);
          return {
            signature: sig.signature,
            status: 'Unknown',
            timestamp: 'N/A',
            amount: 0,
            fee: 0
          };
        }
      })
    );
    
    return transactions.filter(tx => tx !== null);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const sendSol = async (fromPubkey, toAddress, amount, signTransaction) => {
  try {
    if (!fromPubkey || !toAddress || !amount || amount <= 0) {
      throw new Error('Invalid input parameters');
    }

    if (!signTransaction) {
      throw new Error('Wallet not connected properly');
    }

    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
    
    // Validate addresses
    const fromPubKey = new PublicKey(fromPubkey);
    const toPubKey = new PublicKey(toAddress);
    
    const conn = getConnection();
    const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash();
    
    // Check balance before sending
    const balance = await conn.getBalance(fromPubKey);
    if (balance < lamports) {
      throw new Error(`Insufficient balance. Available: ${formatBalance(balance)} SOL, Required: ${amount} SOL`);
    }
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: fromPubKey,
        toPubkey: toPubKey,
        lamports
      })
    );
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubKey;
    
    const signedTransaction = await signTransaction(transaction);
    const signature = await conn.sendRawTransaction(signedTransaction.serialize());
    
    // Wait for confirmation
    await conn.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight
    });
    
    return { success: true, signature };
  } catch (error) {
    console.error('Error sending SOL:', error);
    return { success: false, error: error.message };
  }
};

export const isPhantomInstalled = () => {
  if (typeof window !== 'undefined') {
    return !!window.phantom?.solana?.isPhantom;
  }
  return false;
};

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.phantom?.solana) {
    return window.phantom.solana;
  }
  return null;
};

export const connectWallet = async () => {
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error('Phantom wallet not installed');
    }
    
    const response = await provider.connect();
    return {
      success: true,
      publicKey: response.publicKey.toString()
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};