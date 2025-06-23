// src/components/dashboard.js - Fixed with correct import paths
import { createLayout } from './layout.js';
// Use the enhanced reports component instead
import { initializeEnhancedReports } from './reports-enhanced.js'; 
import { showUsersList } from './users.js';
// Use the enhanced dashboard instead
import { initializeEnhancedDashboard } from '../dashboard-enhanced.js';

// Module mapping with corrected function names
const moduleHandlers = {
  reports: initializeEnhancedReports,
  users: showUsersList,
  biDashboard: initializeEnhancedDashboard
};

/**
 * Shows the dashboard with the modern layout
 * @param {string} initialModule - The module to show initially
 */
export function showDashboard(initialModule = 'reports') {
  console.log('Affichage du tableau de bord moderne avec module initial:', initialModule);
  const appContainer = document.getElementById('app');
  
  // Create layout
  const layout = createLayout(initialModule);
  
  // Replace app container content
  appContainer.innerHTML = '';
  appContainer.appendChild(layout);
  
  // Initialize Bootstrap components
  initializeBootstrapComponents();
  
  // Listen for module changes
  document.addEventListener('moduleChange', handleModuleChange);
  
  // Load initial module
  loadModule(initialModule);
  
  // Setup responsive behavior
  setupResponsiveBehavior();
}

/**
 * Initializes Bootstrap components like dropdowns, tooltips, etc.
 */
function initializeBootstrapComponents() {
  try {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize Bootstrap dropdowns
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.map(function (dropdownToggleEl) {
      return new bootstrap.Dropdown(dropdownToggleEl);
    });

    console.log('Composants Bootstrap initialisés');
  } catch (error) {
    console.warn('Erreur lors de l\'initialisation de Bootstrap:', error);
  }
}

/**
 * Handles module change events
 * @param {CustomEvent} event - The module change event
 */
function handleModuleChange(event) {
  const { module } = event.detail;
  console.log('Changement de module vers:', module);
  
  // Update sidebar active state
  updateSidebarActiveState(module);
  
  // Load the new module
  loadModule(module);
}

/**
 * Updates the active state in the sidebar
 * @param {string} activeModule - The module to set as active
 */
function updateSidebarActiveState(activeModule) {
  // Remove active class from all nav links
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to the current module link
  const activeLink = document.getElementById(`${activeModule}Link`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

/**
 * Loads a specific module
 * @param {string} module - The module to load
 */
async function loadModule(module) {
  const contentContainer = document.getElementById('contentContainer');
  
  if (!contentContainer) {
    console.error('Conteneur de contenu introuvable');
    return;
  }
  
  // Show loading state
  showLoadingState(contentContainer);
  
  try {
    // Get the handler for this module
    const handler = moduleHandlers[module];
    
    if (!handler) {
      console.error(`Gestionnaire de module non trouvé pour: ${module}`);
      showErrorState(contentContainer, new Error(`Module non disponible: ${module}`));
      return;
    }
    
    // Execute the module handler
    await handler(contentContainer);
    
    console.log(`Module chargé avec succès: ${module}`);
    
  } catch (error) {
    console.error(`Erreur lors du chargement du module ${module}:`, error);
    showErrorState(contentContainer, error);
  }
}

/**
 * Shows loading state in the content container
 * @param {HTMLElement} container - The container to show loading in
 */
function showLoadingState(container) {
  container.innerHTML = `
    <div class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <h3>Chargement...</h3>
        <p>Veuillez patienter pendant le chargement du module.</p>
      </div>
    </div>
  `;
  
  // Add loading styles if not present
  if (!document.head.querySelector('[data-loading-styles]')) {
    const styles = document.createElement('style');
    styles.setAttribute('data-loading-styles', '');
    styles.textContent = `
      .loading-state {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        margin: 1rem;
      }
      
      .loading-content {
        text-align: center;
        color: white;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 3rem;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .loading-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top: 4px solid white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 2rem;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading-content h3 {
        margin-bottom: 1rem;
        font-weight: 600;
      }
      
      .loading-content p {
        opacity: 0.8;
        margin: 0;
      }
    `;
    document.head.appendChild(styles);
  }
}

/**
 * Shows error state in the content container
 * @param {HTMLElement} container - The container to show error in
 * @param {Error} error - The error that occurred
 */
function showErrorState(container, error) {
  container.innerHTML = `
    <div class="error-state">
      <div class="error-content">
        <i class="bi bi-exclamation-triangle error-icon"></i>
        <h3>Erreur de Chargement</h3>
        <p>Une erreur s'est produite lors du chargement du module.</p>
        <div class="error-details">
          <code>${error.message}</code>
        </div>
        <div class="error-actions">
          <button class="btn btn-primary" onclick="window.location.reload()">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Recharger la Page
          </button>
          <button class="btn btn-outline-secondary" onclick="history.back()">
            <i class="bi bi-arrow-left me-2"></i>
            Retour
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add error styles if not present
  if (!document.head.querySelector('[data-error-styles]')) {
    const styles = document.createElement('style');
    styles.setAttribute('data-error-styles', '');
    styles.textContent = `
      .error-state {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        margin: 1rem;
      }
      
      .error-content {
        text-align: center;
        max-width: 500px;
        background: white;
        padding: 3rem;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        border: 1px solid #e5e7eb;
      }
      
      .error-icon {
        font-size: 4rem;
        color: #ef4444;
        margin-bottom: 1.5rem;
      }
      
      .error-content h3 {
        color: #374151;
        margin-bottom: 1rem;
        font-weight: 600;
      }
      
      .error-content p {
        color: #6b7280;
        margin-bottom: 1.5rem;
      }
      
      .error-details {
        background: #fef2f2;
        border: 1px solid #fecaca;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 2rem;
      }
      
      .error-details code {
        color: #dc2626;
        font-size: 0.875rem;
        word-break: break-word;
      }
      
      .error-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }
      
      .btn {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        text-decoration: none;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .btn-primary {
        background: #3b82f6;
        color: white;
        border-color: #3b82f6;
      }
      
      .btn-primary:hover {
        background: #2563eb;
        border-color: #2563eb;
      }
      
      .btn-outline-secondary {
        background: transparent;
        color: #6b7280;
        border-color: #d1d5db;
      }
      
      .btn-outline-secondary:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }
    `;
    document.head.appendChild(styles);
  }
}

/**
 * Setup responsive behavior for mobile devices
 */
function setupResponsiveBehavior() {
  // Mobile sidebar toggle
  const setupMobileSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    
    // Add overlay to body
    document.body.appendChild(overlay);
    
    // Mobile menu button in header
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('show');
        overlay.classList.add('show');
      });
    }
    
    // Close sidebar when clicking overlay
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
    });
    
    // Close sidebar when clicking close button
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        sidebar.classList.remove('show');
        overlay.classList.remove('show');
      });
    }
  };
  
  // Setup navigation click handlers
  const setupNavigationHandlers = () => {
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
      if (!link.classList.contains('disabled')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          const moduleId = link.id.replace('Link', '');
          
          // Dispatch module change event
          const event = new CustomEvent('moduleChange', {
            detail: { module: moduleId }
          });
          document.dispatchEvent(event);
          
          // Close mobile sidebar if open
          const sidebar = document.querySelector('.sidebar');
          const overlay = document.querySelector('.sidebar-overlay');
          if (sidebar && overlay) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
          }
        });
      }
    });
  };
  
  // Initialize responsive features
  setupMobileSidebar();
  setupNavigationHandlers();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    // Close mobile sidebar on desktop resize
    if (window.innerWidth >= 992) {
      if (sidebar) sidebar.classList.remove('show');
      if (overlay) overlay.classList.remove('show');
    }
  });
  
  console.log('Comportement responsive configuré');
}

// Export the main function
export { showDashboard };