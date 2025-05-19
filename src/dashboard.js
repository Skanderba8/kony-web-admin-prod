// src/dashboard.js - Revamped version
import { createFilterPanel } from './bi/components/filters.js';
import { renderKPICards } from './bi/components/kpis.js';
import { renderStatusPieChart, renderTimeSeriesChart, renderComponentDistributionChart, renderTechnicianPerformanceChart } from './bi/components/charts.js';
import { createTechnicianTable, createReportSummaryTable } from './bi/components/data-tables.js';
import { db } from './firebase/config.js';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { countBy, groupBy, meanBy } from 'lodash';
import { generateExcelReport, generatePdfReport } from './bi/services/report-generator.js';

/**
 * Initializes the Business Intelligence dashboard
 * @param {HTMLElement} container - The container element to render the dashboard
 */
export function initializeBIDashboard(container = document.getElementById('contentContainer')) {
  console.log('Initializing enhanced BI Dashboard');
  
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
        
        <!-- Time Period Card -->
        <div class="card shadow-sm">
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
      
      <!-- Dashboard Content -->
      <div class="col-lg-9">
        <!-- Dashboard Stats Summary - NEW -->
        <div class="card shadow-sm mb-4">
          <div class="card-body p-0">
            <div class="row g-0">
              <div class="col-md-3 p-3 border-end">
                <div class="d-flex align-items-center">
                  <div class="stats-icon bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                    <i class="bi bi-file-earmark-text text-primary fs-4"></i>
                  </div>
                  <div>
                    <h6 class="stats-label">Total Reports</h6>
                    <h2 class="stats-value" id="totalReportsValue">
                      <div class="placeholder-glow">
                        <span class="placeholder col-8"></span>
                      </div>
                    </h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3 p-3 border-end">
                <div class="d-flex align-items-center">
                  <div class="stats-icon bg-success bg-opacity-10 rounded-circle p-3 me-3">
                    <i class="bi bi-check-circle text-success fs-4"></i>
                  </div>
                  <div>
                    <h6 class="stats-label">Completed</h6>
                    <h2 class="stats-value" id="completedReportsValue">
                      <div class="placeholder-glow">
                        <span class="placeholder col-8"></span>
                      </div>
                    </h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3 p-3 border-end">
                <div class="d-flex align-items-center">
                  <div class="stats-icon bg-info bg-opacity-10 rounded-circle p-3 me-3">
                    <i class="bi bi-people text-info fs-4"></i>
                  </div>
                  <div>
                    <h6 class="stats-label">Technicians</h6>
                    <h2 class="stats-value" id="technicianCountValue">
                      <div class="placeholder-glow">
                        <span class="placeholder col-8"></span>
                      </div>
                    </h2>
                  </div>
                </div>
              </div>
              <div class="col-md-3 p-3">
                <div class="d-flex align-items-center">
                  <div class="stats-icon bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                    <i class="bi bi-clock-history text-warning fs-4"></i>
                  </div>
                  <div>
                    <h6 class="stats-label">Avg. Completion</h6>
                    <h2 class="stats-value" id="avgCompletionValue">
                      <div class="placeholder-glow">
                        <span class="placeholder col-8"></span>
                      </div>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      
        <!-- KPI Cards -->
        <div id="kpiContainer" class="mb-4"></div>
        
        <!-- Charts Row -->
        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <div class="card shadow-sm h-100">
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
            <div class="card shadow-sm h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Report Trends (Last 6 Months)</h5>
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
        <div class="card shadow-sm mb-4">
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
        
        <!-- Technician Performance - NEW CHART -->
        <div class="card shadow-sm mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Technician Performance Comparison</h5>
            <div class="card-actions">
              <button class="btn btn-sm btn-icon btn-light" id="techPerfChartOptions" data-bs-toggle="dropdown">
                <i class="bi bi-three-dots-vertical"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#" id="refreshTechPerfChart">Refresh</a></li>
                <li><a class="dropdown-item" href="#" id="downloadTechPerfChartImage">Download as Image</a></li>
              </ul>
            </div>
          </div>
          <div class="card-body">
            <div class="chart-container" style="position: relative; height: 350px;">
              <canvas id="techPerfChart"></canvas>
              <div class="chart-loader">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Technician Performance Details -->
        <div class="card shadow-sm mb-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">Technician Performance Details</h5>
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
        <div class="card shadow-sm mb-4">
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
  
  // View all buttons
  document.getElementById('viewAllTechnicians').addEventListener('click', () => {
    showNotification('Feature Coming Soon', 'Full technician performance dashboard will be available in the next update!', 'info');
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
   * Load dashboard data directly from Firebase
   * @param {boolean} forceRefresh - Whether to force a data refresh
   * @param {Object} filters - Optional filters to apply
   */
  async function loadDashboardData(forceRefresh = false, filters = {}) {
    try {
      // Show loading states
      showLoadingState();
      
      // Fetch reports from Firestore
      const reportsRef = collection(db, 'technical_visit_reports');
      let reportQuery = query(reportsRef, orderBy('createdAt', 'desc'));
      
      // Apply filters if provided
      if (filters.status) {
        reportQuery = query(reportQuery, where('status', '==', filters.status));
      }
      
      if (filters.startDate && filters.endDate) {
        const startTimestamp = Timestamp.fromDate(filters.startDate);
        const endTimestamp = Timestamp.fromDate(filters.endDate);
        reportQuery = query(
          reportQuery, 
          where('createdAt', '>=', startTimestamp),
          where('createdAt', '<=', endTimestamp)
        );
      }
      
      // Fetch users from Firestore
      const usersRef = collection(db, 'users');
      
      // Execute both queries
      const [reportsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(reportQuery),
        getDocs(usersRef)
      ]);
      
      // Process reports data
      const reports = reportsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          submittedAt: data.submittedAt?.toDate(),
          lastModified: data.lastModified?.toDate()
        };
      });
      
      // Process users data
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculate all analytics
      const analytics = processAnalyticsData(reports, users);
      
      // Update top stats summary (NEW)
      updateTopStatsSummary(analytics);
      
      // Render KPI cards
      renderKPICards('kpiContainer', analytics.kpis);
      
      // Render charts
      const statusChart = renderStatusPieChart('reportStatusChart', analytics.reportsByStatus);
      const trendsChart = renderTimeSeriesChart('trendsChart', analytics.timeSeries);
      const componentChart = renderComponentDistributionChart('componentDistributionChart', analytics.componentStats);
      
      // Render technician performance chart (NEW)
      const techPerfChart = renderTechnicianPerformanceChart('techPerfChart', analytics.technicianPerformance);
      
      // Add chart download handlers
      setupChartDownloads('statusChart', statusChart);
      setupChartDownloads('trendsChart', trendsChart);
      setupChartDownloads('componentChart', componentChart);
      setupChartDownloads('techPerfChart', techPerfChart);
      
      // Create technician performance table
      createTechnicianTable('technicianTableContainer', analytics.technicianPerformance);
      
      // Create recent reports table (limit to 10 most recent)
      createReportSummaryTable('recentReportsContainer', reports.slice(0, 10));
      
      // Update filter options with available clients and technicians
      const clients = [...new Set(reports.map(report => report.clientName).filter(Boolean))];
      const technicians = [...new Set(reports.map(report => report.technicianName).filter(Boolean))];
      filterPanel.updateOptions(clients, technicians);
      
      // Hide loaders
      hideLoadingState();
      
      // Save analytics data for export functions
      window.currentAnalytics = analytics;
      window.currentReports = reports;
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Show error state
      showErrorState(error.message);
    }
  }
  
  /**
   * Update the top stats summary
   * @param {Object} analytics - The analytics data
   */
  function updateTopStatsSummary(analytics) {
    document.getElementById('totalReportsValue').textContent = analytics.kpis.totalReports;
    document.getElementById('completedReportsValue').textContent = analytics.kpis.totalApproved;
    document.getElementById('technicianCountValue').textContent = analytics.kpis.totalTechnicians;
    document.getElementById('avgCompletionValue').textContent = `${analytics.kpis.avgCompletionTime} days`;
  }
  
  /**
   * Process all analytics data from reports and users
   * @param {Array} reports - The reports data
   * @param {Array} users - The users data
   * @returns {Object} - The processed analytics
   */
  function processAnalyticsData(reports, users) {
    // Calculate reports by status
    const reportsByStatus = countBy(reports, 'status');
    
    // Group reports by technician
    const reportsByTechnician = groupBy(reports, 'technicianName');
    
    // Calculate report timelines
    const reportTimelines = reports
      .filter(r => r.submittedAt)
      .map(report => {
        const creationToSubmission = report.submittedAt - report.createdAt;
        return {
          id: report.id,
          technicianName: report.technicianName,
          clientName: report.clientName,
          daysToSubmit: Math.round(creationToSubmission / (1000 * 60 * 60 * 24)),
          createdAt: report.createdAt
        };
      });
    
    // Extract component statistics
    const componentStats = calculateComponentStatistics(reports);
    
    // Calculate technician performance metrics
    const technicianPerformance = calculateTechnicianPerformance(reports, reportsByTechnician);
    
    // Calculate KPIs
    const kpis = calculateKPIs(reports, users, reportTimelines, componentStats);
    
    // Generate time series data
    const timeSeries = generateTimeSeriesData(reports);
    
    return {
      reportsByStatus,
      reportsByTechnician,
      reportTimelines,
      componentStats,
      technicianPerformance,
      kpis,
      timeSeries
    };
  }
  
  /**
   * Calculate component statistics from reports
   * @param {Array} reports - The reports data
   * @returns {Object} - The component statistics
   */
  function calculateComponentStatistics(reports) {
    // Extract all floor components across reports
    const allComponents = {
      networkCabinets: [],
      perforations: [],
      accessTraps: [],
      cablePaths: [],
      cableTrunkings: [],
      conduits: [],
      copperCablings: [],
      fiberOpticCablings: [],
      customComponents: []
    };
    
    reports.forEach(report => {
      if (!report.floors) return;
      
      report.floors.forEach(floor => {
        // Collect components by type
        Object.keys(allComponents).forEach(componentType => {
          if (floor[componentType] && Array.isArray(floor[componentType])) {
            allComponents[componentType].push(...floor[componentType].map(comp => ({
              ...comp,
              floorName: floor.name,
              reportId: report.id,
              clientName: report.clientName || 'Unknown'
            })));
          }
        });
      });
    });
    
    return allComponents;
  }
  
  /**
   * Calculate technician performance metrics
   * @param {Array} reports - The reports data
   * @param {Object} reportsByTechnician - Reports grouped by technician
   * @returns {Object} - Technician performance metrics
   */
  function calculateTechnicianPerformance(reports, reportsByTechnician) {
    const technicianData = {};
    
    // Calculate performance metrics for each technician
    Object.entries(reportsByTechnician).forEach(([techName, techReports]) => {
      // Skip empty technician names
      if (!techName) return;
      
      const submittedReports = techReports.filter(r => r.submittedAt);
      const avgCompletionDays = submittedReports.length > 0 ? 
        submittedReports.reduce((sum, r) => {
          return sum + ((r.submittedAt - r.createdAt) / (1000 * 60 * 60 * 24));
        }, 0) / submittedReports.length : 0;
      
      // Count components per technician
      let componentCount = 0;
      techReports.forEach(report => {
        if (!report.floors) return;
        
        report.floors.forEach(floor => {
          const componentTypes = [
            'networkCabinets', 'perforations', 'accessTraps', 'cablePaths',
            'cableTrunkings', 'conduits', 'copperCablings', 'fiberOpticCablings',
            'customComponents'
          ];
          
          componentTypes.forEach(type => {
            if (floor[type] && Array.isArray(floor[type])) {
              componentCount += floor[type].length;
            }
          });
        });
      });
      
      // Calculate status breakdown
      const statusCounts = {
        draft: techReports.filter(r => r.status === 'draft').length,
        submitted: techReports.filter(r => r.status === 'submitted').length,
        reviewed: techReports.filter(r => r.status === 'reviewed').length,
        approved: techReports.filter(r => r.status === 'approved').length
      };
      
      technicianData[techName] = {
        totalReports: techReports.length,
        statusCounts,
        avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
        componentsDocumented: componentCount,
        avgComponentsPerReport: techReports.length > 0 ? Math.round((componentCount / techReports.length) * 10) / 10 : 0,
        mostRecentReport: techReports.reduce((latest, r) => 
          !latest || r.createdAt > latest.createdAt ? r : latest, null)
      };
    });
    
    return technicianData;
  }
  
  /**
   * Calculate KPIs from reports and users
   * @param {Array} reports - The reports data
   * @param {Array} users - The users data
   * @param {Array} reportTimelines - The report timelines
   * @param {Object} componentStats - The component statistics
   * @returns {Object} - The KPIs
   */
  function calculateKPIs(reports, users, reportTimelines, componentStats) {
    const kpis = {
      totalReports: reports.length,
      totalSubmitted: reports.filter(r => r.status === 'submitted').length,
      totalReviewed: reports.filter(r => r.status === 'reviewed').length,
      totalApproved: reports.filter(r => r.status === 'approved').length,
      avgCompletionTime: 0,
      avgComponentsPerReport: 0,
      totalTechnicians: users.filter(u => u.role === 'technician').length,
      mostActiveClient: '',
      mostActiveTechnician: '',
      totalComponents: 0
    };
    
    // Calculate average completion time using reportTimelines
    if (reportTimelines.length > 0) {
      kpis.avgCompletionTime = Math.round(meanBy(reportTimelines, 'daysToSubmit') * 10) / 10;
    }
    
    // Calculate total components and average per report
    let totalComponents = 0;
    Object.values(componentStats).forEach(components => {
      totalComponents += components.length;
    });
    kpis.totalComponents = totalComponents;
    
    if (reports.length > 0) {
      kpis.avgComponentsPerReport = Math.round((totalComponents / reports.length) * 10) / 10;
    }
    
    // Find most active client
    const clientCounts = countBy(reports, 'clientName');
    let maxClientCount = 0;
    
    Object.entries(clientCounts).forEach(([client, count]) => {
      if (count > maxClientCount && client) {
        maxClientCount = count;
        kpis.mostActiveClient = client;
      }
    });
    
    // Find most active technician
    const technicianCounts = countBy(reports, 'technicianName');
    let maxTechCount = 0;
    
    Object.entries(technicianCounts).forEach(([tech, count]) => {
      if (count > maxTechCount && tech) {
        maxTechCount = count;
        kpis.mostActiveTechnician = tech;
      }
    });
    
    return kpis;
  }
  
  /**
   * Generate time series data for reports
   * @param {Array} reports - The reports data
   * @returns {Object} - The time series data
   */
  function generateTimeSeriesData(reports) {
    // Sort reports by creation date
    const sortedReports = [...reports].sort((a, b) => a.createdAt - b.createdAt);
    
    // Get last 6 months data
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    // Filter reports for last 6 months
    const recentReports = sortedReports.filter(report => report.createdAt >= sixMonthsAgo);
    
    // Group by month
    const createdByMonth = {};
    const submittedByMonth = {};
    
    // Initialize months
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      createdByMonth[monthKey] = 0;
      submittedByMonth[monthKey] = 0;
    }
    
    // Count reports per month
    recentReports.forEach(report => {
      const createdMonth = `${report.createdAt.getFullYear()}-${report.createdAt.getMonth() + 1}`;
      createdByMonth[createdMonth] = (createdByMonth[createdMonth] || 0) + 1;
      
      if (report.submittedAt) {
        const submittedMonth = `${report.submittedAt.getFullYear()}-${report.submittedAt.getMonth() + 1}`;
        submittedByMonth[submittedMonth] = (submittedByMonth[submittedMonth] || 0) + 1;
      }
    });
    
    // Convert to arrays for charting
    const result = {
      created: Object.entries(createdByMonth).map(([date, count]) => ({ date, count })),
      submitted: Object.entries(submittedByMonth).map(([date, count]) => ({ date, count }))
    };
    
    // Sort by date
    result.created.sort((a, b) => {
      const [yearA, monthA] = a.date.split('-');
      const [yearB, monthB] = b.date.split('-');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });
    
    result.submitted.sort((a, b) => {
      const [yearA, monthA] = a.date.split('-');
      const [yearB, monthB] = b.date.split('-');
      return new Date(yearA, monthA - 1) - new Date(yearB, monthB - 1);
    });
    
    return result;
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
      let dataUrl;
      
      // Handle different chart types
      if (prefix === 'componentChart') {
        dataUrl = chart.getDataURL();
      } else {
        dataUrl = canvas.toDataURL('image/png');
      }
      
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
    document.getElementById('applyDateFilterBtn').disabled = true;
    
    // Reset top stats values to placeholders
    document.getElementById('totalReportsValue').innerHTML = '<div class="placeholder-glow"><span class="placeholder col-8"></span></div>';
    document.getElementById('completedReportsValue').innerHTML = '<div class="placeholder-glow"><span class="placeholder col-8"></span></div>';
    document.getElementById('technicianCountValue').innerHTML = '<div class="placeholder-glow"><span class="placeholder col-8"></span></div>';
    document.getElementById('avgCompletionValue').innerHTML = '<div class="placeholder-glow"><span class="placeholder col-8"></span></div>';
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
    document.getElementById('applyDateFilterBtn').disabled = false;
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
      <div class="alert alert-danger shadow-sm">
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
      
      // Get current reports and analytics data
      const reports = window.currentReports;
      const analytics = window.currentAnalytics;
      
      if (!reports || !analytics) {
        throw new Error('No data available for export. Please refresh the dashboard first.');
      }
      
      // Generate Excel file
      const excelBlob = await generateExcelReport(reports, analytics);
      
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
    toast.className = 'toast show shadow-sm';
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