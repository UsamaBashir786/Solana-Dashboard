import { useState } from 'react';
import { Send, CheckCircle, XCircle } from 'lucide-react';
import { sendSol } from '../utils/solana';

const SendSol = ({ publicKey, signTransaction }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validateInputs = () => {
    if (!recipient.trim()) {
      setMessage({ type: 'error', text: 'Recipient address is required' });
      return false;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return false;
    }
    
    if (recipient.length < 32 || recipient.length > 44) {
      setMessage({ type: 'error', text: 'Invalid Solana address format' });
      return false;
    }
    
    return true;
  };

  const handleSend = async () => {
    if (!validateInputs()) return;
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const result = await sendSol(publicKey, recipient, parseFloat(amount), signTransaction);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `Success! TX: ${result.signature.slice(0, 12)}...`
        });
        setRecipient('');
        setAmount('');
      } else {
        setMessage({
          type: 'error',
          text: `Failed: ${result.error}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-4 md:p-6 mb-6 md:mb-8">
      <div className="flex items-start md:items-center mb-4 md:mb-6">
        <div className="p-2 md:p-3 bg-solana-green/20 rounded-lg md:rounded-xl mr-3 md:mr-4 flex-shrink-0">
          <Send className="h-4 w-4 md:h-6 md:w-6 text-solana-green" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold">Send SOL</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Transfer SOL to another wallet</p>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter Solana wallet address"
            className="input-field w-full text-sm md:text-base"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 md:mb-2">
            Amount (SOL)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="input-field w-full text-sm md:text-base"
            disabled={loading}
          />
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
            Transaction fee: ~0.000005 SOL
          </p>
        </div>

        {message.text && (
          <div className={`p-3 md:p-4 rounded-lg md:rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30' 
              : 'bg-red-500/10 border border-red-500/30'
          }`}>
            <div className="flex items-center space-x-1.5 md:space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-500 flex-shrink-0" />
              )}
              <p className={`text-xs md:text-sm ${message.type === 'success' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={loading || !publicKey}
          className="btn-primary w-full flex items-center justify-center space-x-1.5 md:space-x-2 text-sm md:text-base py-2.5 md:py-3"
        >
          {loading ? (
            <>
              <div className="h-3 w-3 md:h-4 md:w-4 border-2 border-solana-dark border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Send className="h-3 w-3 md:h-4 md:w-4" />
              <span>Send SOL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SendSol;