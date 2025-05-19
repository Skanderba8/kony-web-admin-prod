// src/dashboard.js
import { createFilterPanel } from './bi/components/filters.js';
import { renderKPICards } from './bi/components/kpis.js';
import { renderStatusPieChart, renderTimeSeriesChart, renderComponentDistributionChart } from './bi/components/charts.js';
import { createTechnicianTable, createReportSummaryTable } from './bi/components/data-tables.js';
import { getBusinessAnalytics, getFilteredAnalytics, getTechnicianPerformance } from './bi/services/analytics.js';
import { generateExcelReport, generatePdfReport } from './bi/services/report-generator.js';

/**
 * Initializes the Business Intelligence dashboard
 * @param {HTMLElement} container - The container element to render the dashboard
 */
export function initializeBIDashboard(container = document.getElementById('contentContainer')) {
  console.log('Initializing modern BI Dashboard');
  
  // Set page title
  const pageTitle = 'Business Intelligence Dashboard';
  
  // Create dashboard UI
  container.innerHTML = `
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="page-title">${pageTitle}</h1>
        <p class="text-muted">Analyze and monitor technical visit reports performance</p>
      </div>
      <div class="page-actions">
        <div class="btn-group" role="group">
          <button class="btn btn-outline-primary" id="refreshDashboardBtn">
            <i class="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
          <button class="btn btn-outline-primary" id="exportExcelBtn">
            <i class="bi bi-file-excel me-1"></i>Export Excel
          </button>
          <button class="btn btn-outline-primary" id="exportPdfBtn">
            <i class="bi bi-file-pdf me-1"></i>Export PDF
          </button>
        </div>
      </div>
    </div>
    
    <div class="row">
      <!-- Filters Panel -->
      <div class="col-lg-3 mb-4">
        <div id="filtersContainer"></div>
      </div>
      
      <!-- Dashboard Content -->
      <div class="col-lg-9">
        <!-- KPI Cards -->
        <div id="kpiContainer" class="mb-4">
          <div class="card">
            <div class="card-body p-0">
              <div class="dashboard-skeleton">
                <div class="skeleton-kpi-row">
                  <div class="skeleton-item"></div>
                  <div class="skeleton-item"></div>
                  <div class="skeleton-item"></div>
                </div>
                <div class="skeleton-kpi-row">
                  <div class="skeleton-item"></div>
                  <div class="skeleton-item"></div>
                  <div class="skeleton-item"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Charts Row -->
        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Report Status Distribution</h5>
                <div class="card-actions">
                  <button class="btn btn-sm btn-icon btn-light" id="statusChartOptions" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" id="refreshStatusChart">Refresh</a></li>
                    <li><a class="dropdown-item" href="#" id="downloadStatusChartImage">Download as Image</a></li>
                  </ul>
                </div>
              </div>
              <div class="card-body">
                <div class="chart-container" style="position: relative; height: 290px;">
                  <canvas id="reportStatusChart"></canvas>
                  <div class="chart-loader">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-6 mb-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Report Trends</h5>
                <div class="card-actions">
                  <button class="btn btn-sm btn-icon btn-light" id="trendsChartOptions" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#" id="refreshTrendsChart">Refresh</a></li>
                    <li><a class="dropdown-item" href="#" id="downloadTrendsChartImage">Download as Image</a></li>
                  </ul>
                </div>
              </div>
              <div class="card-body">
                <div class="chart-container" style="position: relative; height: 290px;">
                  <canvas id="trendsChart"></canvas>
                  <div class="chart-loader">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Component Distribution Chart -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Component Distribution</h5>
            <div class="card-actions">
              <button class="btn btn-sm btn-icon btn-light" id="componentChartOptions" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" id="refreshComponentChart">Refresh</a></li>
                <li><a class="dropdown-item" href="#" id="downloadComponentChartImage">Download as Image</a></li>
              </ul>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="position: relative; height: 400px;">
              <div id="componentDistributionChart"></div>
              <div class="chart-loader">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Technician Performance -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Technician Performance</h5>
            <div class="card-actions">
              <button class="btn btn-sm btn-outline-primary" id="viewAllTechnicians">
                View All <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div id="technicianTableContainer">
              <div class="dashboard-skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Reports -->
        <div class="card mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Recent Reports</h5>
            <div class="card-actions">
              <button class="btn btn-sm btn-outline-primary" id="viewAllReports">
                View All <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
          <div class="card-body p-0">
            <div id="recentReportsContainer">
              <div class="dashboard-skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
                <div class="skeleton-row"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Initialize Filter Panel
  const filterPanel = createFilterPanel('filtersContainer', handleFilterChange);
  
  // Add event listeners for actions
  document.getElementById('refreshDashboardBtn').addEventListener('click', () => {
    loadDashboardData(true);
  });
  
  document.getElementById('exportExcelBtn').addEventListener('click', async () => {
    await exportToExcel();
  });
  
  document.getElementById('exportPdfBtn').addEventListener('click', async () => {
    await exportToPdf();
  });
  
  // View all buttons
  document.getElementById('viewAllTechnicians').addEventListener('click', () => {
    alert('Full technician performance report view is not implemented yet.');
  });
  
  document.getElementById('viewAllReports').addEventListener('click', () => {
    // Trigger navigation to reports tab
    const event = new CustomEvent('moduleChange', { detail: { module: 'reports' } });
    document.dispatchEvent(event);
  });
  
  // Load initial dashboard data with a small delay
  setTimeout(() => {
    loadDashboardData();
  }, 300);
  
  /**
   * Handle filter changes
   * @param {Object} filters - The selected filters
   */
  async function handleFilterChange(filters) {
    console.log('Filters changed:', filters);
    await loadDashboardData(false, filters);
  }
  
  /**
   * Load dashboard data
   * @param {boolean} forceRefresh - Whether to force a data refresh
   * @param {Object} filters - Optional filters to apply
   */
  async function loadDashboardData(forceRefresh = false, filters = {}) {
    try {
      // Show loading states
      showLoadingState();
      
      // Get analytics data
      const analytics = filters && Object.keys(filters).length > 0 ? 
        await getFilteredAnalytics(filters) : 
        await getBusinessAnalytics(forceRefresh);
      
      // Get technician performance data
      const technicianData = await getTechnicianPerformance();
      
      // Update filter options with available clients and technicians
      const clients = [...new Set(analytics.reportTimelines.map(report => report.clientName).filter(Boolean))];
      const technicians = [...new Set(analytics.reportTimelines.map(report => report.technicianName).filter(Boolean))];
      filterPanel.updateOptions(clients, technicians);
      
      // Render KPI cards
      renderKPICards('kpiContainer', analytics.kpis);
      
      // Render charts
      const statusChart = renderStatusPieChart('reportStatusChart', analytics.reportsByStatus);
      const trendsChart = renderTimeSeriesChart('trendsChart', analytics.timeSeries);
      const componentChart = renderComponentDistributionChart('componentDistributionChart', analytics.componentStats);
      
      // Add chart download handlers
      setupChartDownloads('statusChart', statusChart);
      setupChartDownloads('trendsChart', trendsChart);
      setupChartDownloads('componentChart', componentChart);
      
      // Create technician performance table
      createTechnicianTable('technicianTableContainer', technicianData);
      
      // Create recent reports table
      const sortedReports = [...Object.values(analytics.reportsByStatus)].flat()
        .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))
        .slice(0, 10);
      
      createReportSummaryTable('recentReportsContainer', sortedReports);
      
      // Hide loaders
      hideLoadingState();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Show error state
      showErrorState(error.message);
    }
  }
  
  /**
   * Set up chart download handlers
   * @param {string} prefix - The prefix for element IDs
   * @param {Object} chart - The chart instance
   */
  function setupChartDownloads(prefix, chart) {
    // Refresh button
    document.getElementById(`refresh${prefix.charAt(0).toUpperCase() + prefix.slice(1)}`).addEventListener('click', (e) => {
      e.preventDefault();
      loadDashboardData(true);
    });
    
    // Download button
    document.getElementById(`download${prefix.charAt(0).toUpperCase() + prefix.slice(1)}Image`).addEventListener('click', (e) => {
      e.preventDefault();
      
      // Create anchor element
      const link = document.createElement('a');
      
      // Get chart canvas and convert to data URL
      const canvas = document.getElementById(prefix === 'componentChart' ? 'componentDistributionChart' : prefix);
      const dataUrl = prefix === 'componentChart' 
        ? chart.getDataURL()
        : canvas.toDataURL('image/png');
      
      // Set download attributes
      link.download = `${prefix}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show notification
      showNotification('Chart Downloaded', 'The chart image has been downloaded successfully', 'success');
    });
  }
  
  /**
   * Show loading state for dashboard elements
   */
  function showLoadingState() {
    // Show chart loaders
    document.querySelectorAll('.chart-loader').forEach(loader => {
      loader.style.display = 'flex';
    });
    
    // Disable action buttons
    document.getElementById('refreshDashboardBtn').disabled = true;
    document.getElementById('exportExcelBtn').disabled = true;
    document.getElementById('exportPdfBtn').disabled = true;
  }
  
  /**
   * Hide loading state for dashboard elements
   */
  function hideLoadingState() {
    // Hide chart loaders
    document.querySelectorAll('.chart-loader').forEach(loader => {
      loader.style.display = 'none';
    });
    
    // Enable action buttons
    document.getElementById('refreshDashboardBtn').disabled = false;
    document.getElementById('exportExcelBtn').disabled = false;
    document.getElementById('exportPdfBtn').disabled = false;
  }
  
  /**
   * Show error state for dashboard
   * @param {string} message - The error message to display
   */
  function showErrorState(message) {
    // Hide loaders
    document.querySelectorAll('.chart-loader').forEach(loader => {
      loader.style.display = 'none';
    });
    
    // Show error message in KPI container
    document.getElementById('kpiContainer').innerHTML = `
      <div class="alert alert-danger">
        <div class="d-flex">
          <div class="me-3">
            <i class="bi bi-exclamation-triangle-fill fs-1"></i>
          </div>
          <div>
            <h4 class="alert-heading">Dashboard Error</h4>
            <p>${message}</p>
            <button class="btn btn-danger" id="retryDashboardBtn">
              <i class="bi bi-arrow-clockwise me-2"></i>Retry
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add retry handler
    document.getElementById('retryDashboardBtn').addEventListener('click', () => {
      loadDashboardData(true);
    });
    
    // Enable refresh button
    document.getElementById('refreshDashboardBtn').disabled = false;
  }
  
  /**
   * Export dashboard data to Excel
   */
  async function exportToExcel() {
    try {
      // Show loading notification
      showNotification('Generating Excel', 'Preparing Excel report, please wait...', 'info');
      
      // Get current filters
      const filters = filterPanel.getFilters();
      
      // Generate Excel file
      const excelBlob = await generateExcelReport(filters);
      
      // Create download link
      const url = URL.createObjectURL(excelBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `BI-Dashboard-Report-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      // Show success notification
      showNotification('Excel Report Ready', 'The Excel report has been downloaded successfully', 'success');
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification('Export Failed', `Error generating Excel report: ${error.message}`, 'danger');
    }
  }
  
  /**
   * Export dashboard to PDF
   */
  async function exportToPdf() {
    try {
      // Show loading notification
      showNotification('Generating PDF', 'Preparing PDF report, please wait...', 'info');
      
      // Prepare container for PDF generation
      const dashboardElement = document.querySelector('.col-lg-9');
      
      // Generate PDF document
      const pdfDoc = await generatePdfReport(dashboardElement, 'BI Dashboard Report');
      
      // Save and download PDF
      const pdfBlob = pdfDoc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `BI-Dashboard-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      // Show success notification
      showNotification('PDF Report Ready', 'The PDF report has been downloaded successfully', 'success');
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showNotification('Export Failed', `Error generating PDF report: ${error.message}`, 'danger');
    }
  }
  
  /**
   * Show a notification toast
   * @param {string} title - The notification title
   * @param {string} message - The notification message
   * @param {string} type - The notification type (success, danger, warning, info)
   */
  function showNotification(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    const iconMap = {
      success: 'bi-check-circle',
      danger: 'bi-exclamation-triangle',
      warning: 'bi-exclamation-circle',
      info: 'bi-info-circle'
    };
    
    toast.innerHTML = `
      <div class="toast-header bg-${type} text-white">
        <i class="bi ${iconMap[type] || 'bi-bell'} me-2"></i>
        <strong class="me-auto">${title}</strong>
        <small>Just now</small>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}