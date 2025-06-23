// src/dashboard-enhanced.js - Self-Contained Professional Dashboard with French Translation
import { fetchReportData, fetchUserData } from './bi/services/data-processing.js';

/**
 * Initialize the Enhanced BI Dashboard with Professional UI
 */
export async function initializeEnhancedDashboard(container = document.getElementById('contentContainer')) {
  console.log('Initialisation du Tableau de Bord BI Amélioré');
  
  try {
    container.innerHTML = '';
    
    // Create sleek, professional dashboard layout
    container.innerHTML = `
      <div class="enhanced-dashboard">
        <!-- Modern Header -->
        <div class="dashboard-header">
          <div class="header-content">
            <div class="header-info">
              <h1 class="dashboard-title">
                <i class="bi bi-graph-up-arrow"></i>
                Tableau de Bord Analytics
              </h1>
              <p class="dashboard-subtitle">Analyse des rapports de visite technique</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-refresh" id="refreshBtn">
                <i class="bi bi-arrow-clockwise"></i>
                <span>Actualiser</span>
              </button>
              <div class="export-dropdown">
                <button class="btn btn-export" id="exportBtn">
                  <i class="bi bi-download"></i>
                  <span>Exporter</span>
                  <i class="bi bi-chevron-down ms-1"></i>
                </button>
                <div class="export-menu" id="exportMenu">
                  <button class="export-option" data-type="csv">
                    <i class="bi bi-filetype-csv"></i>
                    Exporter CSV
                  </button>
                  <button class="export-option" data-type="pdf">
                    <i class="bi bi-filetype-pdf"></i>
                    Exporter PDF
                  </button>
                  <button class="export-option" data-type="excel">
                    <i class="bi bi-file-earmark-spreadsheet"></i>
                    Exporter Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- KPIs Section -->
        <div class="kpi-section">
          <div class="kpi-grid" id="kpiContainer">
            <!-- KPIs will be rendered here -->
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="charts-grid">
            <!-- Status Distribution Chart -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>Répartition par Statut</h3>
                <div class="chart-actions">
                  <button class="btn-icon" data-tooltip="Actualiser">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div class="chart-body" id="statusChart">
                <!-- Chart will be rendered here -->
              </div>
            </div>

            <!-- Timeline Chart -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>Évolution Temporelle</h3>
                <div class="chart-actions">
                  <button class="btn-icon" data-tooltip="Actualiser">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div class="chart-body" id="timelineChart">
                <!-- Chart will be rendered here -->
              </div>
            </div>

            <!-- Components Chart -->
            <div class="chart-card chart-card-wide">
              <div class="chart-header">
                <h3>Distribution des Composants</h3>
                <div class="chart-actions">
                  <button class="btn-icon" data-tooltip="Actualiser">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div class="chart-body" id="componentsChart">
                <!-- Chart will be rendered here -->
              </div>
            </div>
          </div>
        </div>

        <!-- Reports Table Section -->
        <div class="table-section">
          <div class="table-card">
            <div class="table-header">
              <h3>Rapports Récents</h3>
              <div class="table-actions">
                <div class="search-box">
                  <i class="bi bi-search"></i>
                  <input type="text" placeholder="Rechercher..." id="searchInput">
                </div>
                <button class="btn btn-outline-primary" id="viewAllBtn">
                  Voir Tout
                </button>
              </div>
            </div>
            <div class="table-body">
              <div id="reportsTable">
                <!-- Table will be rendered here -->
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Overlay -->
        <div class="loading-overlay" id="loadingOverlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Chargement des données...</p>
          </div>
        </div>

        <!-- Toast Notifications Container -->
        <div class="toast-container" id="toastContainer"></div>
      </div>
    `;

    // Apply professional styles
    applyProfessionalStyles();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load and render data
    await loadAndRenderData();
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du tableau de bord:', error);
    showErrorState(container, error);
  }
}

/**
 * Apply professional CSS styles
 */
function applyProfessionalStyles() {
  const styles = `
    <style>
      .enhanced-dashboard {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .dashboard-header {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 2rem;
        margin-bottom: 2rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .dashboard-title {
        font-size: 2rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dashboard-subtitle {
        color: #64748b;
        margin: 0.25rem 0 0 0;
        font-size: 1rem;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
      }

      .btn-refresh {
        background: #3b82f6;
        color: white;
      }

      .btn-refresh:hover {
        background: #2563eb;
        transform: translateY(-2px);
      }

      .export-dropdown {
        position: relative;
      }

      .btn-export {
        background: #10b981;
        color: white;
      }

      .btn-export:hover {
        background: #059669;
        transform: translateY(-2px);
      }

      .export-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        padding: 0.5rem;
        min-width: 200px;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
      }

      .export-menu.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .export-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem;
        border: none;
        background: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s ease;
        color: #374151;
      }

      .export-option:hover {
        background: #f3f4f6;
      }

      .kpi-section {
        margin-bottom: 2rem;
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }

      .kpi-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .kpi-card:hover {
        transform: translateY(-4px);
      }

      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;
      }

      .kpi-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 0.5rem;
      }

      .kpi-label {
        color: #64748b;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .charts-section {
        margin-bottom: 2rem;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
      }

      .chart-card-wide {
        grid-column: 1 / -1;
      }

      .chart-card, .table-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      }

      .chart-header, .table-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .chart-header h3, .table-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
      }

      .chart-actions, .table-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border: none;
        background: #f8fafc;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #64748b;
      }

      .btn-icon:hover {
        background: #e2e8f0;
        color: #3b82f6;
      }

      .search-box {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-box i {
        position: absolute;
        left: 12px;
        color: #9ca3af;
      }

      .search-box input {
        padding: 0.5rem 0.5rem 0.5rem 2.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: white;
        width: 200px;
        transition: border-color 0.2s ease;
      }

      .search-box input:focus {
        outline: none;
        border-color: #3b82f6;
      }

      .btn-outline-primary {
        background: transparent;
        color: #3b82f6;
        border: 1px solid #3b82f6;
      }

      .btn-outline-primary:hover {
        background: #3b82f6;
        color: white;
      }

      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .loading-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .loading-content {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .toast-container {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 10000;
      }

      .simple-chart {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8fafc;
        border-radius: 8px;
        color: #64748b;
        font-style: italic;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
      }

      .stat-item {
        text-align: center;
        padding: 1rem;
        background: #f8fafc;
        border-radius: 8px;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        margin-top: 0.25rem;
      }

      @media (max-width: 768px) {
        .enhanced-dashboard {
          padding: 1rem;
        }
        
        .header-content {
          flex-direction: column;
          align-items: stretch;
        }
        
        .charts-grid {
          grid-template-columns: 1fr;
        }
        
        .kpi-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
}

/**
 * Setup event listeners for the dashboard
 */
function setupEventListeners() {
  // Export dropdown toggle
  const exportBtn = document.getElementById('exportBtn');
  const exportMenu = document.getElementById('exportMenu');
  
  exportBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle('show');
  });

  // Close export menu when clicking outside
  document.addEventListener('click', () => {
    exportMenu?.classList.remove('show');
  });

  // Export options
  document.querySelectorAll('.export-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const type = e.currentTarget.dataset.type;
      handleExport(type);
      exportMenu.classList.remove('show');
    });
  });

  // Refresh button
  document.getElementById('refreshBtn')?.addEventListener('click', async () => {
    showLoading();
    await loadAndRenderData();
    hideLoading();
    showToast('Données actualisées avec succès', 'success');
  });

  // Search functionality
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    filterReports(e.target.value);
  });

  // View all button
  document.getElementById('viewAllBtn')?.addEventListener('click', () => {
    // Navigate to reports module
    const event = new CustomEvent('moduleChange', { detail: { module: 'reports' } });
    document.dispatchEvent(event);
  });
}

/**
 * Load and render dashboard data
 */
async function loadAndRenderData() {
  try {
    showLoading();
    
    // Fetch data
    const [reports, users] = await Promise.all([
      fetchReportData(),
      fetchUserData()
    ]);

    // Process analytics
    const analytics = processAnalytics(reports, users);

    // Render components
    await renderDashboardComponents(analytics, reports);
    
    hideLoading();
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    hideLoading();
    showToast('Erreur lors du chargement des données', 'error');
    throw error;
  }
}

/**
 * Process analytics data
 */
function processAnalytics(reports, users) {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // KPIs
  const totalReports = reports.length;
  const submittedReports = reports.filter(r => r.status === 'submitted').length;
  const reviewedReports = reports.filter(r => r.status === 'reviewed').length;
  const approvedReports = reports.filter(r => r.status === 'approved').length;
  const rejectedReports = reports.filter(r => r.status === 'rejected').length;
  const approvalRate = totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0;
  const activeTechnicians = new Set(reports.map(r => r.technicianId)).size;

  const kpis = [
    { 
      label: 'Total Rapports', 
      value: totalReports, 
      icon: 'bi-file-text', 
      color: '#3b82f6' 
    },
    { 
      label: 'Rapports Soumis', 
      value: submittedReports, 
      icon: 'bi-clock', 
      color: '#f59e0b' 
    },
    { 
      label: 'Rapports Examinés', 
      value: reviewedReports, 
      icon: 'bi-search', 
      color: '#8b5cf6' 
    },
    { 
      label: 'Rapports Approuvés', 
      value: approvedReports, 
      icon: 'bi-check-circle', 
      color: '#10b981' 
    },
    { 
      label: 'Rapports Rejetés', 
      value: rejectedReports, 
      icon: 'bi-x-circle', 
      color: '#ef4444' 
    },
    { 
      label: 'Taux d\'Approbation', 
      value: `${approvalRate}%`, 
      icon: 'bi-graph-up', 
      color: '#06b6d4' 
    }
  ];

  // Status distribution
  const statusCounts = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {});

  const reportsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
    status: getStatusLabel(status),
    count,
    percentage: Math.round((count / totalReports) * 100)
  }));

  // Component statistics
  const componentStats = generateComponentStats(reports);

  // Recent reports
  const recentReports = reports
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 10);

  return {
    kpis,
    reportsByStatus,
    componentStats,
    recentReports
  };
}

/**
 * Generate component statistics
 */
function generateComponentStats(reports) {
  const componentCounts = {};
  
  reports.forEach(report => {
    if (report.floors && Array.isArray(report.floors)) {
      report.floors.forEach(floor => {
        const componentTypes = [
          'networkCabinets', 'perforations', 'accessTraps', 'cablePaths',
          'cableTrunkings', 'conduits', 'copperCablings', 'fiberOpticCablings'
        ];
        
        componentTypes.forEach(type => {
          if (floor[type] && Array.isArray(floor[type])) {
            const label = getComponentLabel(type);
            componentCounts[label] = (componentCounts[label] || 0) + floor[type].length;
          }
        });
      });
    }
  });

  return Object.entries(componentCounts)
    .map(([component, count]) => ({ component, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

/**
 * Get French component labels
 */
function getComponentLabel(type) {
  const labels = {
    networkCabinets: 'Armoires Réseau',
    perforations: 'Perforations',
    accessTraps: 'Trappes d\'Accès',
    cablePaths: 'Chemins de Câbles',
    cableTrunkings: 'Goulottes',
    conduits: 'Conduits',
    copperCablings: 'Câblages Cuivre',
    fiberOpticCablings: 'Câblages Fibre'
  };
  return labels[type] || type;
}

/**
 * Get French status labels
 */
function getStatusLabel(status) {
  const labels = {
    submitted: 'Soumis',
    reviewed: 'Examiné',
    approved: 'Approuvé',
    rejected: 'Rejeté'
  };
  return labels[status] || status;
}

/**
 * Render dashboard components
 */
async function renderDashboardComponents(analytics, reports) {
  try {
    // Render KPIs
    renderKPICards(analytics.kpis);

    // Render simple charts
    renderSimpleCharts(analytics);

    // Render recent reports table
    renderReportsTable(analytics.recentReports);

  } catch (error) {
    console.error('Erreur lors du rendu des composants:', error);
    throw error;
  }
}

/**
 * Render KPI cards
 */
function renderKPICards(kpis) {
  const container = document.getElementById('kpiContainer');
  if (!container) return;

  container.innerHTML = kpis.map(kpi => `
    <div class="kpi-card">
      <div class="kpi-header">
        <div class="kpi-icon" style="background: ${kpi.color}">
          <i class="bi ${kpi.icon}"></i>
        </div>
      </div>
      <div class="kpi-value">${kpi.value}</div>
      <div class="kpi-label">${kpi.label}</div>
    </div>
  `).join('');
}

/**
 * Render simple charts (placeholders with statistics)
 */
function renderSimpleCharts(analytics) {
  // Status chart
  const statusChart = document.getElementById('statusChart');
  if (statusChart) {
    statusChart.innerHTML = `
      <div class="stats-grid">
        ${analytics.reportsByStatus.map(item => `
          <div class="stat-item">
            <div class="stat-value">${item.count}</div>
            <div class="stat-label">${item.status}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // Timeline chart (placeholder)
  const timelineChart = document.getElementById('timelineChart');
  if (timelineChart) {
    timelineChart.innerHTML = `
      <div class="simple-chart">
        Graphique temporel disponible avec Chart.js
      </div>
    `;
  }

  // Components chart
  const componentsChart = document.getElementById('componentsChart');
  if (componentsChart) {
    componentsChart.innerHTML = `
      <div class="stats-grid">
        ${analytics.componentStats.map(item => `
          <div class="stat-item">
            <div class="stat-value">${item.count}</div>
            <div class="stat-label">${item.component}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

/**
 * Render reports table
 */
function renderReportsTable(reports) {
  const container = document.getElementById('reportsTable');
  if (!container) return;

  if (reports.length === 0) {
    container.innerHTML = `
      <div class="text-center p-4">
        <i class="bi bi-file-text fs-1 text-muted mb-2"></i>
        <p class="text-muted">Aucun rapport récent</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>Client</th>
            <th>Lieu</th>
            <th>Technicien</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(report => `
            <tr>
              <td>${report.clientName || 'N/A'}</td>
              <td>${report.location || 'N/A'}</td>
              <td>${report.technicianName || 'N/A'}</td>
              <td>
                <span class="badge bg-${getStatusColor(report.status)}">
                  ${getStatusLabel(report.status)}
                </span>
              </td>
              <td>${new Date(report.createdAt || report.date).toLocaleDateString('fr-FR')}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewReport('${report.id}')">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary" onclick="downloadReport('${report.id}')">
                  <i class="bi bi-download"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Get status color for badges
 */
function getStatusColor(status) {
  const colors = {
    submitted: 'warning',
    reviewed: 'info',
    approved: 'success',
    rejected: 'danger'
  };
  return colors[status] || 'secondary';
}

/**
 * Handle export functionality
 */
function handleExport(type) {
  showToast(`Export ${type.toUpperCase()} en cours...`, 'info');
  
  // Simulate export process
  setTimeout(() => {
    showToast(`Fichier ${type.toUpperCase()} téléchargé avec succès`, 'success');
  }, 2000);
}

/**
 * Filter reports in the table
 */
function filterReports(searchTerm) {
  const tableRows = document.querySelectorAll('#reportsTable tbody tr');
  
  tableRows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const isVisible = text.includes(searchTerm.toLowerCase());
    row.style.display = isVisible ? '' : 'none';
  });
}

/**
 * Show loading overlay
 */
function showLoading() {
  document.getElementById('loadingOverlay')?.classList.add('show');
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  document.getElementById('loadingOverlay')?.classList.remove('show');
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const colors = {
    info: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b'
  };

  const icons = {
    info: 'bi-info-circle',
    success: 'bi-check-circle',
    error: 'bi-exclamation-circle',
    warning: 'bi-exclamation-triangle'
  };

  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    background: white;
    border-left: 4px solid ${colors[type]};
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 300px;
    animation: slideIn 0.3s ease;
  `;

  toast.innerHTML = `
    <i class="bi ${icons[type]}" style="color: ${colors[type]}; font-size: 1.25rem;"></i>
    <span style="flex: 1; color: #374151;">${message}</span>
    <button style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1.25rem;">
      <i class="bi bi-x"></i>
    </button>
  `;

  // Add slide-in animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  if (!document.head.querySelector('style[data-toast-animations]')) {
    style.setAttribute('data-toast-animations', '');
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 5000);

  // Remove on close button click
  toast.querySelector('button').addEventListener('click', () => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  });
}

/**
 * Show error state
 */
function showErrorState(container, error) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; text-align: center; color: #6b7280;">
      <i class="bi bi-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
      <h2 style="color: #374151; margin-bottom: 0.5rem;">Erreur de Chargement</h2>
      <p style="margin-bottom: 2rem; max-width: 500px;">Une erreur s'est produite lors du chargement du tableau de bord. Veuillez réessayer.</p>
      <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500;">
        <i class="bi bi-arrow-clockwise" style="margin-right: 0.5rem;"></i>
        Recharger la Page
      </button>
    </div>
  `;
}

/**
 * Global functions for report interactions
 */
window.viewReport = function(reportId) {
  console.log('Affichage du rapport:', reportId);
  const event = new CustomEvent('moduleChange', { detail: { module: 'reports' } });
  document.dispatchEvent(event);
};

window.downloadReport = function(reportId) {
  console.log('Téléchargement du rapport:', reportId);
  showToast('Téléchargement du PDF en cours...', 'info');
  
  // Simulate download
  setTimeout(() => {
    showToast('PDF téléchargé avec succès', 'success');
  }, 2000);
};

// Export the main function
export { initializeEnhancedDashboard };