// src/components/dashboard.js - Minimal working version with no external dependencies
import { createLayout } from './layout.js';
import { showUsersList } from './users.js';
import { showReportsList } from './reports.js';

// Simple BI Dashboard that doesn't depend on external files
async function showBIDashboard(container) {
  try {
    container.innerHTML = `
      <div class="bi-dashboard-simple">
        <div class="container-fluid">
          <!-- Header -->
          <div class="row mb-4">
            <div class="col">
              <div class="card shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h2 class="card-title mb-1">
                        <i class="bi bi-graph-up text-primary me-2"></i>
                        Tableau de Bord Analytics
                      </h2>
                      <p class="card-text text-muted mb-0">Vue d'ensemble des rapports techniques</p>
                    </div>
                    <button class="btn btn-primary" onclick="location.reload()">
                      <i class="bi bi-arrow-clockwise me-2"></i>
                      Actualiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- KPI Cards -->
          <div class="row mb-4">
            <div class="col-xl-3 col-md-6 mb-3">
              <div class="card border-primary">
                <div class="card-body text-center">
                  <div class="text-primary mb-2">
                    <i class="bi bi-file-text" style="font-size: 2rem;"></i>
                  </div>
                  <h4 class="card-title text-primary">24</h4>
                  <p class="card-text">Total Rapports</p>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-md-6 mb-3">
              <div class="card border-warning">
                <div class="card-body text-center">
                  <div class="text-warning mb-2">
                    <i class="bi bi-clock" style="font-size: 2rem;"></i>
                  </div>
                  <h4 class="card-title text-warning">8</h4>
                  <p class="card-text">En Attente</p>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-md-6 mb-3">
              <div class="card border-success">
                <div class="card-body text-center">
                  <div class="text-success mb-2">
                    <i class="bi bi-check-circle" style="font-size: 2rem;"></i>
                  </div>
                  <h4 class="card-title text-success">14</h4>
                  <p class="card-text">Approuvés</p>
                </div>
              </div>
            </div>
            <div class="col-xl-3 col-md-6 mb-3">
              <div class="card border-info">
                <div class="card-body text-center">
                  <div class="text-info mb-2">
                    <i class="bi bi-people" style="font-size: 2rem;"></i>
                  </div>
                  <h4 class="card-title text-info">6</h4>
                  <p class="card-text">Techniciens Actifs</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="row mb-4">
            <div class="col-lg-6 mb-3">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">Répartition par Statut</h5>
                </div>
                <div class="card-body">
                  <div class="text-center py-4">
                    <i class="bi bi-pie-chart text-muted" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-2">Graphique disponible avec Chart.js</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-6 mb-3">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">Évolution Temporelle</h5>
                </div>
                <div class="card-body">
                  <div class="text-center py-4">
                    <i class="bi bi-graph-up text-muted" style="font-size: 3rem;"></i>
                    <p class="text-muted mt-2">Graphique disponible avec Chart.js</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Reports -->
          <div class="row">
            <div class="col">
              <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">Rapports Récents</h5>
                  <button class="btn btn-sm btn-outline-primary" onclick="document.dispatchEvent(new CustomEvent('moduleChange', {detail: {module: 'reports'}}))">
                    Voir Tous les Rapports
                  </button>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Client</th>
                          <th>Lieu</th>
                          <th>Technicien</th>
                          <th>Date</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>ACME Corp</td>
                          <td>Tunis Centre</td>
                          <td>Ahmed Ben Ali</td>
                          <td>23/06/2025</td>
                          <td><span class="badge bg-warning">En Attente</span></td>
                        </tr>
                        <tr>
                          <td>TechnoSoft</td>
                          <td>Sousse</td>
                          <td>Fatima Zahra</td>
                          <td>22/06/2025</td>
                          <td><span class="badge bg-success">Approuvé</span></td>
                        </tr>
                        <tr>
                          <td>DataFlow Inc</td>
                          <td>Sfax</td>
                          <td>Mohamed Slim</td>
                          <td>21/06/2025</td>
                          <td><span class="badge bg-info">Examiné</span></td>
                        </tr>
                        <tr>
                          <td>Innovation Hub</td>
                          <td>Monastir</td>
                          <td>Amira Souissi</td>
                          <td>20/06/2025</td>
                          <td><span class="badge bg-success">Approuvé</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    console.log('Simple BI Dashboard loaded successfully');
  } catch (error) {
    console.error('Error loading BI Dashboard:', error);
    container.innerHTML = `
      <div class="alert alert-danger m-4">
        <h4>Erreur BI Dashboard</h4>
        <p>Impossible de charger le tableau de bord: ${error.message}</p>
        <button class="btn btn-danger" onclick="window.location.reload()">Recharger</button>
      </div>
    `;
  }
}

// Module mapping with simple, working functions
const moduleHandlers = {
  reports: showReportsList,
  users: showUsersList,
  biDashboard: showBIDashboard  // Use our simple version
};

/**
 * Shows the dashboard with the modern layout
 * @param {string} initialModule - The module to show initially
 */
export function showDashboard(initialModule = 'reports') {
  console.log('Initializing dashboard with module:', initialModule);
  const appContainer = document.getElementById('app');
  
  try {
    // Create layout
    console.log('Creating layout...');
    const layout = createLayout(initialModule);
    
    // Replace app container content
    appContainer.innerHTML = '';
    appContainer.appendChild(layout);
    console.log('Layout created and added to DOM');
    
    // Initialize Bootstrap components
    initializeBootstrapComponents();
    
    // Listen for module changes
    document.addEventListener('moduleChange', handleModuleChange);
    
    // Load initial module
    loadModule(initialModule);
    
    // Setup responsive behavior
    setupResponsiveBehavior();
    
    console.log('Dashboard initialized successfully');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    appContainer.innerHTML = `
      <div class="container mt-5">
        <div class="alert alert-danger">
          <h3><i class="bi bi-exclamation-triangle me-2"></i>Erreur d'initialisation</h3>
          <p>Une erreur s'est produite lors de l'initialisation du tableau de bord.</p>
          <p><strong>Erreur:</strong> ${error.message}</p>
          <button class="btn btn-danger" onclick="window.location.reload()">
            <i class="bi bi-arrow-clockwise me-2"></i>Recharger
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Initializes Bootstrap components
 */
function initializeBootstrapComponents() {
  try {
    console.log('Initializing Bootstrap components...');
    // Only initialize if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
      // Initialize tooltips
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });

      // Initialize dropdowns
      const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
      dropdownElementList.forEach(dropdownToggleEl => {
        new bootstrap.Dropdown(dropdownToggleEl);
      });
    }
    console.log('Bootstrap components initialized');
  } catch (error) {
    console.warn('Bootstrap initialization warning:', error);
  }
}

/**
 * Handles module change events
 */
function handleModuleChange(event) {
  try {
    const { module } = event.detail;
    console.log('Module change to:', module);
    
    // Update sidebar active state
    updateSidebarActiveState(module);
    
    // Load the new module
    loadModule(module);
  } catch (error) {
    console.error('Error handling module change:', error);
  }
}

/**
 * Updates the active state in the sidebar
 */
function updateSidebarActiveState(activeModule) {
  try {
    // Remove active class from all nav links
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Add active class to the current module link
    const activeLink = document.getElementById(`${activeModule}Link`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  } catch (error) {
    console.warn('Error updating sidebar state:', error);
  }
}

/**
 * Loads a specific module
 */
async function loadModule(module) {
  const contentContainer = document.getElementById('contentContainer');
  
  if (!contentContainer) {
    console.error('Content container not found');
    return;
  }
  
  console.log(`Loading module: ${module}`);
  
  // Show loading state
  showLoadingState(contentContainer);
  
  try {
    // Get the handler for this module
    const handler = moduleHandlers[module];
    
    if (!handler) {
      throw new Error(`No handler found for module: ${module}`);
    }
    
    // Execute the module handler
    await handler(contentContainer);
    
    console.log(`Module loaded successfully: ${module}`);
    
  } catch (error) {
    console.error(`Error loading module ${module}:`, error);
    showErrorState(contentContainer, error);
  }
}

/**
 * Shows loading state
 */
function showLoadingState(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height: 60vh;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Chargement...</span>
        </div>
        <h4>Chargement du module...</h4>
        <p class="text-muted">Veuillez patienter</p>
      </div>
    </div>
  `;
}

/**
 * Shows error state
 */
function showErrorState(container, error) {
  container.innerHTML = `
    <div class="container">
      <div class="alert alert-danger mt-4">
        <div class="d-flex align-items-center mb-3">
          <i class="bi bi-exclamation-triangle fs-1 me-3"></i>
          <div>
            <h4 class="alert-heading">Erreur de Chargement</h4>
            <p class="mb-0">Une erreur s'est produite lors du chargement du module.</p>
          </div>
        </div>
        <hr>
        <p class="mb-3"><strong>Détails:</strong> ${error.message}</p>
        <div>
          <button class="btn btn-danger me-2" onclick="window.location.reload()">
            <i class="bi bi-arrow-clockwise me-2"></i>Recharger la Page
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Setup responsive behavior
 */
function setupResponsiveBehavior() {
  try {
    console.log('Setting up responsive behavior...');
    
    // Setup navigation handlers
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
      if (!link.classList.contains('disabled')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          const moduleId = link.id.replace('Link', '');
          console.log('Navigation click:', moduleId);
          
          // Dispatch module change event
          const event = new CustomEvent('moduleChange', {
            detail: { module: moduleId }
          });
          document.dispatchEvent(event);
        });
      }
    });
    
    console.log('Responsive behavior setup complete');
  } catch (error) {
    console.warn('Error setting up responsive behavior:', error);
  }
}

// Export the main function
export { showDashboard };