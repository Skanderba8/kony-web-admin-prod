// src/dashboard.js - Enhanced BI Dashboard

import './bi/css/dashboard.css';
import { createFilterPanel } from './bi/components/filters.js';
import { renderKPISummaryCards } from './bi/components/summary-cards.js';
import { createReportSummaryTable, createTechnicianPerformanceTable } from './bi/components/data-tables.js';
import { db } from './firebase/config.js';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { Chart, registerables } from 'chart.js';
import * as echarts from 'echarts';
import { generateExcelReport, generatePdfReport } from './bi/services/report-generator.js';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Initializes the enhanced BI Dashboard
 * @param {HTMLElement} container - The container element
 */
export function initializeBIDashboard(container = document.getElementById('contentContainer')) {
  console.log('Initializing enhanced BI Dashboard');
  
  // Set page title
  const pageTitle = 'Business Intelligence Dashboard';
  
  // Create dashboard UI with modern layout
  container.innerHTML = `
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="page-title">${pageTitle}</h1>
        <p class="text-muted">Analytics and insights for technical visit reports</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="refreshDashboardBtn">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh Data
        </button>
        <button class="btn btn-outline-primary ms-2" id="exportDashboardBtn">
          <i class="bi bi-download me-2"></i>Export
        </button>
      </div>
    </div>
    
    <!-- Dashboard Container -->
    <div class="dashboard-container">
      <div class="row">
        <!-- Filters Column -->
        <div class="col-lg-3 mb-4">
          <div id="filtersContainer"></div>
          
          <!-- Date Range Filter Card -->
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary bg-opacity-10">
              <h5 class="mb-0">
                <i class="bi bi-calendar3 me-2"></i>
                Time Period
              </h5>
            </div>
            <div class="card-body">
              <div class="row gy-2">
                <div class="col-12">
                  <label for="startDateFilter" class="form-label">From</label>
                  <input type="date" class="form-control" id="startDateFilter">
                </div>
                <div class="col-12">
                  <label for="endDateFilter" class="form-label">To</label>
                  <input type="date" class="form-control" id="endDateFilter">
                </div>
                <div class="col-12 mt-3">
                  <button class="btn btn-primary w-100" id="applyDateFilterBtn">
                    <i class="bi bi-funnel me-1"></i> Apply Filter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main Dashboard Content -->
        <div class="col-lg-9">
          <!-- KPI Summary Cards -->
          <div class="row" id="kpiCardsContainer">
            <!-- KPI cards will be inserted here -->
            <div class="col-xl-3 col-md-6">
              <div class="dashboard-skeleton">
                <div class="skeleton-item"></div>
              </div>
            </div>
            <div class="col-xl-3 col-md-6">
              <div class="dashboard-skeleton">
                <div class="skeleton-item"></div>
              </div>
            </div>
            <div class="col-xl-3 col-md-6">
              <div class="dashboard-skeleton">
                <div class="skeleton-item"></div>
              </div>
            </div>
            <div class="col-xl-3 col-md-6">
              <div class="dashboard-skeleton">
                <div class="skeleton-item"></div>
              </div>
            </div>
          </div>
          
          <!-- Charts Row -->
          <div class="row g-4 mb-4">
            <!-- Status Distribution Chart -->
            <div class="col-md-6">
              <div class="card shadow-sm h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">Report Status Distribution</h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-icon btn-light" type="button" data-bs-toggle="dropdown">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li><a class="dropdown-item" href="#" id="refreshStatusChart">Refresh</a></li>
                      <li><a class="dropdown-item" href="#" id="downloadStatusChartImage">Download as Image</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body">
                  <div class="position-relative" style="height: 300px;">
                    <canvas id="statusChart"></canvas>
                    <div class="chart-loader">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <span class="mt-2">Loading chart data...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Time Series Chart -->
            <div class="col-md-6">
              <div class="card shadow-sm h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">Report Activity Trends</h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-icon btn-light" type="button" data-bs-toggle="dropdown">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li><a class="dropdown-item" href="#" id="refreshTrendsChart">Refresh</a></li>
                      <li><a class="dropdown-item" href="#" id="switchTrendsView">Switch View</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body">
                  <div class="position-relative" style="height: 300px;">
                    <canvas id="trendsChart"></canvas>
                    <div class="chart-loader">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <span class="mt-2">Loading chart data...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Component Analysis -->
          <div class="row g-4 mb-4">
            <div class="col-md-8">
              <div class="card shadow-sm h-100">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="card-title mb-0">Component Distribution</h5>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-icon btn-light" type="button" data-bs-toggle="dropdown">
                      <i class="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                      <li><a class="dropdown-item" href="#" id="refreshComponentChart">Refresh</a></li>
                      <li><a class="dropdown-item" href="#" id="downloadComponentChartImage">Download as Image</a></li>
                    </ul>
                  </div>
                </div>
                <div class="card-body">
                  <div class="position-relative" style="height: 320px;">
                    <div id="componentChart" style="width: 100%; height: 100%;"></div>
                    <div class="chart-loader">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                      </div>
                      <span class="mt-2">Loading chart data...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-4">
              <div class="card shadow-sm h-100">
                <div class="card-header">
                  <h5 class="card-title mb-0">Component Statistics</h5>
                </div>
                <div class="card-body p-0">
                  <div id="componentStats" class="p-3">
                    <div class="dashboard-skeleton">
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
          
          <!-- Technician Performance -->
          <div class="card shadow-sm mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Technician Performance Analysis</h5>
              <div class="dropdown">
                <button class="btn btn-sm btn-icon btn-light" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-three-dots-vertical"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#" id="refreshTechnicianChart">Refresh</a></li>
                  <li><a class="dropdown-item" href="#" id="downloadTechnicianChartImage">Download as Image</a></li>
                </ul>
              </div>
            </div>
            <div class="card-body">
              <div class="position-relative" style="height: 320px;">
                <canvas id="technicianChart"></canvas>
                <div class="chart-loader">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                  <span class="mt-2">Loading chart data...</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Technician Performance Table -->
          <div class="card shadow-sm mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Technician Performance Details</h5>
              <button class="btn btn-sm btn-outline-primary" id="viewAllTechniciansBtn">
                View All <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
            <div class="card-body p-0">
              <div id="technicianTableContainer">
                <div class="dashboard-skeleton p-3">
                  <div class="skeleton-header"></div>
                  <div class="skeleton-row"></div>
                  <div class="skeleton-row"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recent Reports Table -->
          <div class="card shadow-sm mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">Recent Reports</h5>
              <button class="btn btn-sm btn-outline-primary" id="viewAllReportsBtn">
                View All <i class="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
            <div class="card-body p-0">
              <div id="recentReportsContainer">
                <div class="dashboard-skeleton p-3">
                  <div class="skeleton-header"></div>
                  <div class="skeleton-row"></div>
                  <div class="skeleton-row"></div>
                  <div class="skeleton-row"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Export Modal -->
    <div class="modal fade" id="exportModal" tabindex="-1" aria-labelledby="exportModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exportModalLabel">Export Dashboard</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Choose an export format:</p>
            <div class="row g-3">
              <div class="col-md-6">
                <div class="card h-100 cursor-pointer export-option" id="exportExcel">
                  <div class="card-body text-center p-4">
                    <i class="bi bi-file-earmark-excel text-success fs-1 mb-3"></i>
                    <h5>Excel</h5>
                    <p class="small text-muted mb-0">Export as Excel spreadsheet</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card h-100 cursor-pointer export-option" id="exportPdf">
                  <div class="card-body text-center p-4">
                    <i class="bi bi-file-earmark-pdf text-danger fs-1 mb-3"></i>
                    <h5>PDF</h5>
                    <p class="small text-muted mb-0">Export as PDF document</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Initialize Filter Panel
  const filterPanel = createFilterPanel('filtersContainer', handleFilterChange);
  
  // Initialize state
  let dashboardData = {
    reports: [],
    users: [],
    analytics: null
  };
  
  // Global chart instances
  let statusChart = null;
  let trendsChart = null;
  let componentChart = null;
  let technicianChart = null;
  let reportsTable = null;
  let technicianTable = null;
  let trendsChartView = 'month'; // 'month' or 'week'
  
  // Add event listeners
  document.getElementById('refreshDashboardBtn').addEventListener('click', () => {
    loadDashboardData(true);
  });
  
  document.getElementById('exportDashboardBtn').addEventListener('click', () => {
    const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
    exportModal.show();
  });
  
  document.getElementById('exportExcel').addEventListener('click', () => {
    exportToExcel();
    const exportModal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
    exportModal.hide();
  });
  
  document.getElementById('exportPdf').addEventListener('click', () => {
    exportToPdf();
    const exportModal = bootstrap.Modal.getInstance(document.getElementById('exportModal'));
    exportModal.hide();
  });
  
  document.getElementById('viewAllReportsBtn').addEventListener('click', () => {
    // Navigate to reports module
    const event = new CustomEvent('moduleChange', { detail: { module: 'reports' } });
    document.dispatchEvent(event);
  });
  
  document.getElementById('viewAllTechniciansBtn').addEventListener('click', () => {
    showNotification('Feature Coming Soon', 'Full technician performance dashboard will be available in the next update.', 'info');
  });
  
  // Add date filter event listener
  document.getElementById('applyDateFilterBtn').addEventListener('click', () => {
    const startDate = document.getElementById('startDateFilter').value;
    const endDate = document.getElementById('endDateFilter').value;
    
    if (startDate && endDate) {
      const filters = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
      loadDashboardData(false, filters);
    } else {
      showNotification('Date Filter Error', 'Please select both start and end dates', 'warning');
    }
  });
  
  // Chart refresh buttons
  document.getElementById('refreshStatusChart').addEventListener('click', () => {
    refreshChart('status');
  });
  
  document.getElementById('refreshTrendsChart').addEventListener('click', () => {
    refreshChart('trends');
  });
  
  document.getElementById('refreshComponentChart').addEventListener('click', () => {
    refreshChart('component');
  });
  
  document.getElementById('refreshTechnicianChart').addEventListener('click', () => {
    refreshChart('technician');
  });
  
  document.getElementById('switchTrendsView').addEventListener('click', () => {
    toggleTrendsView();
  });
  
  // Chart download buttons
  document.getElementById('downloadStatusChartImage').addEventListener('click', () => {
    downloadChartAsImage('statusChart', 'status-distribution');
  });
  
  document.getElementById('downloadTrendsChartImage').addEventListener('click', () => {
    downloadChartAsImage('trendsChart', 'report-trends');
  });
  
  document.getElementById('downloadComponentChartImage').addEventListener('click', () => {
    downloadChartAsImage('componentChart', 'component-distribution', true);
  });
  
  document.getElementById('downloadTechnicianChartImage').addEventListener('click', () => {
    downloadChartAsImage('technicianChart', 'technician-performance');
  });
  
  // Initialize with data
  loadDashboardData();
  
  /**
 * Load dashboard data from Firebase
 * @param {boolean} forceRefresh - Whether to force a refresh
 * @param {Object} filters - Optional filters to apply
 */
async function loadDashboardData(forceRefresh = false, filters = {}) {
  try {
    // Show loading state
    showLoading();
    
    console.log('--- BI DASHBOARD: Starting data load ---');
    
    // Fetch reports from Firestore
    const reportsRef = collection(db, 'technical_visit_reports');
    let reportsQuery = query(reportsRef, orderBy('createdAt', 'desc'));
    
    console.log('BI DASHBOARD: Created reports query');
    
    // Apply filters if provided
    if (filters.status) {
      console.log(`BI DASHBOARD: Applying status filter: ${filters.status}`);
      reportsQuery = query(reportsQuery, where('status', '==', filters.status));
    }
    
    if (filters.startDate && filters.endDate) {
      console.log(`BI DASHBOARD: Applying date filters from ${filters.startDate} to ${filters.endDate}`);
      const startTimestamp = Timestamp.fromDate(filters.startDate);
      const endTimestamp = Timestamp.fromDate(filters.endDate);
      reportsQuery = query(
        reportsQuery, 
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp)
      );
    }
    
    if (filters.technician) {
      console.log(`BI DASHBOARD: Applying technician filter: ${filters.technician}`);
      reportsQuery = query(reportsQuery, where('technicianName', '==', filters.technician));
    }
    
    if (filters.client) {
      console.log(`BI DASHBOARD: Applying client filter: ${filters.client}`);
      reportsQuery = query(reportsQuery, where('clientName', '==', filters.client));
    }
    
    // Fetch users from Firestore
    const usersRef = collection(db, 'users');
    console.log('BI DASHBOARD: Created users query');
    
    console.log('BI DASHBOARD: Executing queries...');
    
    // Execute both queries
    try {
      const [reportsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(reportsQuery),
        getDocs(usersRef)
      ]);
      
      console.log(`BI DASHBOARD: Got ${reportsSnapshot.docs.length} reports and ${usersSnapshot.docs.length} users`);
      
      // Process reports data
      console.log('BI DASHBOARD: Processing reports data...');
      const reports = reportsSnapshot.docs.map(doc => {
        try {
          const data = doc.data();
          
          // Log the first report to check structure
          if (doc === reportsSnapshot.docs[0]) {
            console.log('BI DASHBOARD: Sample report data structure:', {
              id: doc.id,
              hasCreatedAt: !!data.createdAt,
              hasSubmittedAt: !!data.submittedAt,
              hasLastModified: !!data.lastModified,
              status: data.status,
              hasFloors: !!data.floors,
              floorsIsArray: Array.isArray(data.floors),
              floorsLength: Array.isArray(data.floors) ? data.floors.length : 'N/A'
            });
          }
          
          return {
            id: doc.id,
            ...data,
            // Convert timestamps to dates
            createdAt: data.createdAt?.toDate() || new Date(),
            submittedAt: data.submittedAt?.toDate() || null,
            lastModified: data.lastModified?.toDate() || null
          };
        } catch (err) {
          console.error(`BI DASHBOARD: Error processing report ${doc.id}:`, err);
          return null;
        }
      }).filter(Boolean); // Remove any null values
      
      console.log(`BI DASHBOARD: Processed ${reports.length} valid reports`);
      
      // Process users data
      console.log('BI DASHBOARD: Processing users data...');
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`BI DASHBOARD: Processed ${users.length} users`);
      
      // Update state
      dashboardData.reports = reports;
      dashboardData.users = users;
      
      // Calculate analytics
      console.log('BI DASHBOARD: Calculating analytics...');
      try {
        dashboardData.analytics = processAnalyticsData(reports, users);
        console.log('BI DASHBOARD: Analytics calculated successfully');
        
        // Log analytics structure to verify it's complete
        console.log('BI DASHBOARD: Analytics structure:', {
          hasKpis: !!dashboardData.analytics.kpis,
          hasReportsByStatus: !!dashboardData.analytics.reportsByStatus,
          hasComponentStats: !!dashboardData.analytics.componentStats,
          hasTechnicianPerformance: !!dashboardData.analytics.technicianPerformance,
          hasTimeSeries: !!dashboardData.analytics.timeSeries
        });
      } catch (analyticsError) {
        console.error('BI DASHBOARD: Error calculating analytics:', analyticsError);
        throw analyticsError;
      }
      
      // Extract available technicians and clients for filters
      const technicians = [...new Set(reports.map(report => report.technicianName).filter(Boolean))];
      const clients = [...new Set(reports.map(report => report.clientName).filter(Boolean))];
      
      console.log(`BI DASHBOARD: Found ${technicians.length} technicians and ${clients.length} clients`);
      
      // Update filter options
      console.log('BI DASHBOARD: Updating filter options...');
      filterPanel.updateTechnicians(technicians);
      filterPanel.updateClients(clients);
      
      // Update dashboard components
      console.log('BI DASHBOARD: Updating dashboard components...');
      try {
        updateDashboard();
        console.log('BI DASHBOARD: Dashboard updated successfully');
      } catch (updateError) {
        console.error('BI DASHBOARD: Error updating dashboard:', updateError);
        throw updateError;
      }
      
      // Hide loading state
      hideLoading();
      
      // Show success notification
      if (forceRefresh) {
        showNotification('Data Refreshed', 'Dashboard data has been updated successfully', 'success');
      }
      
      console.log('--- BI DASHBOARD: Data load complete ---');
      
    } catch (queryError) {
      console.error('BI DASHBOARD: Error executing queries:', queryError);
      throw queryError;
    }
  } catch (error) {
    console.error('BI DASHBOARD: Error loading dashboard data:', error);
    hideLoading();
    showError(error.message);
  }
}
  
  /**
 * Process analytics data from reports and users
 * @param {Array} reports - The reports data
 * @param {Array} users - The users data
 * @returns {Object} - Processed analytics data
 */
function processAnalyticsData(reports, users) {
  console.log('BI DASHBOARD: processAnalyticsData started');
  
  // Calculate reports by status
  const reportsByStatus = {
    draft: 0,
    submitted: 0,
    reviewed: 0,
    approved: 0
  };
  
  reports.forEach(report => {
    if (report.status && reportsByStatus.hasOwnProperty(report.status)) {
      reportsByStatus[report.status]++;
    }
  });
  
  console.log('BI DASHBOARD: Reports by status:', reportsByStatus);
  
  // Process component statistics
  console.log('BI DASHBOARD: Processing component data...');
  try {
    const componentStats = processComponentData(reports);
    console.log('BI DASHBOARD: Component stats processed:', {
      totalComponents: componentStats.total,
      avgComponentsPerReport: componentStats.byReport
    });
  
    // Process technician performance
    console.log('BI DASHBOARD: Processing technician data...');
    const technicianPerformance = processTechnicianData(reports);
    console.log(`BI DASHBOARD: Processed ${Object.keys(technicianPerformance).length} technicians`);
    
    // Calculate KPIs
    console.log('BI DASHBOARD: Calculating KPIs...');
    const kpis = {
      totalReports: reports.length,
      totalSubmitted: reportsByStatus.submitted,
      totalReviewed: reportsByStatus.reviewed,
      totalApproved: reportsByStatus.approved,
      avgCompletionTime: calculateAvgCompletionTime(reports),
      totalComponents: componentStats.total,
      avgComponentsPerReport: componentStats.byReport,
      reportsByStatus: reportsByStatus,
      componentStats: componentStats,
      totalTechnicians: users.filter(u => u.role === 'technician').length,
      mostActiveClient: findMostActiveClient(reports),
      mostActiveTechnician: findMostActiveTechnician(reports)
    };
    
    console.log('BI DASHBOARD: KPIs calculated:', kpis);
    
    // Generate time series data
    console.log('BI DASHBOARD: Generating time series data...');
    const timeSeries = generateTimeSeriesData(reports);
    console.log('BI DASHBOARD: Time series data generated');
    
    const result = {
      kpis,
      reportsByStatus,
      componentStats,
      technicianPerformance,
      timeSeries
    };
    
    console.log('BI DASHBOARD: processAnalyticsData completed');
    return result;
  } catch (error) {
    console.error('BI DASHBOARD: Error in processAnalyticsData:', error);
    // Return minimal valid analytics to prevent dashboard from breaking
    return {
      kpis: {
        totalReports: reports.length,
        totalSubmitted: 0,
        totalReviewed: 0,
        totalApproved: 0,
        avgCompletionTime: 0,
        totalComponents: 0,
        avgComponentsPerReport: 0,
        totalTechnicians: users.filter(u => u.role === 'technician').length,
        mostActiveClient: '',
        mostActiveTechnician: ''
      },
      reportsByStatus: { draft: 0, submitted: 0, reviewed: 0, approved: 0 },
      componentStats: { types: {}, total: 0, byReport: 0 },
      technicianPerformance: {},
      timeSeries: { monthly: { labels: [], created: [], submitted: [] }, weekly: { labels: [], created: [], submitted: [] } }
    };
  }
}
  
  /**
 * Process component data from reports
 * @param {Array} reports - Reports data
 * @returns {Object} - Component statistics
 */
function processComponentData(reports) {
  console.log('BI DASHBOARD: processComponentData started with', reports.length, 'reports');
  
  try {
    // Define component types
    const componentTypes = {
      networkCabinets: { count: 0, name: 'Network Cabinets' },
      perforations: { count: 0, name: 'Perforations' },
      accessTraps: { count: 0, name: 'Access Traps' },
      cablePaths: { count: 0, name: 'Cable Paths' },
      cableTrunkings: { count: 0, name: 'Cable Trunkings' },
      conduits: { count: 0, name: 'Conduits' },
      copperCablings: { count: 0, name: 'Copper Cablings' },
      fiberOpticCablings: { count: 0, name: 'Fiber Optic Cablings' }
    };
    
    let total = 0;
    let floorsProcessed = 0;
    let reportsWithFloors = 0;
    
    // Count components by type
    reports.forEach((report, index) => {
      if (!report.floors) {
        console.log(`BI DASHBOARD: Report ${index} (${report.id}) has no floors property`);
        return;
      }
      
      if (!Array.isArray(report.floors)) {
        console.log(`BI DASHBOARD: Report ${index} (${report.id}) floors is not an array: ${typeof report.floors}`);
        return;
      }
      
      reportsWithFloors++;
      floorsProcessed += report.floors.length;
      
      // Log first report's floor structure
      if (index === 0 && report.floors.length > 0) {
        const sampleFloor = report.floors[0];
        console.log('BI DASHBOARD: Sample floor structure:', {
          name: sampleFloor.name,
          hasNetworkCabinets: !!sampleFloor.networkCabinets,
          networkCabinetsIsArray: Array.isArray(sampleFloor.networkCabinets),
          networkCabinetsLength: Array.isArray(sampleFloor.networkCabinets) ? sampleFloor.networkCabinets.length : 'N/A',
          // Add other component types if needed
        });
      }
      
      report.floors.forEach(floor => {
        if (!floor) {
          console.log(`BI DASHBOARD: Null floor in report ${report.id}`);
          return;
        }
        
        Object.keys(componentTypes).forEach(type => {
          if (floor[type] && Array.isArray(floor[type])) {
            componentTypes[type].count += floor[type].length;
            total += floor[type].length;
          }
        });
      });
    });
    
    console.log(`BI DASHBOARD: Component processing stats: ${reportsWithFloors} reports with floors, ${floorsProcessed} floors processed, ${total} total components`);
    
    return {
      types: componentTypes,
      total,
      byReport: reports.length > 0 ? parseFloat((total / reports.length).toFixed(2)) : 0
    };
  } catch (error) {
    console.error('BI DASHBOARD: Error in processComponentData:', error);
    // Return empty result to prevent dashboard from breaking
    return {
      types: {},
      total: 0,
      byReport: 0
    };
  }
}  
  /**
   * Process technician performance data
   * @param {Array} reports - Reports data
   * @returns {Object} - Technician performance data
   */
  function processTechnicianData(reports) {
    const result = {};
    
    // Group reports by technician
    const reportsByTechnician = {};
    
    reports.forEach(report => {
      if (!report.technicianName) return;
      
      if (!reportsByTechnician[report.technicianName]) {
        reportsByTechnician[report.technicianName] = [];
      }
      
      reportsByTechnician[report.technicianName].push(report);
    });
    
    // Calculate performance metrics for each technician
    Object.entries(reportsByTechnician).forEach(([techName, techReports]) => {
      const submittedReports = techReports.filter(r => r.submittedAt);
      
      // Calculate average completion time
      let avgCompletionDays = 0;
      
      if (submittedReports.length > 0) {
        const totalDays = submittedReports.reduce((sum, r) => {
          const days = (r.submittedAt - r.createdAt) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0);
        
        avgCompletionDays = parseFloat((totalDays / submittedReports.length).toFixed(1));
      }
      
      // Count components
      let componentCount = 0;
      
      techReports.forEach(report => {
        if (!report.floors) return;
        
        report.floors.forEach(floor => {
          const componentTypes = [
            'networkCabinets', 'perforations', 'accessTraps', 'cablePaths',
            'cableTrunkings', 'conduits', 'copperCablings', 'fiberOpticCablings'
          ];
          
          componentTypes.forEach(type => {
            if (floor[type] && Array.isArray(floor[type])) {
              componentCount += floor[type].length;
            }
          });
        });
      });
      
      // Calculate status counts
      const statusCounts = {
        draft: techReports.filter(r => r.status === 'draft').length,
        submitted: techReports.filter(r => r.status === 'submitted').length,
        reviewed: techReports.filter(r => r.status === 'reviewed').length,
        approved: techReports.filter(r => r.status === 'approved').length
      };
      
      // Store technician data
      result[techName] = {
        totalReports: techReports.length,
        statusCounts,
        avgCompletionDays,
        componentsDocumented: componentCount,
        avgComponentsPerReport: techReports.length > 0 ? 
          parseFloat((componentCount / techReports.length).toFixed(1)) : 0,
        mostRecentReport: techReports.reduce((latest, r) => 
          !latest || r.createdAt > latest.createdAt ? r : latest, null)
      };
    });
    
    return result;
  }
  
  /**
   * Calculate average completion time
   * @param {Array} reports - Reports data
   * @returns {number} - Average completion time in days
   */
  function calculateAvgCompletionTime(reports) {
    const completedReports = reports.filter(r => r.submittedAt);
    
    if (completedReports.length === 0) return 0;
    
    const totalDays = completedReports.reduce((sum, report) => {
      const days = (report.submittedAt - report.createdAt) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    return parseFloat((totalDays / completedReports.length).toFixed(1));
  }
  
  /**
   * Find most active client
   * @param {Array} reports - Reports data
   * @returns {string} - Most active client name
   */
  function findMostActiveClient(reports) {
    const clientCounts = {};
    
    reports.forEach(report => {
      if (!report.clientName) return;
      
      clientCounts[report.clientName] = (clientCounts[report.clientName] || 0) + 1;
    });
    
    let mostActiveClient = '';
    let maxCount = 0;
    
    Object.entries(clientCounts).forEach(([client, count]) => {
      if (count > maxCount) {
        mostActiveClient = client;
        maxCount = count;
      }
    });
    
    return mostActiveClient;
  }
  
  /**
   * Find most active technician
   * @param {Array} reports - Reports data
   * @returns {string} - Most active technician name
   */
  function findMostActiveTechnician(reports) {
    const techCounts = {};
    
    reports.forEach(report => {
      if (!report.technicianName) return;
      
      techCounts[report.technicianName] = (techCounts[report.technicianName] || 0) + 1;
    });
    
    let mostActiveTech = '';
    let maxCount = 0;
    
    Object.entries(techCounts).forEach(([tech, count]) => {
      if (count > maxCount) {
        mostActiveTech = tech;
        maxCount = count;
      }
    });
    
    return mostActiveTech;
  }
  
  /**
   * Generate time series data
   * @param {Array} reports - Reports data
   * @returns {Object} - Time series data
   */
  function generateTimeSeriesData(reports) {
    // Group by month (default)
    return {
      monthly: generateMonthlyData(reports),
      weekly: generateWeeklyData(reports)
    };
  }
  
/**
   * Generate monthly data
   * @param {Array} reports - Reports data
   * @returns {Object} - Monthly data
   */
  function generateMonthlyData(reports) {
    const today = new Date();
    const months = 6; // Show last 6 months
    
    // Generate month labels and initialize counts
    const labels = [];
    const createdCounts = {};
    const submittedCounts = {};
    
    for (let i = 0; i < months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      labels.unshift(monthLabel);
      createdCounts[monthKey] = 0;
      submittedCounts[monthKey] = 0;
    }
    
    // Count reports by month
    reports.forEach(report => {
      const createdDate = report.createdAt;
      const createdKey = `${createdDate.getFullYear()}-${createdDate.getMonth() + 1}`;
      
      if (createdCounts.hasOwnProperty(createdKey)) {
        createdCounts[createdKey]++;
      }
      
      if (report.submittedAt) {
        const submittedDate = report.submittedAt;
        const submittedKey = `${submittedDate.getFullYear()}-${submittedDate.getMonth() + 1}`;
        
        if (submittedCounts.hasOwnProperty(submittedKey)) {
          submittedCounts[submittedKey]++;
        }
      }
    });
    
    // Convert to arrays
    const created = [];
    const submitted = [];
    
    for (let i = 0; i < months; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - months + i + 1, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      created.push(createdCounts[monthKey] || 0);
      submitted.push(submittedCounts[monthKey] || 0);
    }
    
    return { labels, created, submitted };
  }
  
  /**
   * Generate weekly data
   * @param {Array} reports - Reports data
   * @returns {Object} - Weekly data
   */
  function generateWeeklyData(reports) {
    const today = new Date();
    const weeks = 12; // Show last 12 weeks
    
    // Get week number helper
    const getWeekNumber = (date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };
    
    // Generate week labels and initialize counts
    const labels = [];
    const createdCounts = {};
    const submittedCounts = {};
    
    for (let i = 0; i < weeks; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      
      const weekNum = getWeekNumber(date);
      const weekLabel = `W${weekNum}`;
      const weekKey = `${date.getFullYear()}-W${weekNum}`;
      
      labels.unshift(weekLabel);
      createdCounts[weekKey] = 0;
      submittedCounts[weekKey] = 0;
    }
    
    // Count reports by week
    reports.forEach(report => {
      const createdDate = report.createdAt;
      const createdWeek = getWeekNumber(createdDate);
      const createdKey = `${createdDate.getFullYear()}-W${createdWeek}`;
      
      if (createdCounts.hasOwnProperty(createdKey)) {
        createdCounts[createdKey]++;
      }
      
      if (report.submittedAt) {
        const submittedDate = report.submittedAt;
        const submittedWeek = getWeekNumber(submittedDate);
        const submittedKey = `${submittedDate.getFullYear()}-W${submittedWeek}`;
        
        if (submittedCounts.hasOwnProperty(submittedKey)) {
          submittedCounts[submittedKey]++;
        }
      }
    });
    
    // Convert to arrays
    const created = [];
    const submitted = [];
    
    for (let i = 0; i < weeks; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - ((weeks - i - 1) * 7));
      
      const weekNum = getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${weekNum}`;
      
      created.push(createdCounts[weekKey] || 0);
      submitted.push(submittedCounts[weekKey] || 0);
    }
    
    return { labels, created, submitted };
  }
  
  /**
   * Update dashboard with current data
   */
function updateDashboard() {
  console.log('BI DASHBOARD: updateDashboard started');
  
  const { reports, analytics } = dashboardData;
  
  if (!analytics) {
    console.error('BI DASHBOARD: analytics is null or undefined');
    showError('Analytics data is missing');
    return;
  }
  
  try {
    // Render KPI cards
    console.log('BI DASHBOARD: Rendering KPI cards');
    renderKPISummaryCards('kpiCardsContainer', analytics.kpis);
    
    // Render charts
    console.log('BI DASHBOARD: Rendering status chart');
    renderStatusChart();
    
    console.log('BI DASHBOARD: Rendering trends chart');
    renderTrendsChart();
    
    console.log('BI DASHBOARD: Rendering component chart');
    renderComponentChart();
    
    console.log('BI DASHBOARD: Rendering technician chart');
    renderTechnicianChart();
    
    // Render component statistics
    console.log('BI DASHBOARD: Rendering component stats');
    renderComponentStats();
    
    // Render tables
    console.log('BI DASHBOARD: Rendering technician table');
    renderTechnicianTable();
    
    console.log('BI DASHBOARD: Rendering reports table');
    renderReportsTable();
    
    console.log('BI DASHBOARD: updateDashboard completed');
  } catch (error) {
    console.error('BI DASHBOARD: Error in updateDashboard:', error);
    showError(`Dashboard update failed: ${error.message}`);
  }
}
  /**
   * Render status distribution chart
   */
  function renderStatusChart() {
    const { reportsByStatus } = dashboardData.analytics;
    
    // Chart configuration
    const config = {
      type: 'doughnut',
      data: {
        labels: ['Draft', 'Submitted', 'Reviewed', 'Approved'],
        datasets: [{
          data: [
            reportsByStatus.draft || 0,
            reportsByStatus.submitted || 0,
            reportsByStatus.reviewed || 0,
            reportsByStatus.approved || 0
          ],
          backgroundColor: [
            'rgba(108, 117, 125, 0.8)', // Draft
            'rgba(13, 110, 253, 0.8)',  // Submitted
            'rgba(13, 202, 240, 0.8)',  // Reviewed
            'rgba(25, 135, 84, 0.8)'    // Approved
          ],
          borderColor: [
            'rgba(108, 117, 125, 1)',
            'rgba(13, 110, 253, 1)',
            'rgba(13, 202, 240, 1)',
            'rgba(25, 135, 84, 1)'
          ],
          borderWidth: 1,
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true
        }
      }
    };
    
    // Get chart context
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    // Create or update chart
    if (statusChart) {
      statusChart.data = config.data;
      statusChart.options = config.options;
      statusChart.update();
    } else {
      statusChart = new Chart(ctx, config);
    }
    
    // Hide loader
    document.querySelector('#statusChart').closest('.position-relative').querySelector('.chart-loader').style.display = 'none';
  }
  
  /**
   * Render trends chart
   */
  function renderTrendsChart() {
    const { timeSeries } = dashboardData.analytics;
    const data = trendsChartView === 'month' ? timeSeries.monthly : timeSeries.weekly;
    
    // Chart configuration
    const config = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Created Reports',
            data: data.created,
            backgroundColor: 'rgba(13, 110, 253, 0.2)',
            borderColor: 'rgba(13, 110, 253, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: 'rgba(13, 110, 253, 1)',
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Submitted Reports',
            data: data.submitted,
            backgroundColor: 'rgba(25, 135, 84, 0.2)',
            borderColor: 'rgba(25, 135, 84, 1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: 'rgba(25, 135, 84, 1)',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    };
    
    // Get chart context
    const ctx = document.getElementById('trendsChart').getContext('2d');
    
    // Create or update chart
    if (trendsChart) {
      trendsChart.data = config.data;
      trendsChart.options = config.options;
      trendsChart.update();
    } else {
      trendsChart = new Chart(ctx, config);
    }
    
    // Hide loader
    document.querySelector('#trendsChart').closest('.position-relative').querySelector('.chart-loader').style.display = 'none';
    
    // Update button text
    document.getElementById('switchTrendsView').textContent = trendsChartView === 'month' ? 'Show Weekly' : 'Show Monthly';
  }
  
  /**
   * Toggle trends chart view between monthly and weekly
   */
  function toggleTrendsView() {
    trendsChartView = trendsChartView === 'month' ? 'week' : 'month';
    renderTrendsChart();
  }
  
  /**
   * Render component distribution chart
   */
  function renderComponentChart() {
    const { componentStats } = dashboardData.analytics;
    
    // Format data for chart
    const componentData = [];
    
    Object.entries(componentStats.types).forEach(([type, data]) => {
      if (data.count > 0) {
        componentData.push({
          name: data.name,
          value: data.count
        });
      }
    });
    
    // Sort by count (descending)
    componentData.sort((a, b) => b.value - a.value);
    
    // Chart configuration
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}'
        }
      },
      yAxis: {
        type: 'category',
        data: componentData.map(item => item.name),
        axisLabel: {
          fontSize: 12
        }
      },
      series: [
        {
          name: 'Components',
          type: 'bar',
          data: componentData.map(item => ({
            value: item.value,
            itemStyle: {
              color: getComponentColor(item.name),
              borderRadius: [0, 4, 4, 0]
            }
          })),
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            fontSize: 12,
            fontWeight: 'bold'
          },
          barWidth: '60%'
        }
      ]
    };
    
    // Initialize chart if needed
    if (!componentChart) {
      componentChart = echarts.init(document.getElementById('componentChart'));
      
      // Handle resize
      window.addEventListener('resize', () => {
        componentChart.resize();
      });
    }
    
    // Set chart options
    componentChart.setOption(option);
    
    // Hide loader
    document.querySelector('#componentChart').closest('.position-relative').querySelector('.chart-loader').style.display = 'none';
  }
  
  /**
   * Get color for component type
   * @param {string} componentName - Component name
   * @returns {string} - Color
   */
  function getComponentColor(componentName) {
    const colorMap = {
      'Network Cabinets': '#0d6efd',     // primary
      'Perforations': '#6f42c1',         // purple
      'Access Traps': '#fd7e14',         // orange
      'Cable Paths': '#20c997',          // teal
      'Cable Trunkings': '#0dcaf0',      // cyan
      'Conduits': '#6c757d',             // secondary
      'Copper Cablings': '#dc3545',      // danger
      'Fiber Optic Cablings': '#198754', // success
    };
    
    return colorMap[componentName] || '#6c757d';
  }
  
  /**
   * Render component statistics
   */
  function renderComponentStats() {
    const { componentStats } = dashboardData.analytics;
    
    // Create HTML
    let html = `
      <div class="p-3">
        <div class="d-flex justify-content-between mb-3">
          <h6 class="fw-bold mb-0">Component Type</h6>
          <h6 class="fw-bold mb-0">Count</h6>
        </div>
    `;
    
    // Sort components by count
    const sortedComponents = Object.entries(componentStats.types)
      .sort((a, b) => b[1].count - a[1].count)
      .filter(([_, data]) => data.count > 0);
    
    // Add each component
    sortedComponents.forEach(([type, data]) => {
      const percentage = componentStats.total > 0 ? 
        Math.round((data.count / componentStats.total) * 100) : 0;
      
      html += `
        <div class="mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <div class="me-2" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${getComponentColor(data.name)};"></div>
              <span>${data.name}</span>
            </div>
            <span class="badge bg-light text-dark">${data.count}</span>
          </div>
          <div class="progress mt-1" style="height: 4px;">
            <div class="progress-bar" style="width: ${percentage}%; background-color: ${getComponentColor(data.name)};"></div>
          </div>
          <div class="text-end">
            <small class="text-muted">${percentage}%</small>
          </div>
        </div>
      `;
    });
    
    // Add total
    html += `
        <div class="mt-3 pt-3 border-top">
          <div class="d-flex justify-content-between">
            <span class="fw-bold">Total Components</span>
            <span class="fw-bold">${componentStats.total}</span>
          </div>
          <div class="d-flex justify-content-between mt-2">
            <span class="text-muted">Avg. per Report</span>
            <span class="text-muted">${componentStats.byReport}</span>
          </div>
        </div>
      </div>
    `;
    
    // Update container
    document.getElementById('componentStats').innerHTML = html;
  }
  
  /**
   * Render technician performance chart
   */
  function renderTechnicianChart() {
    const { technicianPerformance } = dashboardData.analytics;
    
    // Sort technicians by total reports
    const topTechnicians = Object.entries(technicianPerformance)
      .sort((a, b) => b[1].totalReports - a[1].totalReports)
      .slice(0, 5);
    
    // Prepare chart data
    const labels = topTechnicians.map(([name]) => name);
    
    // Chart configuration
    const config = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Submitted',
            data: topTechnicians.map(([_, data]) => data.statusCounts.submitted || 0),
            backgroundColor: 'rgba(13, 110, 253, 0.7)',
            borderColor: 'rgba(13, 110, 253, 1)',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Reviewed',
            data: topTechnicians.map(([_, data]) => data.statusCounts.reviewed || 0),
            backgroundColor: 'rgba(13, 202, 240, 0.7)',
            borderColor: 'rgba(13, 202, 240, 1)',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Approved',
            data: topTechnicians.map(([_, data]) => data.statusCounts.approved || 0),
            backgroundColor: 'rgba(25, 135, 84, 0.7)', 
            borderColor: 'rgba(25, 135, 84, 1)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            stacked: false
          },
          y: {
            stacked: false,
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    };
    
    // Get chart context
    const ctx = document.getElementById('technicianChart').getContext('2d');
    
    // Create or update chart
    if (technicianChart) {
      technicianChart.data = config.data;
      technicianChart.options = config.options;
      technicianChart.update();
    } else {
      technicianChart = new Chart(ctx, config);
    }
    
    // Hide loader
    document.querySelector('#technicianChart').closest('.position-relative').querySelector('.chart-loader').style.display = 'none';
  }
  
  /**
   * Render technician performance table
   */
  function renderTechnicianTable() {
    const { technicianPerformance } = dashboardData.analytics;
    
    // Convert object to array
    const technicianArray = Object.entries(technicianPerformance).map(([name, data]) => ({
      name,
      ...data
    }));
    
    // Sort by total reports
    technicianArray.sort((a, b) => b.totalReports - a.totalReports);
    
    // Create table HTML
    let tableHtml = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Technician</th>
              <th class="text-center">Reports</th>
              <th class="text-center">Submitted</th>
              <th class="text-center">Reviewed</th>
              <th class="text-center">Approved</th>
              <th class="text-center">Avg. Days</th>
              <th class="text-center">Components</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add rows for top 5 technicians
    technicianArray.slice(0, 5).forEach(tech => {
      const initials = tech.name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
      
      tableHtml += `
        <tr>
          <td>
            <div class="d-flex align-items-center">
              <div class="avatar avatar-sm bg-primary-lighter text-primary me-2" style="width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 500;">${initials}</div>
              <span>${tech.name}</span>
            </div>
          </td>
          <td class="text-center">${tech.totalReports}</td>
          <td class="text-center"><span class="text-primary">${tech.statusCounts.submitted || 0}</span></td>
          <td class="text-center"><span class="text-info">${tech.statusCounts.reviewed || 0}</span></td>
          <td class="text-center"><span class="text-success">${tech.statusCounts.approved || 0}</span></td>
          <td class="text-center">${tech.avgCompletionDays || 'N/A'}</td>
          <td class="text-center">${tech.componentsDocumented}</td>
        </tr>
      `;
    });
    
    // Close table
    tableHtml += `
          </tbody>
        </table>
      </div>
    `;
    
    // Update container
    document.getElementById('technicianTableContainer').innerHTML = tableHtml;
  }
  
  /**
   * Render reports table
   */
  function renderReportsTable() {
    const { reports } = dashboardData;
    
    // Sort by created date (most recent first)
    const sortedReports = [...reports].sort((a, b) => b.createdAt - a.createdAt);
    
    // Take top 10 reports
    const recentReports = sortedReports.slice(0, 10);
    
    // Create table HTML
    let tableHtml = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Client</th>
              <th>Technician</th>
              <th class="text-center">Status</th>
              <th>Created</th>
              <th>Submitted</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Add rows
    recentReports.forEach(report => {
      // Format dates
      const createdDate = report.createdAt.toLocaleDateString();
      const submittedDate = report.submittedAt ? report.submittedAt.toLocaleDateString() : '-';
      
      // Status badge class
      let statusClass = 'secondary';
      if (report.status === 'submitted') statusClass = 'primary';
      if (report.status === 'reviewed') statusClass = 'info';
      if (report.status === 'approved') statusClass = 'success';
      
      // Status label
      const statusLabel = report.status ? 
        report.status.charAt(0).toUpperCase() + report.status.slice(1) : 'Unknown';
      
      tableHtml += `
        <tr>
          <td>
            <div class="fw-medium">${report.clientName || 'Unknown'}</div>
            <div class="text-muted small">${report.location || 'N/A'}</div>
          </td>
          <td>${report.technicianName || 'N/A'}</td>
          <td class="text-center">
            <span class="badge bg-${statusClass}">${statusLabel}</span>
          </td>
          <td>${createdDate}</td>
          <td>${submittedDate}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary view-report-btn" data-id="${report.id}" title="View Report">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary download-report-btn" data-id="${report.id}" title="Download PDF">
              <i class="bi bi-download"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    // Close table
    tableHtml += `
          </tbody>
        </table>
      </div>
    `;
    
    // Update container
    document.getElementById('recentReportsContainer').innerHTML = tableHtml;
    
    // Add event listeners for buttons
    document.querySelectorAll('.view-report-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        viewReport(btn.getAttribute('data-id'));
      });
    });
    
    document.querySelectorAll('.download-report-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        downloadReport(btn.getAttribute('data-id'));
      });
    });
  }
  
  /**
   * View report (navigate to report module)
   * @param {string} reportId - Report ID
   */
  function viewReport(reportId) {
    // Store report ID in session storage for reports module
    sessionStorage.setItem('viewReportId', reportId);
    
    // Navigate to reports module
    const event = new CustomEvent('moduleChange', { detail: { module: 'reports' } });
    document.dispatchEvent(event);
  }
  
  /**
   * Download report PDF
   * @param {string} reportId - Report ID
   */
  function downloadReport(reportId) {
    // Show notification
    showNotification('Download Started', 'Preparing report PDF for download...', 'info');
    
    // Store report ID in session storage for reports module
    sessionStorage.setItem('downloadReportId', reportId);
    
    // Navigate to reports module or trigger download event
    const event = new CustomEvent('downloadReport', { detail: { reportId, format: 'pdf' } });
    document.dispatchEvent(event);
  }
  
  /**
   * Export dashboard data to Excel
   */
  async function exportToExcel() {
    try {
      // Show notification
      showNotification('Export Started', 'Preparing Excel export...', 'info');
      
      const { reports } = dashboardData;
      
      if (!reports || reports.length === 0) {
        throw new Error('No data to export');
      }
      
      // Generate Excel file
      const excelBlob = await generateExcelReport(reports, dashboardData.analytics);
      
      // Create download link
      const url = URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BI-Dashboard-${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      // Show success notification
      showNotification('Export Complete', 'Dashboard data has been exported to Excel', 'success');
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification('Export Failed', `Error generating Excel: ${error.message}`, 'danger');
    }
  }
  
  /**
   * Export dashboard to PDF
   */
  async function exportToPdf() {
    try {
      // Show notification
      showNotification('Export Started', 'Preparing PDF export...', 'info');
      
      // Get dashboard element
      const dashboardElement = document.querySelector('.dashboard-container');
      
      // Generate PDF
      const pdfDoc = await generatePdfReport(dashboardElement, 'BI Dashboard Report');
      
      // Save and download PDF
      const pdfBlob = pdfDoc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `BI-Dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      // Show success notification
      showNotification('Export Complete', 'Dashboard has been exported to PDF', 'success');
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showNotification('Export Failed', `Error generating PDF: ${error.message}`, 'danger');
    }
  }
  
  /**
   * Download chart as image
   * @param {string} chartId - Chart element ID
   * @param {string} filename - Download filename
   * @param {boolean} isEChart - Whether chart is an EChart
   */
  function downloadChartAsImage(chartId, filename, isEChart = false) {
    try {
      let dataUrl;
      
      if (isEChart) {
        // ECharts
        dataUrl = componentChart.getDataURL({
          type: 'png',
          pixelRatio: 2
        });
      } else {
        // Chart.js
        const canvas = document.getElementById(chartId);
        dataUrl = canvas.toDataURL('image/png');
      }
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show notification
      showNotification('Chart Downloaded', `The chart has been downloaded as an image`, 'success');
      
    } catch (error) {
      console.error('Error downloading chart:', error);
      showNotification('Download Failed', `Error: ${error.message}`, 'danger');
    }
  }
  
  /**
   * Refresh specific chart
   * @param {string} chartType - Chart type to refresh
   */
  function refreshChart(chartType) {
    // Show loader
    let chartElement;
    
    switch (chartType) {
      case 'status':
        chartElement = document.getElementById('statusChart');
        break;
      case 'trends':
        chartElement = document.getElementById('trendsChart');
        break;
      case 'component':
        chartElement = document.getElementById('componentChart');
        break;
      case 'technician':
        chartElement = document.getElementById('technicianChart');
        break;
      default:
        return;
    }
    
    const loader = chartElement.closest('.position-relative').querySelector('.chart-loader');
    if (loader) {
      loader.style.display = 'flex';
    }
    
    // Refresh chart data
    setTimeout(() => {
      switch (chartType) {
        case 'status':
          renderStatusChart();
          break;
        case 'trends':
          renderTrendsChart();
          break;
        case 'component':
          renderComponentChart();
          break;
        case 'technician':
          renderTechnicianChart();
          break;
      }
      
      // Show notification
      showNotification('Chart Updated', `The ${chartType} chart has been refreshed`, 'success');
    }, 500);
  }
  
  /**
   * Handle filter changes
   * @param {Object} filters - New filter values
   */
  function handleFilterChange(filters) {
    console.log('Filters changed:', filters);
    
    // Create filters object for Firebase query
    const queryFilters = {};
    
    if (filters.status) {
      queryFilters.status = filters.status;
    }
    
    if (filters.startDate && filters.endDate) {
      queryFilters.startDate = filters.startDate;
      queryFilters.endDate = filters.endDate;
    }
    
    if (filters.technician) {
      queryFilters.technician = filters.technician;
    }
    
    if (filters.client) {
      queryFilters.client = filters.client;
    }
    
    // Save selected time interval for trends chart
    if (filters.timeGrouping) {
      trendsChartView = filters.timeGrouping;
    }
    
    // Load filtered data
    loadDashboardData(false, queryFilters);
  }
  
  /**
   * Show loading state for dashboard
   */
  function showLoading() {
    // Show chart loaders
    document.querySelectorAll('.chart-loader').forEach(loader => {
      loader.style.display = 'flex';
    });
    
    // Show table loaders (replace tables with skeletons)
    document.getElementById('technicianTableContainer').innerHTML = `
      <div class="dashboard-skeleton p-3">
        <div class="skeleton-header"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
      </div>
    `;
    
    document.getElementById('recentReportsContainer').innerHTML = `
      <div class="dashboard-skeleton p-3">
        <div class="skeleton-header"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
      </div>
    `;
    
    // Show component stats loader
    document.getElementById('componentStats').innerHTML = `
      <div class="dashboard-skeleton p-3">
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
        <div class="skeleton-row"></div>
      </div>
    `;
    
    // Show KPI card skeletons
    document.getElementById('kpiCardsContainer').innerHTML = `
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="dashboard-skeleton">
          <div class="skeleton-item"></div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="dashboard-skeleton">
          <div class="skeleton-item"></div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="dashboard-skeleton">
          <div class="skeleton-item"></div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="dashboard-skeleton">
          <div class="skeleton-item"></div>
        </div>
      </div>
    `;
    
    // Disable buttons
    document.getElementById('refreshDashboardBtn').disabled = true;
    document.getElementById('exportDashboardBtn').disabled = true;
    document.getElementById('applyDateFilterBtn').disabled = true;
  }
  
  /**
   * Hide loading state
   */
  function hideLoading() {
    // Hide chart loaders (individual chart renders will handle this)
    
    // Enable buttons
    document.getElementById('refreshDashboardBtn').disabled = false;
    document.getElementById('exportDashboardBtn').disabled = false;
    document.getElementById('applyDateFilterBtn').disabled = false;
  }
  
  /**
   * Show error state
   * @param {string} message - Error message
   */
  function showError(message) {
    // Show notification
    showNotification('Error', `Failed to load dashboard data: ${message}`, 'danger');
    
    // Replace KPI cards with error message
    document.getElementById('kpiCardsContainer').innerHTML = `
      <div class="col-12 mb-4">
        <div class="card shadow-sm bg-danger bg-opacity-10">
          <div class="card-body p-4">
            <div class="d-flex align-items-center">
              <div class="me-3">
                <i class="bi bi-exclamation-triangle-fill text-danger fs-1"></i>
              </div>
              <div>
                <h5 class="text-danger">Dashboard Data Error</h5>
                <p class="mb-3">${message}</p>
                <button class="btn btn-danger" id="retryDashboardBtn">
                  <i class="bi bi-arrow-clockwise me-2"></i>Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add retry button event listener
    document.getElementById('retryDashboardBtn').addEventListener('click', () => {
      loadDashboardData(true);
    });
  }
  
  /**
   * Show notification toast
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, danger, warning, info)
   */
  function showNotification(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create unique ID for toast
    const toastId = `toast-${Date.now()}`;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.id = toastId;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Set icon based on type
    let icon = 'bi-info-circle';
    if (type === 'success') icon = 'bi-check-circle';
    if (type === 'danger') icon = 'bi-exclamation-triangle';
    if (type === 'warning') icon = 'bi-exclamation-circle';
    
    // Create toast content
    toast.innerHTML = `
      <div class="toast-header bg-${type} text-white">
        <i class="bi ${icon} me-2"></i>
        <strong class="me-auto">${title}</strong>
        <small>Just now</small>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    `;
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Initialize Bootstrap toast
    const bsToast = new bootstrap.Toast(toast, {
      autohide: true,
      delay: 5000
    });
    
    // Auto-remove toast element after hiding
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
    
    // Show toast
    bsToast.show();
  }
}