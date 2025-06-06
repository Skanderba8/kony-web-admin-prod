// src/bi/services/data-processing.js - Fixed version
import { db } from '../../firebase/config.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// Main data fetching function
export async function fetchReportData(filters = {}) {
  try {
    console.log('Fetching report data...');
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
    
    // Apply sorting
    q = query(q, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const reports = snapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        // Convert timestamps to dates safely
        createdAt: convertTimestamp(data.createdAt),
        submittedAt: convertTimestamp(data.submittedAt),
        lastModified: convertTimestamp(data.lastModified),
        date: data.date || (data.createdAt ? convertTimestamp(data.createdAt).toISOString().split('T')[0] : null)
      };
    });
    
    console.log(`Fetched ${reports.length} reports`);
    return reports;
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw error;
  }
}

// Fetch user data
export async function fetchUserData() {
  try {
    console.log('Fetching user data...');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Fetched ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

/**
 * Safely convert Firestore timestamp to JavaScript Date
 * @param {any} timestamp - The timestamp from Firestore
 * @returns {Date|null} - JavaScript Date object or null
 */
function convertTimestamp(timestamp) {
  if (!timestamp) {
    return null;
  }
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it's a Firestore Timestamp with toDate method
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's a string that can be parsed as a date
  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // If it's a number (Unix timestamp)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // If it's an object with seconds and nanoseconds (Firestore timestamp format)
  if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
  }
  
  console.warn('Unknown timestamp format:', timestamp);
  return null;
}

// Data transformation functions
export function calculateReportsByStatus(reports) {
  const statusCounts = {
    draft: 0,
    submitted: 0,
    reviewed: 0,
    approved: 0
  };
  
  reports.forEach(report => {
    const status = report.status || 'draft';
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }
  });
  
  return statusCounts;
}

export function calculateReportsByTechnician(reports) {
  const result = {};
  
  reports.forEach(report => {
    const techName = report.technicianName || 'Unassigned';
    if (!result[techName]) {
      result[techName] = [];
    }
    result[techName].push(report);
  });
  
  return result;
}

export function calculateReportTimelines(reports) {
  const submittedReports = reports.filter(r => r.submittedAt && r.createdAt);
  
  return submittedReports.map(report => {
    const creationToSubmission = report.submittedAt.getTime() - report.createdAt.getTime();
    const daysToSubmit = Math.round(creationToSubmission / (1000 * 60 * 60 * 24));
    
    return {
      id: report.id,
      technicianName: report.technicianName || 'Unknown',
      clientName: report.clientName || 'Unknown',
      daysToSubmit: Math.max(0, daysToSubmit), // Ensure non-negative
      createdAt: report.createdAt
    };
  });
}

export function calculateComponentStatistics(reports) {
  // Extract all floor components across reports
  const allComponents = {
    networkCabinets: [],
    perforations: [],
    accessTraps: [],
    cablePaths: [],
    cableTrunkings: [],
    conduits: [],
    copperCablings: [],
    fiberOpticCablings: []
  };
  
  reports.forEach(report => {
    if (!report.floors || !Array.isArray(report.floors)) {
      return;
    }
    
    report.floors.forEach(floor => {
      // Collect components by type
      Object.keys(allComponents).forEach(componentType => {
        if (floor[componentType] && Array.isArray(floor[componentType])) {
          allComponents[componentType].push(...floor[componentType].map(comp => ({
            ...comp,
            floorName: floor.name || 'Unknown Floor',
            reportId: report.id,
            clientName: report.clientName || 'Unknown Client'
          })));
        }
      });
    });
  });
  
  return allComponents;
}

// Calculate KPIs
export function calculateKPIs(reports, users) {
  const kpis = {
    totalReports: reports.length,
    totalSubmitted: reports.filter(r => r.status === 'submitted').length,
    totalReviewed: reports.filter(r => r.status === 'reviewed').length,
    totalApproved: reports.filter(r => r.status === 'approved').length,
    avgCompletionTime: 0,
    avgComponentsPerReport: 0,
    totalTechnicians: users.filter(u => u.role === 'technician').length,
    mostActiveClient: '',
    mostActiveTechnician: ''
  };
  
  // Calculate average completion time
  const completedReports = reports.filter(r => r.submittedAt && r.createdAt);
  if (completedReports.length > 0) {
    const totalDays = completedReports.reduce((sum, report) => {
      const days = (report.submittedAt.getTime() - report.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return sum + Math.max(0, days);
    }, 0);
    kpis.avgCompletionTime = Math.round((totalDays / completedReports.length) * 10) / 10;
  }
  
  // Calculate components per report
  let totalComponents = 0;
  reports.forEach(report => {
    if (!report.floors || !Array.isArray(report.floors)) {
      return;
    }
    
    report.floors.forEach(floor => {
      const componentTypes = [
        'networkCabinets', 'perforations', 'accessTraps', 'cablePaths',
        'cableTrunkings', 'conduits', 'copperCablings', 'fiberOpticCablings'
      ];
      
      componentTypes.forEach(type => {
        if (floor[type] && Array.isArray(floor[type])) {
          totalComponents += floor[type].length;
        }
      });
    });
  });
  
  if (reports.length > 0) {
    kpis.avgComponentsPerReport = Math.round((totalComponents / reports.length) * 10) / 10;
  }
  
  // Find most active client
  const clientCounts = {};
  reports.forEach(report => {
    const client = report.clientName;
    if (client) {
      clientCounts[client] = (clientCounts[client] || 0) + 1;
    }
  });
  
  let maxClientCount = 0;
  Object.entries(clientCounts).forEach(([client, count]) => {
    if (count > maxClientCount) {
      maxClientCount = count;
      kpis.mostActiveClient = client;
    }
  });
  
  // Find most active technician
  const technicianCounts = {};
  reports.forEach(report => {
    const tech = report.technicianName;
    if (tech) {
      technicianCounts[tech] = (technicianCounts[tech] || 0) + 1;
    }
  });
  
  let maxTechCount = 0;
  Object.entries(technicianCounts).forEach(([tech, count]) => {
    if (count > maxTechCount) {
      maxTechCount = count;
      kpis.mostActiveTechnician = tech;
    }
  });
  
  return kpis;
}

// Time-series data for reports creation/submission
export function getReportsTimeSeries(reports, interval = 'month') {
  // Sort reports by creation date
  const sortedReports = [...reports].filter(r => r.createdAt).sort((a, b) => a.createdAt - b.createdAt);
  
  if (interval === 'day') {
    return getReportsTimeSeriesDaily(sortedReports, 30);
  } else if (interval === 'week') {
    return getReportsTimeSeriesWeekly(sortedReports, 12);
  } else {
    return getReportsTimeSeriesMonthly(sortedReports, 6);
  }
}

function getReportsTimeSeriesDaily(reports, days) {
  const result = {
    created: [],
    submitted: []
  };
  
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    
    const createdCount = reports.filter(r => {
      const reportDate = r.createdAt.toISOString().split('T')[0];
      return reportDate === dateKey;
    }).length;
    
    const submittedCount = reports.filter(r => {
      if (!r.submittedAt) return false;
      const submittedDate = r.submittedAt.toISOString().split('T')[0];
      return submittedDate === dateKey;
    }).length;
    
    result.created.push({ date: dateKey, count: createdCount });
    result.submitted.push({ date: dateKey, count: submittedCount });
  }
  
  return result;
}

function getReportsTimeSeriesWeekly(reports, weeks) {
  const result = {
    created: [],
    submitted: []
  };
  
  const today = new Date();
  
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekKey = `W${Math.ceil((weekStart.getDate()) / 7)}`;
    
    const createdCount = reports.filter(r => {
      return r.createdAt >= weekStart && r.createdAt <= weekEnd;
    }).length;
    
    const submittedCount = reports.filter(r => {
      if (!r.submittedAt) return false;
      return r.submittedAt >= weekStart && r.submittedAt <= weekEnd;
    }).length;
    
    result.created.push({ date: weekKey, count: createdCount });
    result.submitted.push({ date: weekKey, count: submittedCount });
  }
  
  return result;
}

function getReportsTimeSeriesMonthly(reports, months) {
  const result = {
    created: [],
    submitted: []
  };
  
  const today = new Date();
  
  for (let i = months - 1; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
    
    const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    
    const createdCount = reports.filter(r => {
      return r.createdAt >= month && r.createdAt < nextMonth;
    }).length;
    
    const submittedCount = reports.filter(r => {
      if (!r.submittedAt) return false;
      return r.submittedAt >= month && r.submittedAt < nextMonth;
    }).length;
    
    result.created.push({ date: monthKey, count: createdCount });
    result.submitted.push({ date: monthKey, count: submittedCount });
  }
  
  return result;
}