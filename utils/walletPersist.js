// utils/walletPersist.js

// Key for storing wallet state
const WALLET_STORAGE_KEY = 'solana_wallet_state';

// Save wallet connection state
export const saveWalletState = (publicKey, timestamp) => {
  if (!publicKey) {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    return;
  }
  
  const state = {
    publicKey,
    timestamp: timestamp || Date.now(),
    version: '1.0'
  };
  
  localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(state));
};

// Load wallet state
export const loadWalletState = () => {
  try {
    const stored = localStorage.getItem(WALLET_STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored);
    
    // Check if state is less than 24 hours old
    const isFresh = Date.now() - state.timestamp < 24 * 60 * 60 * 1000;
    
    return isFresh ? state : null;
  } catch (error) {
    console.error('Error loading wallet state:', error);
    return null;
  }
};

// Clear wallet state
export const clearWalletState = () => {
  localStorage.removeItem(WALLET_STORAGE_KEY);
};

// Check if we should auto-reconnect
export const shouldAutoReconnect = () => {
  if (typeof window === 'undefined') return false;
  
  // Check if localStorage is available
  try {
    localStorage.setItem('test_autoconnect', 'test');
    localStorage.removeItem('test_autoconnect');
    
    const state = loadWalletState();
    return state !== null;
  } catch {
    return false; // Incognito mode or storage blocked
  }
};