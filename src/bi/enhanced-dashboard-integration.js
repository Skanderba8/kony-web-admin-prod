// src/bi/enhanced-dashboard-integration.js - Complete Integration Module

import { EnhancedBIDashboard } from './enhanced-dashboard.js';

/**
 * Initialize the Enhanced BI Dashboard for the main application
 * This replaces the existing dashboard initialization
 */
export function initializeEnhancedBIDashboard(container = document.getElementById('contentContainer')) {
  console.log('Initializing Enhanced BI Dashboard');
  
  // Create and initialize the dashboard
  const dashboard = new EnhancedBIDashboard(container);
  
  // Store reference globally for export functions
  window.dashboardInstance = dashboard;
  
  return dashboard;
}

/**
 * Global functions for report interactions (called from table actions)
 */
window.viewReport = function(reportId) {
  console.log('Viewing report:', reportId);
  
  // Store report ID for the reports module
  sessionStorage.setItem('viewReportId', reportId);
  
  // Navigate to reports module
  const event = new CustomEvent('moduleChange', { detail: { module: 'reports' } });
  document.dispatchEvent(event);
};

window.downloadReport = function(reportId) {
  console.log('Downloading report:', reportId);
  
  // Show notification
  if (window.dashboardInstance) {
    window.dashboardInstance.showNotification('Preparing PDF download...', 'info');
  }
  
  // Trigger download in reports module
  const event = new CustomEvent('downloadReport', { 
    detail: { reportId, format: 'pdf' } 
  });
  document.dispatchEvent(event);
};

/**
 * Mock data generator for testing (remove in production)
 */
export function generateMockData() {
  const mockReports = [];
  const mockUsers = [];
  
  // Generate mock users (technicians)
  const technicianNames = [
    'Ahmed Ben Ali', 'Fatima Zahra', 'Mohamed Slim', 'Amira Souissi', 
    'Karim Dhaoui', 'Nour Zayed', 'Youssef Mansour', 'Leila Gharbi'
  ];
  
  technicianNames.forEach((name, index) => {
    mockUsers.push({
      id: `tech_${index}`,
      name,
      email: `${name.replace(' ', '.').toLowerCase()}@kony.tn`,
      role: 'technician',
      createdAt: new Date(2024, 0, 1 + index)
    });
  });
  
  // Add admins
  mockUsers.push({
    id: 'admin_1',
    name: 'Skander Admin',
    email: 'admin@kony.tn',
    role: 'admin',
    createdAt: new Date(2024, 0, 1)
  });
  
  // Generate mock reports
  const clientNames = [
    'Banque Centrale de Tunisie', 'Société Générale', 'AMEN Bank', 
    'Ministère de l\'Éducation', 'Orange Tunisie', 'Tunisie Télécom',
    'Université de Tunis', 'Hôpital Charles Nicolle', 'Municipality of Tunis',
    'SONEDE', 'STEG', 'Office National du Tourisme'
  ];
  
  const locations = [
    'Tunis Centre', 'Ariana', 'Manouba', 'Sfax', 'Sousse', 'Monastir',
    'Kairouan', 'Bizerte', 'Gabès', 'Médenine', 'Kasserine', 'Gafsa'
  ];
  
  const statuses = ['draft', 'submitted', 'reviewed', 'approved'];
  const statusWeights = [0.1, 0.4, 0.3, 0.2]; // Probabilities for each status
  
  // Generate reports for the last 6 months
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  
  for (let i = 0; i < 150; i++) {
    const createdAt = new Date(
      sixMonthsAgo.getTime() + 
      Math.random() * (now.getTime() - sixMonthsAgo.getTime())
    );
    
    // Determine status based on weights
    const rand = Math.random();
    let status = 'draft';
    let cumulative = 0;
    for (let j = 0; j < statuses.length; j++) {
      cumulative += statusWeights[j];
      if (rand <= cumulative) {
        status = statuses[j];
        break;
      }
    }
    
    // Generate submitted date if status is not draft
    let submittedAt = null;
    if (status !== 'draft') {
      submittedAt = new Date(
        createdAt.getTime() + 
        Math.random() * (7 * 24 * 60 * 60 * 1000) // 0-7 days after creation
      );
    }
    
    // Generate floors with components
    const numFloors = Math.floor(Math.random() * 4) + 1; // 1-4 floors
    const floors = [];
    
    for (let f = 0; f < numFloors; f++) {
      const floor = {
        id: `floor_${f}`,
        name: f === 0 ? 'Ground Floor' : `Floor ${f}`,
        networkCabinets: generateComponents('networkCabinet', Math.floor(Math.random() * 3)),
        perforations: generateComponents('perforation', Math.floor(Math.random() * 5)),
        accessTraps: generateComponents('accessTrap', Math.floor(Math.random() * 2)),
        cablePaths: generateComponents('cablePath', Math.floor(Math.random() * 8)),
        cableTrunkings: generateComponents('cableTrunking', Math.floor(Math.random() * 6)),
        conduits: generateComponents('conduit', Math.floor(Math.random() * 10)),
        copperCablings: generateComponents('copperCabling', Math.floor(Math.random() * 15)),
        fiberOpticCablings: generateComponents('fiberOpticCabling', Math.floor(Math.random() * 8))
      };
      floors.push(floor);
    }
    
    const report = {
      id: `report_${i.toString().padStart(3, '0')}`,
      clientName: clientNames[Math.floor(Math.random() * clientNames.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      technicianName: technicianNames[Math.floor(Math.random() * technicianNames.length)],
      projectManager: 'Skander Sellami',
      status,
      createdAt,
      submittedAt,
      lastModified: submittedAt || createdAt,
      floors,
      projectContext: generateProjectContext(),
      conclusion: generateConclusion(),
      estimatedDurationDays: Math.floor(Math.random() * 30) + 5,
      assumptions: generateAssumptions()
    };
    
    mockReports.push(report);
  }
  
  return { reports: mockReports, users: mockUsers };
}

/**
 * Generate mock components
 */
function generateComponents(type, count) {
  const components = [];
  
  for (let i = 0; i < count; i++) {
    const component = {
      id: `${type}_${i}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
      location: `Room ${Math.floor(Math.random() * 20) + 1}`,
      notes: Math.random() > 0.7 ? generateRandomNote() : null
    };
    
    // Add type-specific properties
    switch (type) {
      case 'networkCabinet':
        component.height = Math.floor(Math.random() * 30) + 10; // 10-40U
        component.width = 600; // Standard width
        component.depth = Math.random() > 0.5 ? 800 : 1000;
        break;
      case 'cablePath':
        component.length = Math.floor(Math.random() * 50) + 5; // 5-55 meters
        component.width = Math.floor(Math.random() * 20) + 10; // 10-30 cm
        break;
      case 'conduit':
        component.diameter = Math.floor(Math.random() * 8) + 2; // 2-10 cm
        component.length = Math.floor(Math.random() * 30) + 5; // 5-35 meters
        break;
      case 'copperCabling':
        component.category = Math.random() > 0.5 ? 'Cat6' : 'Cat6A';
        component.length = Math.floor(Math.random() * 100) + 10; // 10-110 meters
        break;
      case 'fiberOpticCabling':
        component.type = Math.random() > 0.5 ? 'Single Mode' : 'Multi Mode';
        component.fiberCount = [4, 8, 12, 24][Math.floor(Math.random() * 4)];
        component.length = Math.floor(Math.random() * 500) + 50; // 50-550 meters
        break;
    }
    
    components.push(component);
  }
  
  return components;
}

/**
 * Generate random project context
 */
function generateProjectContext() {
  const contexts = [
    "Migration vers une nouvelle infrastructure réseau pour améliorer les performances et la sécurité.",
    "Installation d'un nouveau système de câblage structuré dans le cadre de la modernisation des bureaux.",
    "Mise à niveau de l'infrastructure réseau existante pour supporter les nouvelles technologies.",
    "Déploiement d'un réseau fibre optique pour améliorer la connectivité inter-bâtiments.",
    "Restructuration complète du réseau dans le cadre d'un déménagement de bureaux.",
    "Installation d'équipements réseau additionnels pour supporter la croissance de l'entreprise."
  ];
  
  return contexts[Math.floor(Math.random() * contexts.length)];
}

/**
 * Generate random conclusion
 */
function generateConclusion() {
  const conclusions = [
    "Le déploiement peut être réalisé selon les spécifications techniques. Aucun obstacle majeur identifié.",
    "Infrastructure existante compatible avec les nouveaux équipements. Quelques adaptations mineures nécessaires.",
    "Recommandation de renforcement de certaines sections avant installation des nouveaux équipements.",
    "Site prêt pour l'installation. Coordination nécessaire avec les équipes de maintenance.",
    "Faisabilité confirmée avec quelques modifications du plan initial pour optimiser les performances."
  ];
  
  return conclusions[Math.floor(Math.random() * conclusions.length)];
}

/**
 * Generate random assumptions
 */
function generateAssumptions() {
  const allAssumptions = [
    "Accès libre aux locaux techniques pendant les heures de travail",
    "Fourniture d'alimentation électrique auxiliaire pendant l'installation",
    "Personnel de maintenance disponible pour assistance",
    "Arrêt programmé des systèmes existants possible le weekend",
    "Matériel de protection individuelle fourni par le client",
    "Plans architecturaux à jour disponibles",
    "Autorisations d'accès sécurisé obtenues",
    "Budget approuvé pour modifications mineures si nécessaires"
  ];
  
  const count = Math.floor(Math.random() * 4) + 2; // 2-5 assumptions
  const selectedAssumptions = [];
  const usedIndices = new Set();
  
  while (selectedAssumptions.length < count) {
    const index = Math.floor(Math.random() * allAssumptions.length);
    if (!usedIndices.has(index)) {
      selectedAssumptions.push(allAssumptions[index]);
      usedIndices.add(index);
    }
  }
  
  return selectedAssumptions;
}

/**
 * Generate random notes
 */
function generateRandomNote() {
  const notes = [
    "Accès difficile, prévoir échafaudage",
    "Zone sensible - coordination requise",
    "Matériel existant à retirer",
    "Attention aux câbles haute tension à proximité",
    "Local fermé - clés nécessaires",
    "Prévoir protection contre la poussière"
  ];
  
  return notes[Math.floor(Math.random() * notes.length)];
}

/**
 * Enhanced initialization with better error handling and performance monitoring
 */
export function initializeProductionDashboard(container) {
  console.log('Initializing Production BI Dashboard');
  
  try {
    // Performance monitoring
    const startTime = performance.now();
    
    // Initialize dashboard
    const dashboard = new EnhancedBIDashboard(container);
    
    // Set up error boundary
    window.addEventListener('error', (event) => {
      console.error('Dashboard Error:', event.error);
      dashboard.showError('An unexpected error occurred. Please refresh the page.');
    });
    
    // Set up performance monitoring
    const endTime = performance.now();
    console.log(`Dashboard initialized in ${endTime - startTime}ms`);
    
    // Store dashboard instance
    window.dashboardInstance = dashboard;
    
    // Set up periodic refresh (every 5 minutes)
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        dashboard.loadData();
      }
    }, 5 * 60 * 1000);
    
    return dashboard;
    
  } catch (error) {
    console.error('Failed to initialize dashboard:', error);
    
    // Fallback UI
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h2 style="color: #dc2626;">Dashboard Initialization Failed</h2>
        <p style="color: #6b7280; margin-bottom: 1rem;">
          There was an error loading the dashboard. Please try refreshing the page.
        </p>
        <button onclick="window.location.reload()" style="
          background: #3b82f6; 
          color: white; 
          border: none; 
          padding: 0.75rem 1.5rem; 
          border-radius: 0.375rem; 
          cursor: pointer;
        ">
          Refresh Page
        </button>
      </div>
    `;
    
    throw error;
  }
}

/**
 * Development mode initialization with mock data
 */
export function initializeDevelopmentDashboard(container) {
  console.log('Initializing Development BI Dashboard with Mock Data');
  
  const dashboard = new EnhancedBIDashboard(container);
  
  // Override loadData method to use mock data
  const originalLoadData = dashboard.loadData.bind(dashboard);
  dashboard.loadData = async function(forceRefresh = false) {
    if (this.isLoading && !forceRefresh) return;
    
    this.isLoading = true;
    this.showLoading();
    
    try {
      console.log('Loading mock data...');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock data
      const mockData = generateMockData();
      this.data.reports = mockData.reports;
      this.data.users = mockData.users;
      
      console.log(`Loaded ${this.data.reports.length} mock reports and ${this.data.users.length} mock users`);
      
      // Process analytics
      this.data.analytics = this.processAnalytics();
      
      // Update UI
      this.updateDashboard();
      this.hideLoading();
      this.updateFooter();
      
      if (forceRefresh) {
        this.showNotification('Mock data refreshed successfully', 'success');
      }
      
    } catch (error) {
      console.error('Error loading mock data:', error);
      this.showError('Failed to load mock data: ' + error.message);
      this.hideLoading();
    } finally {
      this.isLoading = false;
    }
  };
  
  window.dashboardInstance = dashboard;
  return dashboard;
}

/**
 * Utility function to check if we're in development mode
 */
export function isDevelopmentMode() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.search.includes('dev=true');
}

/**
 * Auto-initialize based on environment
 */
export function autoInitializeDashboard(container) {
  if (isDevelopmentMode()) {
    return initializeDevelopmentDashboard(container);
  } else {
    return initializeProductionDashboard(container);
  }
}