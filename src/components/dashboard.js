// src/components/dashboard.js
import { createLayout } from './layout.js';
import { showReportsList } from './reports.js';
import { showUsersList } from './users.js';
import { initializeBIDashboard } from '../dashboard.js';

// Module mapping
const moduleHandlers = {
  reports: showReportsList,
  users: showUsersList,
  biDashboard: initializeBIDashboard
};

/**
 * Shows the dashboard with the modern layout
 * @param {string} initialModule - The module to show initially
 */
export function showDashboard(initialModule = 'reports') {
  console.log('Showing modern dashboard with initial module:', initialModule);
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
  // Initialize dropdowns
  const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
  dropdownElementList.forEach(dropdownToggleEl => {
    new bootstrap.Dropdown(dropdownToggleEl);
  });
  
  // Initialize tooltips
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * Handles module change events
 * @param {CustomEvent} event - The module change event
 */
function handleModuleChange(event) {
  const { module } = event.detail;
  loadModule(module);
  
  // Update active class in sidebar
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.getElementById(`${module}Link`).classList.add('active');
  
  // Close sidebar on mobile after module change
  const sidebar = document.querySelector('.sidebar');
  if (sidebar.classList.contains('show')) {
    sidebar.classList.remove('show');
  }
}

/**
 * Loads a specific module content
 * @param {string} module - The module to load
 */
function loadModule(module) {
  const contentContainer = document.getElementById('contentContainer');
  
  // Show loading state
  contentContainer.innerHTML = `
    <div class="loading-container">
      <div class="spinner-container">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <p>Loading ${module}...</p>
    </div>
  `;
  
  // Small delay to show loading animation
  setTimeout(() => {
    // Check if handler exists
    if (moduleHandlers[module]) {
      moduleHandlers[module](contentContainer);
    } else {
      contentContainer.innerHTML = `
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Module "${module}" not implemented yet.
        </div>
      `;
    }
  }, 300);
}

/**
 * Sets up responsive behavior for the dashboard
 */
function setupResponsiveBehavior() {
  // Watch for window resize events
  window.addEventListener('resize', () => {
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth >= 992) { // lg breakpoint
      // Remove show class if window is resized to desktop
      sidebar.classList.remove('show');
    }
  });
  
  // Close sidebar when clicking outside of it on mobile
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('#sidebarToggle');
    
    if (window.innerWidth < 992 && sidebar.classList.contains('show') && 
        !sidebar.contains(e.target) && 
        e.target !== sidebarToggle) {
      sidebar.classList.remove('show');
    }
  });
}