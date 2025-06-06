// src/main.js - Clean production version
import './style.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config.js';
import { getUserRole } from './utils/auth.js';
import { showLoginForm } from './components/login.js';
import { showDashboard } from './components/dashboard.js';

// Loading message helper
function updateLoadingMessage(message) {
  const loadingElement = document.getElementById('loadingMessage');
  if (loadingElement) {
    loadingElement.textContent = message;
  }
}

// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Kony Admin Dashboard...');
  
  updateLoadingMessage('Connexion à Firebase...');
  
  // Auth state listener
  onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        console.log('User signed in:', user.email);
        updateLoadingMessage('Vérification des permissions...');
        
        // Get user role
        const role = await getUserRole(user.uid);
        
        if (role === 'admin') {
          updateLoadingMessage('Chargement du tableau de bord...');
          
          // Small delay for smooth transition
          setTimeout(() => {
            document.body.classList.add('app-ready');
            showDashboard();
          }, 800);
        } else {
          console.log('Access denied - not an admin');
          updateLoadingMessage('Accès refusé...');
          
          // Sign out non-admin users
          await auth.signOut();
          
          setTimeout(() => {
            document.body.classList.add('app-ready');
            showLoginForm('Seuls les administrateurs peuvent accéder à ce tableau de bord.');
          }, 1000);
        }
      } else {
        console.log('No user signed in');
        updateLoadingMessage('Connexion requise...');
        
        setTimeout(() => {
          document.body.classList.add('app-ready');
          showLoginForm();
        }, 500);
      }
    } catch (error) {
      console.error('Auth error:', error);
      updateLoadingMessage('Erreur d\'authentification...');
      
      setTimeout(() => {
        document.body.classList.add('app-ready');
        showLoginForm('Erreur d\'authentification: ' + error.message);
      }, 1000);
    }
  });
});