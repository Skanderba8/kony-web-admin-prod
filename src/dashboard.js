// src/dashboard.js - Simple BI Dashboard
import { fetchReportData, fetchUserData } from './bi/services/data-processing.js';
import { renderKPICards } from './bi/components/kpis.js';
import { renderStatusPieChart, renderTimeSeriesChart, renderComponentDistributionChart } from './bi/components/charts.js';
import { createReportSummaryTable } from './bi/components/data-tables.js';

/**
 * Initialize the BI Dashboard
 * @param {HTMLElement} container - The container element
 */
export async function initializeBIDashboard(container = document.getElementById('contentContainer')) {
  console.log('Initializing BI Dashboard');
  
  try {
    // Clear container
    container.innerHTML = '';
    
    // Create dashboard layout
    container.innerHTML = `
      <div class="dashboard-container">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="page-title">
              <i class="bi bi-graph-up me-2"></i>
              Business Intelligence
            </h1>
            <p class="text-muted">Tableau de bord analytique des rapports de visite technique</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary" id="refreshBtn">
              <i class="bi bi-arrow-clockwise me-2"></i>Actualiser
            </button>
            <button class="btn btn-primary" id="exportBtn">
              <i class="bi bi-download me-2"></i>Exporter
            </button>
          </div>
        </div>

        <!-- KPIs Section -->
        <div id="kpiSection" class="mb-4">
          <div class="row" id="kpiContainer">
            <!-- KPIs will be rendered here -->
          </div>
        </div>

        <!-- Charts Section -->
        <div class="row mb-4">
          <!-- Status Chart -->
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-pie-chart me-2"></i>
                  Répartition par Statut
                </h5>
              </div>
              <div class="card-body">
                <canvas id="statusChart" width="400" height="300"></canvas>
              </div>
            </div>
          </div>

          <!-- Timeline Chart -->
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-graph-up me-2"></i>
                  Évolution Temporelle
                </h5>
              </div>
              <div class="card-body">
                <canvas id="timelineChart" width="400" height="300"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Component Chart -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-diagram-3 me-2"></i>
                  Distribution des Composants
                </h5>
              </div>
              <div class="card-body">
                <canvas id="componentsChart" width="800" height="400"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Reports Table -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">
                  <i class="bi bi-file-earmark-text me-2"></i>
                  Rapports Récents
                </h5>
              </div>
              <div class="card-body p-0">
                <div id="reportsTable">
                  <!-- Table will be rendered here -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Show loading state
    showLoadingState(container);

    // Load and display data
    await loadDashboardData(container);

    // Set up event listeners
    setupEventListeners();

    console.log('BI Dashboard initialized successfully');

  } catch (error) {
    console.error('Error initializing BI Dashboard:', error);
    showErrorState(container, error);
  }
}

/**
 * Show loading state
 */
function showLoadingState(container) {
  const kpiContainer = container.querySelector('#kpiContainer');
  const charts = ['statusChart', 'timelineChart', 'componentsChart'];
  const reportsTable = container.querySelector('#reportsTable');

  // Show loading KPIs
  if (kpiContainer) {
    kpiContainer.innerHTML = Array(6).fill(0).map(() => `
      <div class="col-xl-2 col-md-4 col-sm-6 mb-3">
        <div class="card">
          <div class="card-body text-center">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <p class="card-text">Chargement...</p>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Show loading charts
  charts.forEach(chartId => {
    const chartElement = container.querySelector(`#${chartId}`);
    if (chartElement) {
      const chartContainer = chartElement.closest('.card-body');
      if (chartContainer) {
        chartContainer.innerHTML = `
          <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
            <div class="text-center">
              <div class="spinner-border text-primary mb-2" role="status"></div>
              <p>Chargement du graphique...</p>
            </div>
          </div>
        `;
      }
    }
  });

  // Show loading table
  if (reportsTable) {
    reportsTable.innerHTML = `
      <div class="d-flex justify-content-center align-items-center p-5">
        <div class="text-center">
          <div class="spinner-border text-primary mb-2" role="status"></div>
          <p>Chargement des rapports...</p>
        </div>
      </div>
    `;
  }
}

/**
 * Load dashboard data
 */
async function loadDashboardData(container) {
  try {
    console.log('Loading dashboard data...');

    // Fetch data
    const reports = await fetchReportData();
    const users = await fetchUserData();

    console.log(`Loaded ${reports.length} reports and ${users.length} users`);

    // Process data for analytics
    const analytics = processAnalyticsData(reports, users);

    // Render components
    await renderDashboardComponents(analytics, reports);

  } catch (error) {
    console.error('Error loading dashboard data:', error);
    throw error;
  }
}

/**
 * Process analytics data
 */
function processAnalyticsData(reports, users) {
  // Count reports by status
  const reportsByStatus = {};
  reports.forEach(report => {
    const status = report.status || 'unknown';
    reportsByStatus[status] = (reportsByStatus[status] || 0) + 1;
  });

  // Count technicians
  const technicians = users.filter(user => user.role === 'technician');

  // Component statistics
  const componentStats = analyzeComponents(reports);

  // Calculate KPIs
  const kpis = {
    totalReports: reports.length,
    totalSubmitted: reportsByStatus.submitted || 0,
    totalReviewed: reportsByStatus.reviewed || 0,
    totalApproved: reportsByStatus.approved || 0,
    avgComponentsPerReport: componentStats.total / Math.max(reports.length, 1),
    totalTechnicians: technicians.length
  };

  // Time series data
  const timeSeries = generateTimeSeries(reports);

  return {
    kpis,
    reportsByStatus,
    componentStats,
    timeSeries,
    recentReports: reports.slice(0, 10) // Get 10 most recent
  };
}

/**
 * Analyze components
 */
function analyzeComponents(reports) {
  const componentTypes = {
    networkCabinets: 'Baies Réseau',
    perforations: 'Percements',
    accessTraps: 'Trappes d\'Accès',
    cablePaths: 'Chemins de Câbles',
    cableTrunkings: 'Goulottes',
    conduits: 'Conduits',
    copperCablings: 'Câblage Cuivre',
    fiberOpticCablings: 'Fibre Optique'
  };

  const stats = {};
  let total = 0;

  Object.keys(componentTypes).forEach(type => {
    stats[type] = { name: componentTypes[type], count: 0 };
  });

  reports.forEach(report => {
    if (report.floors && Array.isArray(report.floors)) {
      report.floors.forEach(floor => {
        Object.keys(componentTypes).forEach(type => {
          if (floor[type] && Array.isArray(floor[type])) {
            const count = floor[type].length;
            stats[type].count += count;
            total += count;
          }
        });
      });
    }
  });

  return { ...stats, total };
}

/**
 * Generate time series data
 */
function generateTimeSeries(reports) {
  const last30Days = [];
  const now = new Date();

  // Generate last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayReports = reports.filter(report => {
      const reportDate = report.createdAt?.toDate ? 
        report.createdAt.toDate().toISOString().split('T')[0] :
        new Date(report.createdAt).toISOString().split('T')[0];
      return reportDate === dateStr;
    });

    last30Days.push({
      date: dateStr,
      created: dayReports.length,
      submitted: dayReports.filter(r => r.status === 'submitted').length
    });
  }

  return {
    created: last30Days,
    submitted: last30Days
  };
}

/**
 * Render dashboard components
 */
async function renderDashboardComponents(analytics, reports) {
  try {
    // Render KPIs
    renderKPICards('kpiContainer', analytics.kpis);

    // Render charts
    renderStatusPieChart('statusChart', analytics.reportsByStatus);
    renderTimeSeriesChart('timelineChart', analytics.timeSeries);
    renderComponentDistributionChart('componentsChart', analytics.componentStats);

    // Render recent reports table
    createReportSummaryTable('reportsTable', analytics.recentReports, 
      (reportId) => viewReport(reportId),
      (reportId) => downloadReport(reportId)
    );

  } catch (error) {
    console.error('Error rendering dashboard components:', error);
    throw error;
  }
}

/**
 * Show error state
 */
function showErrorState(container, error) {
  container.innerHTML = `
    <div class="alert alert-danger text-center" role="alert">
      <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
      <h4 class="alert-heading">Erreur de Chargement</h4>
      <p>Une erreur s'est produite lors du chargement du tableau de bord.</p>
      <hr>
      <p class="mb-0">
        <small>${error.message}</small>
      </p>
      <button class="btn btn-danger mt-3" onclick="window.location.reload()">
        <i class="bi bi-arrow-clockwise me-2"></i>
        Recharger la Page
      </button>
    </div>
  `;
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      window.location.reload();
    });
  }

  // Export button
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      alert('Fonctionnalité d\'export en cours de développement');
    });
  }
}

/**
 * View report function (called from table)
 */
function viewReport(reportId) {
  console.log('Viewing report:', reportId);
  // Navigate to reports module
  const event = new CustomEvent('moduleChange', { detail: { module: 'reports' } });
  document.dispatchEvent(event);
}

/**
 * Download report function (called from table)
 */
function downloadReport(reportId) {
  console.log('Downloading report:', reportId);
  // Trigger download
  const event = new CustomEvent('downloadReport', { detail: { reportId } });
  document.dispatchEvent(event);
}

// Make functions globally available
window.viewReport = viewReport;
window.downloadReport = downloadReport;