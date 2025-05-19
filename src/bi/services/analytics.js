// src/bi/services/analytics.js
import { db } from '../../firebase/config.js';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

/**
 * Fetches and processes analytics data for the BI dashboard
 * @param {Object} filters - Optional filters to apply
 * @param {boolean} forceRefresh - Whether to force a data refresh
 * @returns {Object} - Processed analytics data
 */
export async function getBusinessAnalytics(filters = {}, forceRefresh = false) {
  try {
    // Fetch reports data
    const reports = await fetchReportData(filters);
    
    // Fetch users data
    const users = await fetchUserData();
    
    // Process and structure analytics data
    const analytics = processAnalyticsData(reports, users);
    
    return analytics;
  } catch (error) {
    console.error('Error fetching business analytics:', error);
    throw error;
  }
}

/**
 * Fetch report data from Firestore with optional filters
 * @param {Object} filters - Filters to apply
 * @returns {Array} - Array of report objects
 */
async function fetchReportData(filters = {}) {
  try {
    const reportsRef = collection(db, 'technical_visit_reports');
    let q = reportsRef;
    
    // Apply filters if provided
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }
    
    if (filters.startDate && filters.endDate) {
      q = query(q, 
        where('createdAt', '>=', filters.startDate),
        where('createdAt', '<=', filters.endDate)
      );
    }
    
    if (filters.technician) {
      q = query(q, where('technicianName', '==', filters.technician));
    }
    
    if (filters.client) {
      q = query(q, where('clientName', '==', filters.client));
    }
    
    // Apply sorting
    q = query(q, orderBy('createdAt', 'desc'));
    
    // Execute query
    const snapshot = await getDocs(q);
    
    // Process results
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert timestamps to dates
        createdAt: data.createdAt?.toDate() || new Date(),
        submittedAt: data.submittedAt?.toDate() || null,
        lastModified: data.lastModified?.toDate() || null
      };
    });
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error;
  }
}

/**
 * Fetch user data from Firestore
 * @returns {Array} - Array of user objects
 */
async function fetchUserData() {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Get filtered analytics data
 * @param {Object} filters - Filters to apply
 * @returns {Object} - Filtered analytics data
 */
export async function getFilteredAnalytics(filters = {}) {
  return await getBusinessAnalytics(filters, true);
}

/**
 * Process and structure analytics data
 * @param {Array} reports - Report data
 * @param {Array} users - User data
 * @returns {Object} - Structured analytics data
 */
function processAnalyticsData(reports, users) {
  // Calculate reports by status
  const reportsByStatus = countByStatus(reports);
  
  // Group reports by technician
  const reportsByTechnician = groupByTechnician(reports);
  
  // Calculate component statistics
  const componentStats = calculateComponentStatistics(reports);
  
  // Calculate technician performance
  const technicianPerformance = calculateTechnicianPerformance(reports, reportsByTechnician);
  
  // Calculate KPIs
  const kpis = calculateKPIs(reports, users, componentStats);
  
  // Generate time series data
  const timeSeries = getReportsTimeSeries(reports, 'month');
  
  return {
    kpis,
    reportsByStatus,
    reportsByTechnician,
    componentStats,
    technicianPerformance,
    timeSeries
  };
}

/**
 * Count reports by status
 * @param {Array} reports - Report data
 * @returns {Object} - Count by status
 */
function countByStatus(reports) {
  const statusCounts = {
    draft: 0,
    submitted: 0,
    reviewed: 0,
    approved: 0
  };
  
  reports.forEach(report => {
    if (report.status && statusCounts.hasOwnProperty(report.status)) {
      statusCounts[report.status]++;
    }
  });
  
  return statusCounts;
}

/**
 * Group reports by technician
 * @param {Array} reports - Report data
 * @returns {Object} - Reports grouped by technician
 */
function groupByTechnician(reports) {
  const result = {};
  
  reports.forEach(report => {
    if (report.technicianName) {
      if (!result[report.technicianName]) {
        result[report.technicianName] = [];
      }
      
      result[report.technicianName].push(report);
    }
  });
  
  return result;
}

/**
 * Calculate component statistics from reports
 * @param {Array} reports - Report data
 * @returns {Object} - Component statistics
 */
function calculateComponentStatistics(reports) {
  // Component type mapping for display names
  const componentTypeMap = {
    networkCabinets: 'Network Cabinets',
    perforations: 'Perforations',
    accessTraps: 'Access Traps',
    cablePaths: 'Cable Paths',
    cableTrunkings: 'Cable Trunkings',
    conduits: 'Conduits',
    copperCablings: 'Copper Cablings',
    fiberOpticCablings: 'Fiber Optic Cablings'
  };
  
  // Initialize counters
  const types = {};
  Object.entries(componentTypeMap).forEach(([key, name]) => {
    types[key] = { count: 0, name };
  });
  
  let total = 0;
  
  // Count components by type
  reports.forEach(report => {
    if (!report.floors) return;
    
    report.floors.forEach(floor => {
      Object.keys(componentTypeMap).forEach(type => {
        if (floor[type] && Array.isArray(floor[type])) {
          types[type].count += floor[type].length;
          total += floor[type].length;
        }
      });
    });
  });
  
  return {
    types,
    total,
    byReport: reports.length > 0 ? (total / reports.length).toFixed(2) : 0
  };
}

/**
 * Calculate technician performance metrics
 * @param {Array} reports - Report data
 * @param {Object} reportsByTechnician - Reports grouped by technician
 * @returns {Object} - Technician performance metrics
 */
function calculateTechnicianPerformance(reports, reportsByTechnician) {
  const result = {};
  
  Object.entries(reportsByTechnician).forEach(([techName, techReports]) => {
    if (!techName) return;
    
    const submittedReports = techReports.filter(r => r.submittedAt);
    let avgCompletionDays = 0;
    
    if (submittedReports.length > 0) {
      const totalDays = submittedReports.reduce((sum, r) => {
        const days = (r.submittedAt - r.createdAt) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      
      avgCompletionDays = Math.round((totalDays / submittedReports.length) * 10) / 10;
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
    
    result[techName] = {
      totalReports: techReports.length,
      statusCounts,
      avgCompletionDays,
      componentsDocumented: componentCount,
      avgComponentsPerReport: techReports.length > 0 ? 
        Math.round((componentCount / techReports.length) * 10) / 10 : 0,
      mostRecentReport: techReports.reduce((latest, r) => 
        !latest || r.createdAt > latest.createdAt ? r : latest, null)
    };
  });
  
  return result;
}

/**
 * Calculate key performance indicators
 * @param {Array} reports - Report data
 * @param {Array} users - User data
 * @param {Object} componentStats - Component statistics
 * @returns {Object} - KPI data
 */
function calculateKPIs(reports, users, componentStats) {
  // Basic counts
  const totalReports = reports.length;
  const totalSubmitted = reports.filter(r => r.status === 'submitted').length;
  const totalReviewed = reports.filter(r => r.status === 'reviewed').length;
  const totalApproved = reports.filter(r => r.status === 'approved').length;
  const totalTechnicians = users.filter(u => u.role === 'technician').length;
  
  // Calculate average completion time
  const completedReports = reports.filter(r => r.submittedAt);
  let avgCompletionTime = 0;
  
  if (completedReports.length > 0) {
    const totalDays = completedReports.reduce((sum, report) => {
      const days = (report.submittedAt - report.createdAt) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    
    avgCompletionTime = Math.round((totalDays / completedReports.length) * 10) / 10;
  }
  
  // Find most active client
  const clientCounts = {};
  reports.forEach(report => {
    if (report.clientName) {
      clientCounts[report.clientName] = (clientCounts[report.clientName] || 0) + 1;
    }
  });
  
  let mostActiveClient = '';
  let maxClientReports = 0;
  
  Object.entries(clientCounts).forEach(([client, count]) => {
    if (count > maxClientReports) {
      mostActiveClient = client;
      maxClientReports = count;
    }
  });
  
  // Find most active technician
  const techCounts = {};
  reports.forEach(report => {
    if (report.technicianName) {
      techCounts[report.technicianName] = (techCounts[report.technicianName] || 0) + 1;
    }
  });
  
  let mostActiveTechnician = '';
  let maxTechReports = 0;
  
  Object.entries(techCounts).forEach(([tech, count]) => {
    if (count > maxTechReports) {
      mostActiveTechnician = tech;
      maxTechReports = count;
    }
  });
  
  // Get average components per report
  const avgComponentsPerReport = reports.length > 0 ? 
    Math.round((componentStats.total / reports.length) * 10) / 10 : 0;
  
  return {
    totalReports,
    totalSubmitted,
    totalReviewed,
    totalApproved,
    avgCompletionTime,
    avgComponentsPerReport,
    totalComponents: componentStats.total,
    totalTechnicians,
    mostActiveClient,
    mostActiveTechnician
  };
}

/**
 * Generate time series data for reports
 * @param {Array} reports - Report data
 * @param {string} interval - Time interval ('day', 'week', 'month')
 * @returns {Object} - Time series data
 */
function getReportsTimeSeries(reports, interval = 'month') {
  const now = new Date();
  const timeSeriesData = {
    labels: [],
    created: [],
    submitted: []
  };
  
  // Group data by interval
  if (interval === 'month') {
    // Monthly data (last 6 months)
    const monthData = groupReportsByMonth(reports, 6);
    timeSeriesData.labels = monthData.labels;
    timeSeriesData.created = monthData.created;
    timeSeriesData.submitted = monthData.submitted;
  } else if (interval === 'week') {
    // Weekly data (last 12 weeks)
    const weekData = groupReportsByWeek(reports, 12);
    timeSeriesData.labels = weekData.labels;
    timeSeriesData.created = weekData.created;
    timeSeriesData.submitted = weekData.submitted;
  } else {
    // Daily data (last 30 days)
    const dayData = groupReportsByDay(reports, 30);
    timeSeriesData.labels = dayData.labels;
    timeSeriesData.created = dayData.created;
    timeSeriesData.submitted = dayData.submitted;
  }
  
  return timeSeriesData;
}

/**
 * Group reports by month
 * @param {Array} reports - Report data
 * @param {number} months - Number of months
 * @returns {Object} - Grouped data
 */
function groupReportsByMonth(reports, months) {
  const result = {
    labels: [],
    created: [],
    submitted: []
  };
  
  // Generate month labels
  const today = new Date();
  const monthLabels = [];
  const createdCounts = {};
  const submittedCounts = {};
  
  for (let i = 0; i < months; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString('default', { month: 'short', year: 'numeric' });
    const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
    
    monthLabels.unshift(monthLabel);
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
  
  // Build result arrays
  result.labels = monthLabels;
  
  // Extract data in the same order as labels
  for (let i = 0; i < months; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() - months + i + 1, 1);
    const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
    
    result.created.push(createdCounts[monthKey] || 0);
    result.submitted.push(submittedCounts[monthKey] || 0);
  }
  
  return result;
}

/**
 * Group reports by week
 * @param {Array} reports - Report data
 * @param {number} weeks - Number of weeks
 * @returns {Object} - Grouped data
 */
function groupReportsByWeek(reports, weeks) {
  const result = {
    labels: [],
    created: [],
    submitted: []
  };
  
  // Helper function to get week number
  const getWeekNumber = (d) => {
    const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
    const pastDaysOfYear = (d - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };
  
  // Generate week labels
  const today = new Date();
  const weekLabels = [];
  const createdCounts = {};
  const submittedCounts = {};
  
  for (let i = 0; i < weeks; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (i * 7));
    
    const weekNum = getWeekNumber(d);
    const weekLabel = `W${weekNum}`;
    const weekKey = `${d.getFullYear()}-W${weekNum}`;
    
    weekLabels.unshift(weekLabel);
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
  
  // Build result arrays
  result.labels = weekLabels;
  
  // Extract data in the same order as labels
  for (let i = 0; i < weeks; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - ((weeks - i - 1) * 7));
    
    const weekNum = getWeekNumber(d);
    const weekKey = `${d.getFullYear()}-W${weekNum}`;
    
    result.created.push(createdCounts[weekKey] || 0);
    result.submitted.push(submittedCounts[weekKey] || 0);
  }
  
  return result;
}

/**
 * Group reports by day
 * @param {Array} reports - Report data
 * @param {number} days - Number of days
 * @returns {Object} - Grouped data
 */
function groupReportsByDay(reports, days) {
  const result = {
    labels: [],
    created: [],
    submitted: []
  };
  
  // Generate day labels
  const today = new Date();
  const dayLabels = [];
  const createdCounts = {};
  const submittedCounts = {};
  
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // Format as YYYY-MM-DD
    const dayStr = d.toISOString().split('T')[0];
    // Format as short date for label
    const dayLabel = d.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    
    dayLabels.unshift(dayLabel);
    createdCounts[dayStr] = 0;
    submittedCounts[dayStr] = 0;
  }
  
  // Count reports by day
  reports.forEach(report => {
    const createdDate = report.createdAt;
    const createdStr = createdDate.toISOString().split('T')[0];
    
    if (createdCounts.hasOwnProperty(createdStr)) {
      createdCounts[createdStr]++;
    }
    
    if (report.submittedAt) {
      const submittedDate = report.submittedAt;
      const submittedStr = submittedDate.toISOString().split('T')[0];
      
      if (submittedCounts.hasOwnProperty(submittedStr)) {
        submittedCounts[submittedStr]++;
      }
    }
  });
  
  // Build result arrays
  result.labels = dayLabels;
  
  // Extract data in the same order as labels
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - i - 1));
    const dayStr = d.toISOString().split('T')[0];
    
    result.created.push(createdCounts[dayStr] || 0);
    result.submitted.push(submittedCounts[dayStr] || 0);
  }
  
  return result;
}