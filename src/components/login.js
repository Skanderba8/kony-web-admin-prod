// src/components/login.js
import { signIn } from '../utils/auth.js';

/**
 * Displays a modern login form
 * @param {string|null} errorMessage - Optional error message to display
 */
export function showLoginForm(errorMessage = null) {
  console.log('Showing modern login form');
  const appContainer = document.getElementById('app');
  
  appContainer.innerHTML = `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <i class="bi bi-hdd-network"></i>
          <h1>Kony Admin</h1>
        </div>
        
        <h2 class="auth-title">Sign In</h2>
        <p class="auth-subtitle">Sign in to continue to dashboard</p>
        
        <form id="loginForm" class="auth-form">
          <div class="form-floating mb-3">
            <input type="email" class="form-control" id="email" placeholder="name@example.com" required>
            <label for="email">Email address</label>
          </div>
          
          <div class="form-floating mb-3">
            <input type="password" class="form-control" id="password" placeholder="Password" required>
            <label for="password">Password</label>
          </div>
          
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="rememberMe">
            <label class="form-check-label" for="rememberMe">
              Remember me
            </label>
          </div>
          
          ${errorMessage ? `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              ${errorMessage}
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          ` : ''}
          
          <button type="submit" class="btn btn-primary w-100 py-2 mb-3" id="loginButton">
            <span class="button-text">Sign In</span>
            <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
          </button>
          
          <div class="text-center">
            <a href="#" class="text-decoration-none">Forgot password?</a>
          </div>
        </form>
        
        <div class="auth-footer">
          <p>&copy; ${new Date().getFullYear()} Kony Networks - All Rights Reserved</p>
        </div>
      </div>
      
      <div class="auth-background">
        <!-- Background elements -->
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
    </div>
  `;
  
  // Add form submission handler
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginButton = document.getElementById('loginButton');
    const buttonText = loginButton.querySelector('.button-text');
    const spinner = loginButton.querySelector('.spinner-border');
    
    try {
      // Update button to loading state
      loginButton.disabled = true;
      buttonText.textContent = 'Signing in...';
      spinner.classList.remove('d-none');
      
      await signIn(email, password);
      // Auth state observer will handle the navigation
    } catch (error) {
      loginButton.disabled = false;
      buttonText.textContent = 'Sign In';
      spinner.classList.add('d-none');
      
      showLoginForm(error.message || 'Login failed. Please check your credentials.');
    }
  });
  
  // Add dismiss functionality for the alert
  const alertCloseButton = document.querySelector('.alert .btn-close');
  if (alertCloseButton) {
    alertCloseButton.addEventListener('click', function() {
      this.parentElement.classList.remove('show');
      setTimeout(() => {
        this.parentElement.remove();
      }, 150);
    });
  }
}