import { 
  Connection, 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  clusterApiUrl, 
  Transaction, 
  SystemProgram 
} from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const formatBalance = (lamports) => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
};

export const getBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

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

export const sendSol = async (fromPubkey, toAddress, amount, signTransaction) => {
  try {
    if (!fromPubkey || !toAddress || !amount || amount <= 0) {
      throw new Error('Invalid input parameters');
    }

    if (!signTransaction) {
      throw new Error('Wallet not connected properly');
    }

    const lamports = amount * LAMPORTS_PER_SOL;
    const { blockhash } = await connection.getLatestBlockhash();
    
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(fromPubkey),
        toPubkey: new PublicKey(toAddress),
        lamports
      })
    );
    
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(fromPubkey);
    
    const signedTransaction = await signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    await connection.confirmTransaction(signature);
    
    return { success: true, signature };
  } catch (error) {
    console.error('Error sending SOL:', error);
    return { success: false, error: error.message };
  }
};

export const isPhantomInstalled = () => {
  if (typeof window !== 'undefined') {
    return window.phantom?.solana?.isPhantom || false;
  }
  return false;
};

export const getProvider = () => {
  if (typeof window !== 'undefined' && window.phantom?.solana) {
    return window.phantom.solana;
  }
  return null;
};