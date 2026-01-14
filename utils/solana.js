import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  clusterApiUrl, 
  Transaction, 
  SystemProgram 
} from '@solana/web3.js';

// Connect to Solana devnet
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Format SOL balance from lamports
export const formatBalance = (lamports) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
};

// Get SOL balance for a public key
export const getBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

// Get recent transactions for a public key
export const getRecentTransactions = async (publicKey) => {
  try {
    const pubKey = new PublicKey(publicKey);
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 5 });
    
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        
        return {
          signature: sig.signature,
          status: sig.err ? 'Failed' : 'Success',
          timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toLocaleString() : 'N/A',
          amount: tx?.meta?.postBalances?.[0] - tx?.meta?.preBalances?.[0] || 0,
          fee: tx?.meta?.fee || 0
        };
      })
    );
    
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// Send SOL transaction
export const sendSol = async (fromPubkey, toAddress, amount, signTransaction) => {
  try {
    // Input validation
    if (!fromPubkey || !toAddress || !amount || amount <= 0) {
      throw new Error('Invalid input parameters');
    }

    if (!signTransaction) {
      throw new Error('Wallet not connected properly');
    }

    // Convert SOL to lamports
    const lamports = amount * LAMPORTS_PER_SOL;
    
    // Get latest blockhash for transaction
    const { blockhash } = await connection.getLatestBlockhash();
    
    // Create transfer instruction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(fromPubkey),
        toPubkey: new PublicKey(toAddress),
        lamports
      })
    );
    
    // Set transaction parameters
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(fromPubkey);
    
    // Sign and send transaction
    const signedTransaction = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    return { success: true, signature };
  } catch (error) {
    console.error('Error sending SOL:', error);
    return { success: false, error: error.message };
  }
};

// Check if Phantom wallet is installed
export const isPhantomInstalled = () => {
  if (typeof window !== 'undefined') {
    return window.phantom?.solana?.isPhantom || false;
  }
  return false;
};

// Get Phantom provider
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.phantom?.solana) {
    return window.phantom.solana;
  }
  return null;
};