// Debug version of src/main.js
import './style.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config.js';
import { getUserRole } from './utils/auth.js';
import { showLoginForm } from './components/login.js';
import { showDashboard } from './components/dashboard.js';

console.log('🚀 Starting Kony Web Admin Dashboard');

// Force light mode by default
document.documentElement.removeAttribute('data-theme');

// Add loading indicator
function showLoadingStatus(message) {
  const loadingElement = document.getElementById('loading-message');
  if (loadingElement) {
    loadingElement.textContent = message;
  }
  console.log('📱 Loading:', message);
}

// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, setting up auth listener');
  showLoadingStatus('Initializing Firebase...');
  
  // Test Firebase connection
  try {
    console.log('🔥 Firebase auth object:', auth);
    console.log('🔥 Firebase app:', auth.app);
    showLoadingStatus('Connecting to Firebase...');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    showLoadingStatus('Firebase connection failed');
    
    // Show error to user
    setTimeout(() => {
      document.body.innerHTML = `
        <div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
          <h2 style="color: #dc2626;">❌ Firebase Connection Error</h2>
          <p>There was an error connecting to Firebase:</p>
          <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; text-align: left;">${error.message}</pre>
          <button onclick="window.location.reload()" style="
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 0.375rem; 
            cursor: pointer;
            margin-top: 1rem;
          ">
            🔄 Retry
          </button>
        </div>
      `;
    }, 1000);
    return;
  }
  
  // Listen for auth state changes with timeout
  const authTimeout = setTimeout(() => {
    console.warn('⚠️ Auth state listener timeout after 10 seconds');
    showLoadingStatus('Authentication timeout - retrying...');
    
    // Show manual login option
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center; font-family: Arial, sans-serif;">
        <h2 style="color: #f59e0b;">⚠️ Authentication Timeout</h2>
        <p>The authentication process is taking longer than expected.</p>
        <button onclick="window.location.reload()" style="
          background: #3b82f6; 
          color: white; 
          border: none; 
          padding: 0.75rem 1.5rem; 
          border-radius: 0.375rem; 
          cursor: pointer;
          margin: 1rem;
        ">
          🔄 Retry
        </button>
        <button onclick="showManualLogin()" style="
          background: #10b981; 
          color: white; 
          border: none; 
          padding: 0.75rem 1.5rem; 
          border-radius: 0.375rem; 
          cursor: pointer;
          margin: 1rem;
        ">
          🔑 Manual Login
        </button>
      </div>
    `;
  }, 10000); // 10 second timeout
  
  // Manual login function
  window.showManualLogin = () => {
    clearTimeout(authTimeout);
    console.log('🔑 Showing manual login');
    showLoginForm();
  };
  
  // Listen for auth state changes
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    clearTimeout(authTimeout); // Clear timeout since we got a response
    
    try {
      if (user) {
        console.log('✅ User is signed in:', user.email);
        showLoadingStatus('User authenticated, checking permissions...');
        
        // Check if user is admin
        console.log('🔍 Getting user role for:', user.uid);
        const role = await getUserRole(user.uid);
        console.log('👤 User role:', role);
        
        if (role === 'admin') {
          console.log('✅ Admin access granted');
          showLoadingStatus('Loading dashboard...');
          
          setTimeout(() => {
            showDashboard();
          }, 500);
        } else {
          console.log('❌ Access denied - not an admin');
          showLoadingStatus('Access denied - admin only');
          
          // Not an admin, sign out
          auth.signOut();
          setTimeout(() => {
            showLoginForm('Only administrators can access this dashboard.');
          }, 1000);
        }
      } else {
        console.log('👤 No user signed in');
        showLoadingStatus('Please sign in...');
        
        setTimeout(() => {
          showLoginForm();
        }, 500);
      }
    } catch (error) {
      console.error('❌ Auth state change error:', error);
      showLoadingStatus('Authentication error');
      
      setTimeout(() => {
        showLoginForm('Authentication error: ' + error.message);
      }, 1000);
    }
  }, (error) => {
    clearTimeout(authTimeout);
    console.error('❌ Auth listener error:', error);
    showLoadingStatus('Authentication listener failed');
    
    setTimeout(() => {
      showLoginForm('Authentication system error: ' + error.message);
    }, 1000);
  });
  
  // Cleanup function
  window.addEventListener('beforeunload', () => {
    console.log('🧹 Cleaning up auth listener');
    unsubscribe();
    clearTimeout(authTimeout);
  });
});

// Add debug info to window for console debugging
window.debugInfo = {
  auth,
  getUserRole,
  showLoginForm,
  showDashboard
};

console.log('🔧 Debug info available at window.debugInfo');