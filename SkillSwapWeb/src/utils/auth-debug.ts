// Auth0 debugging utilities

export const clearAuth0State = () => {
  // Clear localStorage entries that might cause state issues
  const keysToRemove = [
    'auth0.is.authenticated',
    'auth0.user',
    'auth0.access.token',
    'auth0.id.token',
    'auth0.refresh.token',
    'a0.spajs.txs'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Clear any Auth0 keys that might exist
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('auth0') || key.startsWith('a0.spajs')) {
      localStorage.removeItem(key);
    }
  });
  
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('auth0') || key.startsWith('a0.spajs')) {
      sessionStorage.removeItem(key);
    }
  });
  
  console.log('Auth0 state cleared');
};

export const debugAuth0State = () => {
  console.log('=== Auth0 Debug Info ===');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Domain:', import.meta.env.VITE_AUTH0_DOMAIN);
  console.log('Client ID:', import.meta.env.VITE_AUTH0_CLIENT_ID);
  
  // Check localStorage for Auth0 entries
  const auth0Keys = Object.keys(localStorage).filter(key => 
    key.startsWith('auth0') || key.startsWith('a0.spajs')
  );
  
  console.log('Auth0 localStorage keys:', auth0Keys);
  auth0Keys.forEach(key => {
    console.log(`${key}:`, localStorage.getItem(key));
  });
  
  console.log('=== End Auth0 Debug ===');
};

// Call this function if you're having auth issues
export const resetAuth0 = () => {
  clearAuth0State();
  window.location.href = window.location.origin;
};