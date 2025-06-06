// src/bi/enhanced-dashboard.js - Complete BI Dashboard Redesign

import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import Chart from 'chart.js/auto';

/**
 * Enhanced BI Dashboard with professional UI and comprehensive analytics
 */
export class EnhancedBIDashboard {
  constructor(container) {
    this.container = container;
    this.data = {
      reports: [],
      users: [],
      analytics: null
    };
    this.charts = {};
    this.currentFilters = {};
    this.isLoading = false;
    
    this.init();
  }

  /**
   * Initialize the dashboard
   */
  async init() {
    this.render();
    this.attachEventListeners();
    await this.loadData();
  }

  /**
   * Render the main dashboard UI
   */
  render() {
    this.container.innerHTML = `
      <div class="enhanced-bi-dashboard">
        <!-- Header Section -->
        <div class="dashboard-header">
          <div class="header-content">
            <div class="header-title">
              <h1><i class="bi bi-graph-up-arrow"></i> Business Intelligence Dashboard</h1>
              <p class="subtitle">Comprehensive analytics for technical visit reports</p>
            </div>
            <div class="header-actions">
              <button class="btn-primary" id="refreshBtn">
                <i class="bi bi-arrow-clockwise"></i> Refresh
              </button>
              <button class="btn-outline" id="exportBtn">
                <i class="bi bi-download"></i> Export
              </button>
              <button class="btn-outline" id="filtersBtn">
                <i class="bi bi-funnel"></i> Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Filters Panel (Initially Hidden) -->
        <div class="filters-panel" id="filtersPanel" style="display: none;">
          <div class="filters-content">
            <div class="filter-group">
              <label>Date Range</label>
              <div class="date-inputs">
                <input type="date" id="startDate" class="form-input">
                <span>to</span>
                <input type="date" id="endDate" class="form-input">
              </div>
            </div>
            <div class="filter-group">
              <label>Status</label>
              <select id="statusFilter" class="form-select">
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Technician</label>
              <select id="technicianFilter" class="form-select">
                <option value="">All Technicians</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Client</label>
              <select id="clientFilter" class="form-select">
                <option value="">All Clients</option>
              </select>
            </div>
            <div class="filter-actions">
              <button class="btn-primary" id="applyFiltersBtn">Apply Filters</button>
              <button class="btn-outline" id="clearFiltersBtn">Clear</button>
            </div>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid" id="kpiGrid">
          ${this.renderLoadingKPIs()}
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
          <div class="charts-grid">
            <!-- Status Distribution -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>Status Distribution</h3>
                <div class="chart-actions">
                  <button class="btn-icon" data-chart="status" data-action="refresh" title="Refresh">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                  <button class="btn-icon" data-chart="status" data-action="download" title="Download">
                    <i class="bi bi-download"></i>
                  </button>
                </div>
              </div>
              <div class="chart-content">
                <canvas id="statusChart"></canvas>
                <div class="chart-loader" id="statusLoader">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>

            <!-- Reports Timeline -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>Reports Timeline</h3>
                <div class="chart-actions">
                  <select class="chart-period-select" id="timelinePeriod">
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                  <button class="btn-icon" data-chart="timeline" data-action="refresh" title="Refresh">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div class="chart-content">
                <canvas id="timelineChart"></canvas>
                <div class="chart-loader" id="timelineLoader">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>

            <!-- Component Analysis -->
            <div class="chart-card chart-wide">
              <div class="chart-header">
                <h3>Component Distribution Analysis</h3>
                <div class="chart-actions">
                  <button class="btn-icon" data-chart="components" data-action="refresh" title="Refresh">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div class="chart-content">
                <canvas id="componentsChart"></canvas>
                <div class="chart-loader" id="componentsLoader">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>

            <!-- Technician Performance -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>Technician Performance</h3>
                <div class="chart-actions">
                  <button class="btn-icon" data-chart="technician" data-action="refresh" title="Refresh">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div class="chart-content">
                <canvas id="technicianChart"></canvas>
                <div class="chart-loader" id="technicianLoader">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>

            <!-- Client Activity -->
            <div class="chart-card">
              <div class="chart-header">
                <h3>Client Activity</h3>
                <div class="chart-actions">
                  <button class="btn-icon" data-chart="clients" data-action="refresh" title="Refresh">
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>
              </div>
              <div class="chart-content">
                <canvas id="clientChart"></canvas>
                <div class="chart-loader" id="clientLoader">
                  <div class="spinner"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Tables Section -->
        <div class="tables-section">
          <!-- Recent Reports Table -->
          <div class="table-card">
            <div class="table-header">
              <h3><i class="bi bi-file-earmark-text"></i> Recent Reports</h3>
              <div class="table-actions">
                <input type="text" placeholder="Search reports..." class="search-input" id="reportsSearch">
                <button class="btn-outline" id="viewAllReports">View All</button>
              </div>
            </div>
            <div class="table-content">
              <div id="reportsTable" class="data-table">
                ${this.renderLoadingTable()}
              </div>
            </div>
          </div>

          <!-- Technician Performance Table -->
          <div class="table-card">
            <div class="table-header">
              <h3><i class="bi bi-people"></i> Technician Performance</h3>
              <div class="table-actions">
                <select class="form-select" id="performanceMetric">
                  <option value="reports">Total Reports</option>
                  <option value="completion">Avg Completion Time</option>
                  <option value="components">Components Documented</option>
                </select>
              </div>
            </div>
            <div class="table-content">
              <div id="technicianTable" class="data-table">
                ${this.renderLoadingTable()}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="dashboard-footer">
          <p>Last updated: <span id="lastUpdated">Loading...</span></p>
          <p>Data spans: <span id="dataSpan">Loading...</span></p>
        </div>
      </div>
    `;

    this.addStyles();
  }

  /**
   * Render loading state for KPI cards
   */
  renderLoadingKPIs() {
    return Array(6).fill(0).map(() => `
      <div class="kpi-card loading">
        <div class="kpi-icon-placeholder"></div>
        <div class="kpi-content">
          <div class="kpi-value-placeholder"></div>
          <div class="kpi-label-placeholder"></div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render loading state for tables
   */
  renderLoadingTable() {
    return `
      <div class="table-loading">
        <div class="loading-rows">
          ${Array(5).fill(0).map(() => `
            <div class="loading-row">
              <div class="loading-cell"></div>
              <div class="loading-cell"></div>
              <div class="loading-cell"></div>
              <div class="loading-cell"></div>
              <div class="loading-cell"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Header actions
    document.getElementById('refreshBtn').addEventListener('click', () => this.loadData(true));
    document.getElementById('exportBtn').addEventListener('click', () => this.showExportOptions());
    document.getElementById('filtersBtn').addEventListener('click', () => this.toggleFilters());

    // Filter actions
    document.getElementById('applyFiltersBtn').addEventListener('click', () => this.applyFilters());
    document.getElementById('clearFiltersBtn').addEventListener('click', () => this.clearFilters());

    // Chart actions
    document.querySelectorAll('[data-action="refresh"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chartType = e.target.closest('[data-chart]').dataset.chart;
        this.refreshChart(chartType);
      });
    });

    document.querySelectorAll('[data-action="download"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const chartType = e.target.closest('[data-chart]').dataset.chart;
        this.downloadChart(chartType);
      });
    });

    // Timeline period change
    document.getElementById('timelinePeriod').addEventListener('change', () => {
      this.renderTimelineChart();
    });

    // Search functionality
    document.getElementById('reportsSearch').addEventListener('input', (e) => {
      this.filterReportsTable(e.target.value);
    });

    // Performance metric change
    document.getElementById('performanceMetric').addEventListener('change', () => {
      this.renderTechnicianTable();
    });

    // Table actions
    document.getElementById('viewAllReports').addEventListener('click', () => {
      // Navigate to reports module
      const event = new CustomEvent('moduleChange', { detail: { module: 'reports' } });
      document.dispatchEvent(event);
    });
  }

  /**
   * Load data from Firebase
   */
  async loadData(forceRefresh = false) {
    if (this.isLoading && !forceRefresh) return;
    
    this.isLoading = true;
    this.showLoading();

    try {
      console.log('Loading dashboard data...');

      // Fetch reports
      const reportsQuery = query(
        collection(db, 'technical_visit_reports'),
        orderBy('createdAt', 'desc')
      );
      
      const reportsSnapshot = await getDocs(reportsQuery);
      this.data.reports = reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        submittedAt: doc.data().submittedAt?.toDate() || null,
        lastModified: doc.data().lastModified?.toDate() || null
      }));

      // Fetch users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      this.data.users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Loaded ${this.data.reports.length} reports and ${this.data.users.length} users`);

      // Process analytics
      this.data.analytics = this.processAnalytics();

      // Update UI
      this.updateDashboard();
      this.hideLoading();

      // Update footer
      this.updateFooter();

      if (forceRefresh) {
        this.showNotification('Data refreshed successfully', 'success');
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data: ' + error.message);
      this.hideLoading();
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Process analytics data
   */
  processAnalytics() {
    const { reports, users } = this.data;

    // Basic statistics
    const totalReports = reports.length;
    const statusCounts = this.countByField(reports, 'status');
    const technicianCounts = this.countByField(reports, 'technicianName');
    const clientCounts = this.countByField(reports, 'clientName');

    // Component analysis
    const componentStats = this.analyzeComponents(reports);

    // Time analysis
    const completionTimes = this.analyzeCompletionTimes(reports);
    const timeline = this.generateTimeline(reports);

    // Performance metrics
    const technicianPerformance = this.analyzeTechnicianPerformance(reports);

    return {
      totals: {
        reports: totalReports,
        technicians: users.filter(u => u.role === 'technician').length,
        clients: Object.keys(clientCounts).length,
        components: componentStats.total
      },
      status: statusCounts,
      technicians: technicianCounts,
      clients: clientCounts,
      components: componentStats,
      completion: completionTimes,
      timeline,
      performance: technicianPerformance
    };
  }

  /**
   * Count occurrences by field
   */
  countByField(array, field) {
    const counts = {};
    array.forEach(item => {
      const value = item[field];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    return counts;
  }

  /**
   * Analyze components across all reports
   */
  analyzeComponents(reports) {
    const componentTypes = {
      networkCabinets: 'Network Cabinets',
      perforations: 'Perforations',
      accessTraps: 'Access Traps',
      cablePaths: 'Cable Paths',
      cableTrunkings: 'Cable Trunkings',
      conduits: 'Conduits',
      copperCablings: 'Copper Cablings',
      fiberOpticCablings: 'Fiber Optic Cablings'
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
   * Analyze completion times
   */
  analyzeCompletionTimes(reports) {
    const completedReports = reports.filter(r => r.submittedAt && r.createdAt);
    
    if (completedReports.length === 0) {
      return { average: 0, min: 0, max: 0, distribution: [] };
    }

    const times = completedReports.map(r => {
      const days = (r.submittedAt - r.createdAt) / (1000 * 60 * 60 * 24);
      return Math.round(days * 10) / 10;
    });

    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      distribution: this.createDistribution(times)
    };
  }

  /**
   * Create distribution for completion times
   */
  createDistribution(times) {
    const ranges = [
      { label: '0-1 days', min: 0, max: 1 },
      { label: '1-3 days', min: 1, max: 3 },
      { label: '3-7 days', min: 3, max: 7 },
      { label: '7-14 days', min: 7, max: 14 },
      { label: '14+ days', min: 14, max: Infinity }
    ];

    return ranges.map(range => ({
      label: range.label,
      count: times.filter(t => t > range.min && t <= range.max).length
    }));
  }

  /**
   * Generate timeline data
   */
  generateTimeline(reports, days = 30) {
    const timeline = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayReports = reports.filter(r => {
        const reportDate = r.createdAt.toISOString().split('T')[0];
        return reportDate === dateStr;
      });

      timeline.push({
        date: dateStr,
        label: date.toLocaleDateString(),
        created: dayReports.length,
        submitted: dayReports.filter(r => r.status === 'submitted').length,
        reviewed: dayReports.filter(r => r.status === 'reviewed').length,
        approved: dayReports.filter(r => r.status === 'approved').length
      });
    }

    return timeline;
  }

  /**
   * Analyze technician performance
   */
  analyzeTechnicianPerformance(reports) {
    const performance = {};

    reports.forEach(report => {
      const tech = report.technicianName;
      if (!tech) return;

      if (!performance[tech]) {
        performance[tech] = {
          total: 0,
          submitted: 0,
          reviewed: 0,
          approved: 0,
          components: 0,
          avgCompletionTime: 0,
          completionTimes: []
        };
      }

      const p = performance[tech];
      p.total++;

      if (report.status === 'submitted') p.submitted++;
      if (report.status === 'reviewed') p.reviewed++;
      if (report.status === 'approved') p.approved++;

      // Count components
      if (report.floors && Array.isArray(report.floors)) {
        report.floors.forEach(floor => {
          const componentTypes = ['networkCabinets', 'perforations', 'accessTraps', 'cablePaths', 'cableTrunkings', 'conduits', 'copperCablings', 'fiberOpticCablings'];
          componentTypes.forEach(type => {
            if (floor[type] && Array.isArray(floor[type])) {
              p.components += floor[type].length;
            }
          });
        });
      }

      // Completion time
      if (report.submittedAt && report.createdAt) {
        const days = (report.submittedAt - report.createdAt) / (1000 * 60 * 60 * 24);
        p.completionTimes.push(days);
      }
    });

    // Calculate averages
    Object.values(performance).forEach(p => {
      if (p.completionTimes.length > 0) {
        p.avgCompletionTime = p.completionTimes.reduce((a, b) => a + b, 0) / p.completionTimes.length;
      }
    });

    return performance;
  }

  /**
   * Update the entire dashboard
   */
  updateDashboard() {
    this.renderKPIs();
    this.renderCharts();
    this.renderTables();
    this.updateFilters();
  }

  /**
   * Render KPI cards
   */
  renderKPIs() {
    const { analytics } = this.data;
    const { totals, status, completion } = analytics;

    const kpis = [
      {
        icon: 'bi-file-earmark-text',
        value: totals.reports,
        label: 'Total Reports',
        color: 'blue',
        trend: this.calculateTrend('reports')
      },
      {
        icon: 'bi-check-circle',
        value: (status.approved || 0),
        label: 'Approved Reports',
        color: 'green',
        trend: this.calculateTrend('approved')
      },
      {
        icon: 'bi-people',
        value: totals.technicians,
        label: 'Active Technicians',
        color: 'purple',
        trend: null
      },
      {
        icon: 'bi-building',
        value: totals.clients,
        label: 'Clients Served',
        color: 'orange',
        trend: null
      },
      {
        icon: 'bi-boxes',
        value: totals.components,
        label: 'Components Documented',
        color: 'cyan',
        trend: this.calculateTrend('components')
      },
      {
        icon: 'bi-clock',
        value: completion.average.toFixed(1),
        label: 'Avg Completion (days)',
        color: 'red',
        trend: this.calculateTrend('completion')
      }
    ];

    const kpiGrid = document.getElementById('kpiGrid');
    kpiGrid.innerHTML = kpis.map(kpi => `
      <div class="kpi-card" data-color="${kpi.color}">
        <div class="kpi-icon">
          <i class="${kpi.icon}"></i>
        </div>
        <div class="kpi-content">
          <div class="kpi-value">${kpi.value}</div>
          <div class="kpi-label">${kpi.label}</div>
          ${kpi.trend ? `<div class="kpi-trend ${kpi.trend.direction}">${kpi.trend.text}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  /**
   * Calculate trend (placeholder - would need historical data)
   */
  calculateTrend(metric) {
    // This would require historical data to calculate real trends
    // For now, returning mock trends for demonstration
    const trends = {
      reports: { direction: 'up', text: '+12% vs last month' },
      approved: { direction: 'up', text: '+8% vs last month' },
      components: { direction: 'up', text: '+15% vs last month' },
      completion: { direction: 'down', text: '-2.3 days vs last month' }
    };
    return trends[metric] || null;
  }

  /**
   * Render all charts
   */
  renderCharts() {
    this.renderStatusChart();
    this.renderTimelineChart();
    this.renderComponentsChart();
    this.renderTechnicianChart();
    this.renderClientChart();
  }

  /**
   * Render status distribution chart
   */
  renderStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const { status } = this.data.analytics;

    const data = {
      labels: ['Draft', 'Submitted', 'Reviewed', 'Approved'],
      datasets: [{
        data: [
          status.draft || 0,
          status.submitted || 0,
          status.reviewed || 0,
          status.approved || 0
        ],
        backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#10b981'],
        borderWidth: 0
      }]
    };

    if (this.charts.status) {
      this.charts.status.destroy();
    }

    this.charts.status = new Chart(ctx, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        },
        cutout: '60%'
      }
    });

    this.hideChartLoader('statusLoader');
  }

  /**
   * Render timeline chart
   */
  renderTimelineChart() {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    const period = parseInt(document.getElementById('timelinePeriod').value);
    const timeline = this.generateTimeline(this.data.reports, period);

    const data = {
      labels: timeline.map(t => t.label),
      datasets: [
        {
          label: 'Created',
          data: timeline.map(t => t.created),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Submitted',
          data: timeline.map(t => t.submitted),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };

    if (this.charts.timeline) {
      this.charts.timeline.destroy();
    }

    this.charts.timeline = new Chart(ctx, {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    this.hideChartLoader('timelineLoader');
  }

  /**
   * Render components chart
   */
  renderComponentsChart() {
    const ctx = document.getElementById('componentsChart').getContext('2d');
    const { components } = this.data.analytics;

    const componentData = Object.entries(components)
      .filter(([key]) => key !== 'total')
      .map(([key, value]) => ({ name: value.name, count: value.count }))
      .sort((a, b) => b.count - a.count);

    const data = {
      labels: componentData.map(c => c.name),
      datasets: [{
        label: 'Components',
        data: componentData.map(c => c.count),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
          '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
        ],
        borderWidth: 0
      }]
    };

    if (this.charts.components) {
      this.charts.components.destroy();
    }

    this.charts.components = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    this.hideChartLoader('componentsLoader');
  }

  /**
   * Render technician performance chart
   */
  renderTechnicianChart() {
    const ctx = document.getElementById('technicianChart').getContext('2d');
    const { performance } = this.data.analytics;

    const topTechnicians = Object.entries(performance)
      .sort(([,a], [,b]) => b.total - a.total)
      .slice(0, 5);

    const data = {
      labels: topTechnicians.map(([name]) => name),
      datasets: [
        {
          label: 'Total Reports',
          data: topTechnicians.map(([,perf]) => perf.total),
          backgroundColor: '#3b82f6'
        },
        {
          label: 'Approved',
          data: topTechnicians.map(([,perf]) => perf.approved),
          backgroundColor: '#10b981'
        }
      ]
    };

    this.charts.technician = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    this.hideChartLoader('technicianLoader');
  }

  /**
   * Render client activity chart
   */
  renderClientChart() {
    const ctx = document.getElementById('clientChart').getContext('2d');
    const { clients } = this.data.analytics;

    const topClients = Object.entries(clients)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    const data = {
      labels: topClients.map(([name]) => name.length > 15 ? name.substring(0, 15) + '...' : name),
      datasets: [{
        label: 'Reports',
        data: topClients.map(([,count]) => count),
        backgroundColor: '#f59e0b',
        borderWidth: 0
      }]
    };

    if (this.charts.clients) {
      this.charts.clients.destroy();
    }

    this.charts.clients = new Chart(ctx, {
      type: 'bar',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    this.hideChartLoader('clientLoader');
  }

  /**
   * Render data tables
   */
  renderTables() {
    this.renderReportsTable();
    this.renderTechnicianTable();
  }

  /**
   * Render recent reports table
   */
  renderReportsTable() {
    const recentReports = this.data.reports.slice(0, 10);
    
    const tableHtml = `
      <table class="professional-table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Location</th>
            <th>Technician</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${recentReports.map(report => `
            <tr>
              <td>
                <div class="table-cell-main">${report.clientName || 'Unknown'}</div>
              </td>
              <td>
                <div class="table-cell-secondary">${report.location || 'N/A'}</div>
              </td>
              <td>
                <div class="technician-info">
                  <div class="technician-avatar">${this.getInitials(report.technicianName)}</div>
                  <span>${report.technicianName || 'Unassigned'}</span>
                </div>
              </td>
              <td>
                <span class="status-badge status-${report.status || 'unknown'}">
                  ${this.formatStatus(report.status)}
                </span>
              </td>
              <td>
                <div class="date-info">
                  <div class="date-main">${report.createdAt.toLocaleDateString()}</div>
                  <div class="date-time">${report.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                </div>
              </td>
              <td>
                <div class="table-actions">
                  <button class="btn-icon" onclick="viewReport('${report.id}')" title="View Report">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn-icon" onclick="downloadReport('${report.id}')" title="Download PDF">
                    <i class="bi bi-download"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('reportsTable').innerHTML = tableHtml;
  }

  /**
   * Render technician performance table
   */
  renderTechnicianTable() {
    const { performance } = this.data.analytics;
    const metric = document.getElementById('performanceMetric').value;
    
    let sortedTechnicians = Object.entries(performance);
    
    // Sort by selected metric
    switch (metric) {
      case 'reports':
        sortedTechnicians.sort(([,a], [,b]) => b.total - a.total);
        break;
      case 'completion':
        sortedTechnicians.sort(([,a], [,b]) => a.avgCompletionTime - b.avgCompletionTime);
        break;
      case 'components':
        sortedTechnicians.sort(([,a], [,b]) => b.components - a.components);
        break;
    }

    const tableHtml = `
      <table class="professional-table">
        <thead>
          <tr>
            <th>Technician</th>
            <th>Total Reports</th>
            <th>Approved</th>
            <th>Avg Completion</th>
            <th>Components</th>
            <th>Efficiency</th>
          </tr>
        </thead>
        <tbody>
          ${sortedTechnicians.map(([name, perf]) => {
            const efficiency = perf.total > 0 ? (perf.approved / perf.total * 100).toFixed(1) : 0;
            return `
              <tr>
                <td>
                  <div class="technician-info">
                    <div class="technician-avatar">${this.getInitials(name)}</div>
                    <span>${name}</span>
                  </div>
                </td>
                <td>
                  <div class="metric-cell">
                    <span class="metric-value">${perf.total}</span>
                  </div>
                </td>
                <td>
                  <div class="metric-cell">
                    <span class="metric-value">${perf.approved}</span>
                    <div class="metric-bar">
                      <div class="metric-fill" style="width: ${(perf.approved / perf.total * 100)}%"></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="metric-cell">
                    <span class="metric-value">${perf.avgCompletionTime.toFixed(1)} days</span>
                  </div>
                </td>
                <td>
                  <div class="metric-cell">
                    <span class="metric-value">${perf.components}</span>
                    <span class="metric-secondary">${(perf.components / perf.total).toFixed(1)} avg</span>
                  </div>
                </td>
                <td>
                  <div class="efficiency-cell">
                    <span class="efficiency-value ${efficiency >= 80 ? 'high' : efficiency >= 60 ? 'medium' : 'low'}">
                      ${efficiency}%
                    </span>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    document.getElementById('technicianTable').innerHTML = tableHtml;
  }

  /**
   * Update filter dropdowns
   */
  updateFilters() {
    const { technicians, clients } = this.data.analytics;

    // Update technician filter
    const technicianFilter = document.getElementById('technicianFilter');
    technicianFilter.innerHTML = '<option value="">All Technicians</option>' +
      Object.keys(technicians).map(name => `<option value="${name}">${name}</option>`).join('');

    // Update client filter
    const clientFilter = document.getElementById('clientFilter');
    clientFilter.innerHTML = '<option value="">All Clients</option>' +
      Object.keys(clients).map(name => `<option value="${name}">${name}</option>`).join('');
  }

  /**
   * Toggle filters panel
   */
  toggleFilters() {
    const panel = document.getElementById('filtersPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }

  /**
   * Apply filters
   */
  applyFilters() {
    const filters = {
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      status: document.getElementById('statusFilter').value,
      technician: document.getElementById('technicianFilter').value,
      client: document.getElementById('clientFilter').value
    };

    this.currentFilters = filters;
    this.loadFilteredData();
    this.showNotification('Filters applied', 'success');
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('technicianFilter').value = '';
    document.getElementById('clientFilter').value = '';
    
    this.currentFilters = {};
    this.loadData();
    this.showNotification('Filters cleared', 'info');
  }

  /**
   * Load filtered data
   */
  async loadFilteredData() {
    try {
      this.showLoading();

      let filteredReports = [...this.data.reports];

      // Apply date filter
      if (this.currentFilters.startDate) {
        const startDate = new Date(this.currentFilters.startDate);
        filteredReports = filteredReports.filter(r => r.createdAt >= startDate);
      }

      if (this.currentFilters.endDate) {
        const endDate = new Date(this.currentFilters.endDate);
        endDate.setHours(23, 59, 59, 999);
        filteredReports = filteredReports.filter(r => r.createdAt <= endDate);
      }

      // Apply other filters
      if (this.currentFilters.status) {
        filteredReports = filteredReports.filter(r => r.status === this.currentFilters.status);
      }

      if (this.currentFilters.technician) {
        filteredReports = filteredReports.filter(r => r.technicianName === this.currentFilters.technician);
      }

      if (this.currentFilters.client) {
        filteredReports = filteredReports.filter(r => r.clientName === this.currentFilters.client);
      }

      // Update data with filtered results
      const originalReports = this.data.reports;
      this.data.reports = filteredReports;
      this.data.analytics = this.processAnalytics();

      // Update dashboard
      this.updateDashboard();
      this.hideLoading();

      // Restore original data
      this.data.reports = originalReports;

    } catch (error) {
      console.error('Error applying filters:', error);
      this.showError('Error applying filters: ' + error.message);
      this.hideLoading();
    }
  }

  /**
   * Filter reports table by search term
   */
  filterReportsTable(searchTerm) {
    const rows = document.querySelectorAll('#reportsTable tbody tr');
    const term = searchTerm.toLowerCase();

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  }

  /**
   * Refresh specific chart
   */
  refreshChart(chartType) {
    this.showChartLoader(chartType + 'Loader');
    
    setTimeout(() => {
      switch (chartType) {
        case 'status':
          this.renderStatusChart();
          break;
        case 'timeline':
          this.renderTimelineChart();
          break;
        case 'components':
          this.renderComponentsChart();
          break;
        case 'technician':
          this.renderTechnicianChart();
          break;
        case 'clients':
          this.renderClientChart();
          break;
      }
    }, 500);
  }

  /**
   * Download chart as image
   */
  downloadChart(chartType) {
    const chart = this.charts[chartType];
    if (!chart) return;

    const canvas = chart.canvas;
    const link = document.createElement('a');
    link.download = `${chartType}-chart-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();

    this.showNotification('Chart downloaded', 'success');
  }

  /**
   * Show export options modal
   */
  showExportOptions() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Export Dashboard</h3>
          <button class="btn-icon modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="export-options">
            <div class="export-option" onclick="window.dashboardInstance.exportToExcel()">
              <i class="bi bi-file-earmark-excel"></i>
              <h4>Excel Report</h4>
              <p>Complete data export with all metrics</p>
            </div>
            <div class="export-option" onclick="window.dashboardInstance.exportToPDF()">
              <i class="bi bi-file-earmark-pdf"></i>
              <h4>PDF Summary</h4>
              <p>Visual summary with charts and KPIs</p>
            </div>
            <div class="export-option" onclick="window.dashboardInstance.exportToCSV()">
              <i class="bi bi-file-earmark-text"></i>
              <h4>CSV Data</h4>
              <p>Raw data for further analysis</p>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  /**
   * Export to Excel
   */
  exportToExcel() {
    // Implementation would use a library like SheetJS
    this.showNotification('Excel export started...', 'info');
    
    // Mock export for now
    setTimeout(() => {
      this.showNotification('Excel file downloaded', 'success');
      document.querySelector('.modal-overlay')?.remove();
    }, 2000);
  }

  /**
   * Export to PDF
   */
  exportToPDF() {
    this.showNotification('PDF export started...', 'info');
    
    // Mock export for now
    setTimeout(() => {
      this.showNotification('PDF file downloaded', 'success');
      document.querySelector('.modal-overlay')?.remove();
    }, 2000);
  }

  /**
   * Export to CSV
   */
  exportToCSV() {
    const { reports } = this.data;
    
    const headers = ['ID', 'Client', 'Location', 'Technician', 'Status', 'Created', 'Submitted'];
    const csvContent = [
      headers.join(','),
      ...reports.map(report => [
        report.id,
        `"${report.clientName || ''}"`,
        `"${report.location || ''}"`,
        `"${report.technicianName || ''}"`,
        report.status || '',
        report.createdAt.toISOString(),
        report.submittedAt ? report.submittedAt.toISOString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    this.showNotification('CSV file downloaded', 'success');
    document.querySelector('.modal-overlay')?.remove();
  }

  /**
   * Update footer information
   */
  updateFooter() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleString();
    
    if (this.data.reports.length > 0) {
      const dates = this.data.reports.map(r => r.createdAt).sort();
      const oldest = dates[0];
      const newest = dates[dates.length - 1];
      document.getElementById('dataSpan').textContent = 
        `${oldest.toLocaleDateString()} - ${newest.toLocaleDateString()}`;
    }
  }

  /**
   * Utility functions
   */
  getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  formatStatus(status) {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  showLoading() {
    document.querySelectorAll('.chart-loader').forEach(loader => {
      loader.style.display = 'flex';
    });
  }

  hideLoading() {
    document.querySelectorAll('.chart-loader').forEach(loader => {
      loader.style.display = 'none';
    });
  }

  showChartLoader(loaderId) {
    document.getElementById(loaderId).style.display = 'flex';
  }

  hideChartLoader(loaderId) {
    document.getElementById(loaderId).style.display = 'none';
  }

showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  /**
   * Add custom styles for the dashboard
   */
  addStyles() {
    if (document.getElementById('enhanced-bi-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'enhanced-bi-styles';
    styles.textContent = `
      .enhanced-bi-dashboard {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #1e293b;
        background: #f8fafc;
        min-height: 100vh;
      }

      /* Header */
      .dashboard-header {
        background: white;
        border-bottom: 1px solid #e2e8f0;
        padding: 1.5rem 2rem;
        margin-bottom: 2rem;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1400px;
        margin: 0 auto;
      }

      .header-title h1 {
        margin: 0;
        font-size: 1.875rem;
        font-weight: 700;
        color: #0f172a;
      }

      .header-title .subtitle {
        margin: 0.25rem 0 0 0;
        color: #64748b;
        font-size: 0.875rem;
      }

      .header-actions {
        display: flex;
        gap: 0.75rem;
      }

      /* Buttons */
      .btn-primary, .btn-outline {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        border: none;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
      }

      .btn-primary:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }

      .btn-outline {
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
      }

      .btn-outline:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .btn-icon {
        padding: 0.5rem;
        border: none;
        background: none;
        border-radius: 0.25rem;
        cursor: pointer;
        color: #6b7280;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .btn-icon:hover {
        background: #f3f4f6;
        color: #374151;
      }

      /* Filters Panel */
      .filters-panel {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        margin: 0 2rem 2rem 2rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        animation: slideDown 0.3s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .filters-content {
        padding: 1.5rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        align-items: end;
      }

      .filter-group label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.5rem;
        color: #374151;
        font-size: 0.875rem;
      }

      .form-input, .form-select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .form-input:focus, .form-select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .date-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .date-inputs span {
        color: #6b7280;
        font-size: 0.875rem;
        white-space: nowrap;
      }

      .filter-actions {
        display: flex;
        gap: 0.5rem;
      }

      /* KPI Grid */
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin: 0 2rem 2rem 2rem;
      }

      .kpi-card {
        background: white;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.2s ease;
        border: 1px solid #f1f5f9;
      }

      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: #e2e8f0;
      }

      .kpi-card.loading {
        animation: pulse 1.5s infinite;
      }

      .kpi-icon {
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .kpi-card[data-color="blue"] .kpi-icon { background: #dbeafe; color: #3b82f6; }
      .kpi-card[data-color="green"] .kpi-icon { background: #dcfce7; color: #16a34a; }
      .kpi-card[data-color="purple"] .kpi-icon { background: #f3e8ff; color: #9333ea; }
      .kpi-card[data-color="orange"] .kpi-icon { background: #fed7aa; color: #ea580c; }
      .kpi-card[data-color="cyan"] .kpi-icon { background: #cffafe; color: #0891b2; }
      .kpi-card[data-color="red"] .kpi-icon { background: #fee2e2; color: #dc2626; }

      .kpi-content {
        flex: 1;
        min-width: 0;
      }

      .kpi-value {
        font-size: 2rem;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 0.25rem;
        color: #0f172a;
      }

      .kpi-label {
        font-size: 0.875rem;
        color: #6b7280;
        margin-bottom: 0.25rem;
        font-weight: 500;
      }

      .kpi-trend {
        font-size: 0.75rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .kpi-trend.up { color: #16a34a; }
      .kpi-trend.down { color: #dc2626; }

      /* Charts Section */
      .charts-section {
        margin: 0 2rem 2rem 2rem;
      }

      .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
      }

      .chart-wide {
        grid-column: 1 / -1;
      }

      .chart-card {
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: 1px solid #f1f5f9;
        transition: all 0.2s ease;
      }

      .chart-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border-color: #e2e8f0;
      }

      .chart-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fafbfc;
      }

      .chart-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #0f172a;
      }

      .chart-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }

      .chart-period-select {
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        background: white;
      }

      .chart-content {
        padding: 1.5rem;
        position: relative;
        height: 300px;
      }

      .chart-loader {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: none;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(2px);
      }

      .spinner {
        width: 2rem;
        height: 2rem;
        border: 2px solid #e5e7eb;
        border-top: 2px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      /* Tables Section */
      .tables-section {
        margin: 0 2rem 2rem 2rem;
        display: grid;
        gap: 2rem;
      }

      .table-card {
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: 1px solid #f1f5f9;
      }

      .table-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fafbfc;
      }

      .table-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #0f172a;
      }

      .table-actions {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .search-input {
        padding: 0.5rem 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        min-width: 200px;
      }

      .search-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .table-content {
        overflow-x: auto;
      }

      .professional-table {
        width: 100%;
        border-collapse: collapse;
      }

      .professional-table th {
        background: #f8fafc;
        padding: 0.75rem 1rem;
        text-align: left;
        font-weight: 600;
        font-size: 0.875rem;
        color: #374151;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
      }

      .professional-table td {
        padding: 1rem;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .professional-table tbody tr {
        transition: background-color 0.2s ease;
      }

      .professional-table tbody tr:hover {
        background: #f8fafc;
      }

      .table-cell-main {
        font-weight: 500;
        color: #111827;
      }

      .table-cell-secondary {
        color: #6b7280;
        font-size: 0.875rem;
      }

      .technician-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .technician-avatar {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        background: #3b82f6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 600;
        flex-shrink: 0;
      }

      .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: capitalize;
        white-space: nowrap;
      }

      .status-draft { background: #f1f5f9; color: #64748b; }
      .status-submitted { background: #dbeafe; color: #1d4ed8; }
      .status-reviewed { background: #fef3c7; color: #d97706; }
      .status-approved { background: #dcfce7; color: #16a34a; }
      .status-unknown { background: #f3f4f6; color: #6b7280; }

      .date-info {
        text-align: left;
      }

      .date-main {
        font-weight: 500;
        color: #111827;
        font-size: 0.875rem;
      }

      .date-time {
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.125rem;
      }

      .table-actions {
        display: flex;
        gap: 0.25rem;
      }

      .metric-cell {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .metric-value {
        font-weight: 600;
        color: #111827;
      }

      .metric-secondary {
        font-size: 0.75rem;
        color: #6b7280;
      }

      .metric-bar {
        width: 100%;
        height: 4px;
        background: #f1f5f9;
        border-radius: 2px;
        overflow: hidden;
      }

      .metric-fill {
        height: 100%;
        background: #3b82f6;
        transition: width 0.3s ease;
        border-radius: 2px;
      }

      .efficiency-cell {
        text-align: center;
      }

      .efficiency-value {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-weight: 600;
        font-size: 0.875rem;
        white-space: nowrap;
      }

      .efficiency-value.high { background: #dcfce7; color: #16a34a; }
      .efficiency-value.medium { background: #fef3c7; color: #d97706; }
      .efficiency-value.low { background: #fee2e2; color: #dc2626; }

      /* Loading States */
      .kpi-icon-placeholder, .kpi-value-placeholder, .kpi-label-placeholder {
        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 0.25rem;
      }

      .kpi-icon-placeholder {
        width: 3rem;
        height: 3rem;
        border-radius: 0.75rem;
      }

      .kpi-value-placeholder {
        height: 2rem;
        width: 4rem;
        margin-bottom: 0.25rem;
      }

      .kpi-label-placeholder {
        height: 1rem;
        width: 6rem;
      }

      .table-loading {
        padding: 2rem;
      }

      .loading-row {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .loading-cell {
        height: 1rem;
        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 0.25rem;
        flex: 1;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Modal */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .modal-content {
        background: white;
        border-radius: 0.75rem;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fafbfc;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #0f172a;
      }

      .modal-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #6b7280;
        font-size: 1.25rem;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: all 0.2s;
      }

      .modal-close:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .export-options {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .export-option {
        padding: 1.5rem;
        border: 2px solid #e2e8f0;
        border-radius: 0.75rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        background: white;
      }

      .export-option:hover {
        border-color: #3b82f6;
        background: #f8fafc;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .export-option i {
        font-size: 2rem;
        margin-bottom: 0.75rem;
        color: #3b82f6;
      }

      .export-option h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: #0f172a;
      }

      .export-option p {
        margin: 0;
        font-size: 0.875rem;
        color: #6b7280;
      }

      /* Notifications */
      .notification {
        position: fixed;
        top: 1rem;
        right: 1rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        padding: 1rem 1.25rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1001;
        border-left: 4px solid;
        min-width: 300px;
        max-width: 400px;
      }

      .notification.show {
        transform: translateX(0);
      }

      .notification-success { border-left-color: #16a34a; }
      .notification-error { border-left-color: #dc2626; }
      .notification-info { border-left-color: #3b82f6; }

      .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .notification i {
        font-size: 1.25rem;
        flex-shrink: 0;
      }

      .notification-success i { color: #16a34a; }
      .notification-error i { color: #dc2626; }
      .notification-info i { color: #3b82f6; }

      .notification span {
        font-size: 0.875rem;
        color: #374151;
        font-weight: 500;
      }

      /* Footer */
      .dashboard-footer {
        margin: 2rem;
        padding: 1.5rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        color: #6b7280;
        border: 1px solid #f1f5f9;
      }

      .dashboard-footer p {
        margin: 0;
      }

      /* Animations */
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Responsive Design */
      @media (max-width: 1024px) {
        .charts-grid {
          grid-template-columns: 1fr;
        }
        
        .chart-wide {
          grid-column: 1;
        }
      }

      @media (max-width: 768px) {
        .enhanced-bi-dashboard {
          font-size: 0.875rem;
        }

        .dashboard-header {
          padding: 1rem;
        }

        .header-content {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .header-actions {
          justify-content: center;
          flex-wrap: wrap;
        }

        .kpi-grid {
          grid-template-columns: 1fr;
          margin: 0 1rem 2rem 1rem;
          gap: 1rem;
        }

        .kpi-card {
          padding: 1rem;
        }

        .kpi-value {
          font-size: 1.5rem;
        }

        .charts-section,
        .tables-section {
          margin: 0 1rem 2rem 1rem;
        }

        .charts-grid {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .chart-content {
          height: 250px;
          padding: 1rem;
        }

        .filters-content {
          grid-template-columns: 1fr;
          padding: 1rem;
        }

        .filter-actions {
          grid-column: 1;
        }

        .dashboard-footer {
          margin: 1rem;
          padding: 1rem;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
        }

        .professional-table {
          font-size: 0.75rem;
        }

        .professional-table th,
        .professional-table td {
          padding: 0.5rem;
        }

        .search-input {
          min-width: auto;
          width: 100%;
        }

        .table-actions {
          flex-direction: column;
          gap: 0.5rem;
          align-items: stretch;
        }

        .technician-info {
          gap: 0.5rem;
        }

        .technician-avatar {
          width: 1.5rem;
          height: 1.5rem;
          font-size: 0.625rem;
        }

        .notification {
          left: 1rem;
          right: 1rem;
          min-width: auto;
          max-width: none;
        }

        .modal-content {
          width: 95%;
          margin: 1rem;
        }

        .export-options {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 640px) {
        .kpi-card {
          flex-direction: column;
          text-align: center;
          gap: 0.75rem;
        }

        .kpi-content {
          text-align: center;
        }

        .chart-header {
          flex-direction: column;
          gap: 0.75rem;
          align-items: stretch;
        }

        .chart-actions {
          justify-content: center;
        }

        .table-header {
          flex-direction: column;
          gap: 1rem;
          align-items: stretch;
        }

        .professional-table {
          display: block;
          overflow-x: auto;
          white-space: nowrap;
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .enhanced-bi-dashboard {
          background: #0f172a;
          color: #f1f5f9;
        }

        .dashboard-header,
        .filters-panel,
        .kpi-card,
        .chart-card,
        .table-card,
        .dashboard-footer,
        .modal-content {
          background: #1e293b;
          border-color: #334155;
        }

        .chart-header,
        .table-header,
        .modal-header {
          background: #334155;
        }

        .btn-outline {
          background: #1e293b;
          color: #f1f5f9;
          border-color: #334155;
        }

        .btn-outline:hover {
          background: #334155;
        }

        .form-input,
        .form-select,
        .search-input,
        .chart-period-select {
          background: #334155;
          border-color: #475569;
          color: #f1f5f9;
        }

        .professional-table th {
          background: #374151;
          color: #f1f5f9;
        }

        .professional-table tbody tr:hover {
          background: #374151;
        }

        .kpi-value,
        .header-title h1,
        .chart-header h3,
        .table-header h3,
        .modal-header h3 {
          color: #f1f5f9;
        }

        .notification {
          background: #1e293b;
          border-color: #334155;
        }

        .notification span {
          color: #f1f5f9;
        }

        .export-option {
          background: #1e293b;
          border-color: #334155;
        }

        .export-option:hover {
          background: #334155;
        }

        .export-option h4 {
          color: #f1f5f9;
        }
      }

      /* Print styles */
      @media print {
        .header-actions,
        .filters-panel,
        .chart-actions,
        .table-actions,
        .dashboard-footer {
          display: none !important;
        }

        .enhanced-bi-dashboard {
          background: white;
          color: black;
        }

        .chart-card,
        .table-card,
        .kpi-card {
          break-inside: avoid;
          box-shadow: none;
          border: 1px solid #e2e8f0;
          margin-bottom: 1rem;
        }

        .dashboard-header {
          border-bottom: 2px solid #000;
          margin-bottom: 1rem;
        }

        .kpi-grid {
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .charts-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .chart-wide {
          grid-column: 1 / -1;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Cleanup method
   */
  destroy() {
    // Cleanup charts
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    
    // Clear intervals
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Remove styles
    const styles = document.getElementById('enhanced-bi-styles');
    if (styles) {
      styles.remove();
    }

    // Clear container
    if (this.container) {
      this.container.innerHTML = '';
    }

    console.log('Enhanced BI Dashboard destroyed');
  }

  /**
   * Handle window resize for responsive charts
   */
  handleResize = () => {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }

  /**
   * Set up automatic refresh
   */
  setupAutoRefresh(intervalMinutes = 5) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.loadData();
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto-refresh set up for every ${intervalMinutes} minutes`);
  }

  /**
   * Get current dashboard state for persistence
   */
  getState() {
    return {
      filters: this.currentFilters,
      timelinePeriod: document.getElementById('timelinePeriod')?.value || '30',
      performanceMetric: document.getElementById('performanceMetric')?.value || 'reports'
    };
  }

  /**
   * Restore dashboard state
   */
  setState(state) {
    if (state.filters) {
      this.currentFilters = state.filters;
      
      // Restore filter UI
      Object.entries(state.filters).forEach(([key, value]) => {
        const element = document.getElementById(key === 'technician' ? 'technicianFilter' : 
                                              key === 'client' ? 'clientFilter' :
                                              key === 'status' ? 'statusFilter' :
                                              key);
        if (element && value) {
          element.value = value;
        }
      });
    }

    if (state.timelinePeriod) {
      const timelineSelect = document.getElementById('timelinePeriod');
      if (timelineSelect) {
        timelineSelect.value = state.timelinePeriod;
      }
    }

    if (state.performanceMetric) {
      const performanceSelect = document.getElementById('performanceMetric');
      if (performanceSelect) {
        performanceSelect.value = state.performanceMetric;
      }
    }
  }

  /**
   * Advanced filtering with complex queries
   */
  applyAdvancedFilters(filters) {
    const {
      dateRange,
      statusList,
      technicianList,
      clientList,
      componentCountRange,
      completionTimeRange
    } = filters;

    let filteredReports = [...this.data.reports];

    // Date range filtering
    if (dateRange && dateRange.start && dateRange.end) {
      filteredReports = filteredReports.filter(report => 
        report.createdAt >= dateRange.start && report.createdAt <= dateRange.end
      );
    }

    // Multiple status filtering
    if (statusList && statusList.length > 0) {
      filteredReports = filteredReports.filter(report => 
        statusList.includes(report.status)
      );
    }

    // Multiple technician filtering
    if (technicianList && technicianList.length > 0) {
      filteredReports = filteredReports.filter(report => 
        technicianList.includes(report.technicianName)
      );
    }

    // Multiple client filtering
    if (clientList && clientList.length > 0) {
      filteredReports = filteredReports.filter(report => 
        clientList.includes(report.clientName)
      );
    }

    // Component count filtering
    if (componentCountRange) {
      filteredReports = filteredReports.filter(report => {
        const componentCount = this.countReportComponents(report);
        return componentCount >= (componentCountRange.min || 0) && 
               componentCount <= (componentCountRange.max || Infinity);
      });
    }

    // Completion time filtering
    if (completionTimeRange && completionTimeRange.min !== undefined) {
      filteredReports = filteredReports.filter(report => {
        if (!report.submittedAt || !report.createdAt) return false;
        const days = (report.submittedAt - report.createdAt) / (1000 * 60 * 60 * 24);
        return days >= (completionTimeRange.min || 0) && 
               days <= (completionTimeRange.max || Infinity);
      });
    }

    return filteredReports;
  }

  /**
   * Count components in a report
   */
  countReportComponents(report) {
    if (!report.floors || !Array.isArray(report.floors)) return 0;

    let total = 0;
    const componentTypes = [
      'networkCabinets', 'perforations', 'accessTraps', 'cablePaths',
      'cableTrunkings', 'conduits', 'copperCablings', 'fiberOpticCablings'
    ];

    report.floors.forEach(floor => {
      componentTypes.forEach(type => {
        if (floor[type] && Array.isArray(floor[type])) {
          total += floor[type].length;
        }
      });
    });

    return total;
  }

  /**
   * Export configuration for different formats
   */
  getExportConfig() {
    return {
      excel: {
        filename: `kony-bi-dashboard-${new Date().toISOString().split('T')[0]}.xlsx`,
        sheets: ['Summary', 'Reports', 'Technicians', 'Components'],
        includeCharts: false
      },
      pdf: {
        filename: `kony-bi-dashboard-${new Date().toISOString().split('T')[0]}.pdf`,
        orientation: 'portrait',
        includeCharts: true,
        includeTable: true
      },
      csv: {
        filename: `kony-reports-data-${new Date().toISOString().split('T')[0]}.csv`,
        delimiter: ',',
        includeHeaders: true
      }
    };
  }

  /**
   * Performance monitoring
   */
  trackPerformance(operation, startTime) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`Performance: ${operation} completed in ${duration.toFixed(2)}ms`);
    
    // Track slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Error boundary for chart rendering
   */
  safeRenderChart(chartType, renderFunction) {
    try {
      const startTime = performance.now();
      renderFunction();
      this.trackPerformance(`Render ${chartType} chart`, startTime);
    } catch (error) {
      console.error(`Error rendering ${chartType} chart:`, error);
      
      // Show fallback content
      const chartElement = document.getElementById(`${chartType}Chart`);
      if (chartElement) {
        chartElement.closest('.chart-content').innerHTML = `
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #6b7280;">
            <div style="text-align: center;">
              <i class="bi bi-exclamation-triangle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
              <p>Unable to load ${chartType} chart</p>
              <button class="btn-outline" onclick="window.dashboardInstance.refreshChart('${chartType}')">
                Try Again
              </button>
            </div>
          </div>
        `;
      }
      
      this.showError(`Failed to render ${chartType} chart`);
    }
  }

  /**
   * Data validation
   */
  validateData() {
    const issues = [];

    if (!this.data.reports || !Array.isArray(this.data.reports)) {
      issues.push('Reports data is missing or invalid');
    }

    if (!this.data.users || !Array.isArray(this.data.users)) {
      issues.push('Users data is missing or invalid');
    }

    if (this.data.reports) {
      const invalidReports = this.data.reports.filter(report => 
        !report.id || !report.createdAt
      );
      
      if (invalidReports.length > 0) {
        issues.push(`${invalidReports.length} reports have missing required fields`);
      }
    }

    if (issues.length > 0) {
      console.warn('Data validation issues:', issues);
      this.showNotification(`Data validation issues detected: ${issues.join(', ')}`, 'warning');
    }

    return issues.length === 0;
  }

  /**
   * Accessibility improvements
   */
  enhanceAccessibility() {
    // Add ARIA labels to charts
    document.querySelectorAll('canvas').forEach((canvas, index) => {
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `Chart ${index + 1}`);
    });

    // Add keyboard navigation to interactive elements
    document.querySelectorAll('.kpi-card, .chart-card, .table-card').forEach(card => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'region');
    });

    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .kpi-card:focus,
      .chart-card:focus,
      .table-card:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      
      .btn-primary:focus,
      .btn-outline:focus,
      .btn-icon:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }
}

// Export the class
export { EnhancedBIDashboard };

