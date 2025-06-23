import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';

/**
 * Get reports by status
 */
export async function getReportsByStatus(status) {
  try {
    console.log(`Getting reports with status: ${status}`);
    const reportsRef = collection(db, 'technical_visit_reports');
    let q;
    
    if (status === 'all') {
      q = query(reportsRef);
    } else {
      q = query(reportsRef, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} reports`);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting reports:", error);
    throw error;
  }
}

/**
 * Get a single report by ID
 */
export async function getReportById(reportId) {
  try {
    console.log(`Getting report with ID: ${reportId}`);
    const docRef = doc(db, 'technical_visit_reports', reportId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('Report found');
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      console.log('Report not found');
      throw new Error('Report not found');
    }
  } catch (error) {
    console.error("Error getting report:", error);
    throw error;
  }
}

/**
 * Update report status
 */
export async function updateReportStatus(reportId, newStatus) {
  try {
    console.log(`Updating report ${reportId} to status: ${newStatus}`);
    await updateDoc(doc(db, 'technical_visit_reports', reportId), {
      status: newStatus,
      lastModified: new Date().toISOString()
    });
    console.log('Report status updated successfully');
    return true;
  } catch (error) {
    console.error("Error updating report status:", error);
    throw error;
  }
}

/**
 * Delete report
 */
export async function deleteReport(reportId) {
  try {
    console.log(`Deleting report with ID: ${reportId}`);
    await deleteDoc(doc(db, 'technical_visit_reports', reportId));
    console.log('Report deleted successfully');
    return true;
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
}

/**
 * Get all users
 */
export async function getUsers() {
  try {
    console.log('Getting all users');
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    console.log(`Found ${querySnapshot.docs.length} users`);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
}

/**
 * Update user
 */
export async function updateUser(authUid, userData) {
  try {
    console.log(`Updating user with authUid: ${authUid}`);
    await updateDoc(doc(db, 'users', authUid), {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      updatedAt: new Date().toISOString()
    });
    console.log('User updated successfully');
    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * Delete user
 */
export async function deleteUser(authUid) {
  try {
    console.log(`Deleting user with authUid: ${authUid}`);
    await deleteDoc(doc(db, 'users', authUid));
    console.log('User deleted successfully');
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}// src/utils/api-enhanced.js - Enhanced API with Reject Functionality and Better Error Handling
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

/**
 * Get reports by status with enhanced filtering
 */
export async function getReportsByStatus(status = '') {
  try {
    console.log(`Récupération des rapports avec le statut: ${status || 'tous'}`);
    
    const reportsRef = collection(db, 'technical_visit_reports');
    let q;
    
    if (!status || status === 'all') {
      // Get all reports, ordered by most recent
      q = query(
        reportsRef, 
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get reports with specific status
      q = query(
        reportsRef, 
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    console.log(`Trouvé ${querySnapshot.docs.length} rapports`);
    
    const reports = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to JavaScript dates
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || data.date),
        submittedAt: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
        lastModified: data.lastModified?.toDate?.() || (data.lastModified ? new Date(data.lastModified) : null)
      };
    });
    
    return reports;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des rapports:", error);
    throw new Error(`Impossible de charger les rapports: ${error.message}`);
  }
}

/**
 * Get a single report by ID with full details
 */
export async function getReportById(reportId) {
  try {
    console.log(`Récupération du rapport ID: ${reportId}`);
    
    if (!reportId) {
      throw new Error('ID du rapport requis');
    }
    
    const docRef = doc(db, 'technical_visit_reports', reportId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('Rapport trouvé');
      const data = docSnap.data();
      
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || data.date),
        submittedAt: data.submittedAt?.toDate?.() || (data.submittedAt ? new Date(data.submittedAt) : null),
        lastModified: data.lastModified?.toDate?.() || (data.lastModified ? new Date(data.lastModified) : null)
      };
    } else {
      console.log('Rapport non trouvé');
      throw new Error('Rapport non trouvé');
    }
    
  } catch (error) {
    console.error("Erreur lors de la récupération du rapport:", error);
    throw new Error(`Impossible de charger le rapport: ${error.message}`);
  }
}

/**
 * Update report status with enhanced functionality for rejections
 */
export async function updateReportStatus(reportId, newStatus, additionalData = {}) {
  try {
    console.log(`Mise à jour du rapport ${reportId} vers le statut: ${newStatus}`);
    
    if (!reportId || !newStatus) {
      throw new Error('ID du rapport et nouveau statut requis');
    }
    
    // Validate status
    const validStatuses = ['submitted', 'reviewed', 'approved', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Statut invalide: ${newStatus}`);
    }
    
    // Prepare update data
    const updateData = {
      status: newStatus,
      lastModified: Timestamp.now(),
      ...additionalData
    };
    
    // Add status-specific fields
    switch (newStatus) {
      case 'reviewed':
        updateData.reviewedAt = Timestamp.now();
        break;
      case 'approved':
        updateData.approvedAt = Timestamp.now();
        break;
      case 'rejected':
        updateData.rejectedAt = Timestamp.now();
        if (!additionalData.rejectReason) {
          throw new Error('Motif de rejet requis pour rejeter un rapport');
        }
        break;
      case 'submitted':
        // When resubmitting a rejected report, clear rejection data
        updateData.rejectReason = null;
        updateData.rejectedAt = null;
        updateData.resubmittedAt = Timestamp.now();
        break;
    }
    
    // Update the document
    const docRef = doc(db, 'technical_visit_reports', reportId);
    await updateDoc(docRef, updateData);
    
    console.log('Statut du rapport mis à jour avec succès');
    
    // Log the status change for audit trail
    await logStatusChange(reportId, newStatus, additionalData);
    
    return true;
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    throw new Error(`Impossible de mettre à jour le statut: ${error.message}`);
  }
}

/**
 * Log status changes for audit trail
 */
async function logStatusChange(reportId, newStatus, additionalData) {
  try {
    const logData = {
      reportId,
      newStatus,
      timestamp: Timestamp.now(),
      ...additionalData
    };
    
    // You can implement this to log to a separate collection if needed
    console.log('Changement de statut enregistré:', logData);
    
  } catch (error) {
    console.warn('Erreur lors de l\'enregistrement du log:', error);
    // Don't throw error here as it's not critical
  }
}

/**
 * Reject a report with reason
 */
export async function rejectReport(reportId, rejectReason, rejectedBy = null) {
  try {
    console.log(`Rejet du rapport ${reportId}`);
    
    if (!rejectReason || rejectReason.trim().length < 10) {
      throw new Error('Le motif de rejet doit contenir au moins 10 caractères');
    }
    
    const additionalData = {
      rejectReason: rejectReason.trim(),
      rejectedBy: rejectedBy || 'system',
      rejectedAt: Timestamp.now()
    };
    
    return await updateReportStatus(reportId, 'rejected', additionalData);
    
  } catch (error) {
    console.error("Erreur lors du rejet du rapport:", error);
    throw error;
  }
}

/**
 * Approve a report
 */
export async function approveReport(reportId, approvedBy = null) {
  try {
    console.log(`Approbation du rapport ${reportId}`);
    
    const additionalData = {
      approvedBy: approvedBy || 'system',
      approvedAt: Timestamp.now()
    };
    
    return await updateReportStatus(reportId, 'approved', additionalData);
    
  } catch (error) {
    console.error("Erreur lors de l'approbation du rapport:", error);
    throw error;
  }
}

/**
 * Mark report as reviewed
 */
export async function markAsReviewed(reportId, reviewedBy = null) {
  try {
    console.log(`Marquage du rapport ${reportId} comme examiné`);
    
    const additionalData = {
      reviewedBy: reviewedBy || 'system',
      reviewedAt: Timestamp.now()
    };
    
    return await updateReportStatus(reportId, 'reviewed', additionalData);
    
  } catch (error) {
    console.error("Erreur lors du marquage comme examiné:", error);
    throw error;
  }
}

/**
 * Delete report with confirmation
 */
export async function deleteReport(reportId) {
  try {
    console.log(`Suppression du rapport ID: ${reportId}`);
    
    if (!reportId) {
      throw new Error('ID du rapport requis');
    }
    
    // Check if report exists first
    const reportDoc = await getReportById(reportId);
    if (!reportDoc) {
      throw new Error('Rapport non trouvé');
    }
    
    // Delete the document
    const docRef = doc(db, 'technical_visit_reports', reportId);
    await deleteDoc(docRef);
    
    console.log('Rapport supprimé avec succès');
    return true;
    
  } catch (error) {
    console.error("Erreur lors de la suppression du rapport:", error);
    throw new Error(`Impossible de supprimer le rapport: ${error.message}`);
  }
}

/**
 * Get all users with enhanced data
 */
export async function getUsers() {
  try {
    console.log('Récupération de tous les utilisateurs');
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('displayName', 'asc'));
    const querySnapshot = await getDocs(q);
    
    console.log(`Trouvé ${querySnapshot.docs.length} utilisateurs`);
    
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        lastLogin: data.lastLogin?.toDate?.() || (data.lastLogin ? new Date(data.lastLogin) : null)
      };
    });
    
    return users;
    
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw new Error(`Impossible de charger les utilisateurs: ${error.message}`);
  }
}

/**
 * Get reports by technician
 */
export async function getReportsByTechnician(technicianId) {
  try {
    console.log(`Récupération des rapports du technicien: ${technicianId}`);
    
    const reportsRef = collection(db, 'technical_visit_reports');
    const q = query(
      reportsRef, 
      where('technicianId', '==', technicianId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Trouvé ${querySnapshot.docs.length} rapports pour ce technicien`);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt),
      submittedAt: doc.data().submittedAt?.toDate?.() || (doc.data().submittedAt ? new Date(doc.data().submittedAt) : null)
    }));
    
  } catch (error) {
    console.error("Erreur lors de la récupération des rapports du technicien:", error);
    throw new Error(`Impossible de charger les rapports du technicien: ${error.message}`);
  }
}

/**
 * Get reports analytics data
 */
export async function getReportsAnalytics(dateRange = null) {
  try {
    console.log('Récupération des données analytiques des rapports');
    
    let q = query(collection(db, 'technical_visit_reports'));
    
    // Add date filter if provided
    if (dateRange && dateRange.start && dateRange.end) {
      q = query(
        collection(db, 'technical_visit_reports'),
        where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
        where('createdAt', '<=', Timestamp.fromDate(dateRange.end))
      );
    }
    
    const querySnapshot = await getDocs(q);
    const reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
    }));
    
    // Calculate analytics
    const totalReports = reports.length;
    const statusCounts = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});
    
    const technicianCounts = reports.reduce((acc, report) => {
      if (report.technicianId) {
        acc[report.technicianId] = (acc[report.technicianId] || 0) + 1;
      }
      return acc;
    }, {});
    
    const analytics = {
      totalReports,
      statusCounts,
      technicianCounts,
      averageReportsPerDay: calculateAverageReportsPerDay(reports),
      recentActivity: getRecentActivity(reports)
    };
    
    console.log('Données analytiques calculées:', analytics);
    return analytics;
    
  } catch (error) {
    console.error("Erreur lors du calcul des analyses:", error);
    throw new Error(`Impossible de calculer les analyses: ${error.message}`);
  }
}

/**
 * Calculate average reports per day
 */
function calculateAverageReportsPerDay(reports) {
  if (reports.length === 0) return 0;
  
  const dates = reports.map(r => r.createdAt);
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));
  const daysDiff = Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24)) || 1;
  
  return Math.round((reports.length / daysDiff) * 100) / 100;
}

/**
 * Get recent activity
 */
function getRecentActivity(reports) {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  
  return reports
    .filter(r => r.createdAt >= last7Days)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);
}

/**
 * Export reports data to CSV format
 */
export function exportReportsToCSV(reports) {
  try {
    console.log(`Export de ${reports.length} rapports vers CSV`);
    
    const headers = [
      'ID',
      'Client',
      'Lieu',
      'Technicien',
      'Statut',
      'Date de création',
      'Date de soumission',
      'Date d\'approbation',
      'Motif de rejet'
    ];
    
    const csvContent = [
      headers.join(','),
      ...reports.map(report => [
        `"${report.id}"`,
        `"${report.clientName || ''}"`,
        `"${report.location || ''}"`,
        `"${report.technicianName || ''}"`,
        `"${report.status || ''}"`,
        `"${report.createdAt ? report.createdAt.toLocaleDateString('fr-FR') : ''}"`,
        `"${report.submittedAt ? report.submittedAt.toLocaleDateString('fr-FR') : ''}"`,
        `"${report.approvedAt ? report.approvedAt.toLocaleDateString('fr-FR') : ''}"`,
        `"${report.rejectReason || ''}"`
      ].join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapports-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('Export CSV terminé');
    return true;
    
  } catch (error) {
    console.error("Erreur lors de l'export CSV:", error);
    throw new Error(`Impossible d'exporter les données: ${error.message}`);
  }
}

/**
 * Export reports data to PDF format
 */
export async function exportReportsToPDF(reports) {
  try {
    console.log(`Export de ${reports.length} rapports vers PDF`);
    
    // This would integrate with a PDF library like jsPDF
    // For now, we'll simulate the export
    
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Export PDF simulé terminé');
        resolve(true);
      }, 2000);
    });
    
  } catch (error) {
    console.error("Erreur lors de l'export PDF:", error);
    throw new Error(`Impossible d'exporter le PDF: ${error.message}`);
  }
}

/**
 * Search reports with advanced filters
 */
export async function searchReports(searchCriteria) {
  try {
    console.log('Recherche de rapports avec critères:', searchCriteria);
    
    const { 
      searchTerm, 
      status, 
      technicianId, 
      startDate, 
      endDate,
      clientName,
      location 
    } = searchCriteria;
    
    let q = query(collection(db, 'technical_visit_reports'));
    
    // Apply filters
    const constraints = [];
    
    if (status && status !== 'all') {
      constraints.push(where('status', '==', status));
    }
    
    if (technicianId) {
      constraints.push(where('technicianId', '==', technicianId));
    }
    
    if (startDate) {
      constraints.push(where('createdAt', '>=', Timestamp.fromDate(startDate)));
    }
    
    if (endDate) {
      constraints.push(where('createdAt', '<=', Timestamp.fromDate(endDate)));
    }
    
    // Add constraints to query
    if (constraints.length > 0) {
      q = query(collection(db, 'technical_visit_reports'), ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    let reports = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
    }));
    
    // Apply client-side filters for text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      reports = reports.filter(report => 
        (report.clientName || '').toLowerCase().includes(term) ||
        (report.location || '').toLowerCase().includes(term) ||
        (report.technicianName || '').toLowerCase().includes(term) ||
        (report.description || '').toLowerCase().includes(term)
      );
    }
    
    if (clientName) {
      const client = clientName.toLowerCase();
      reports = reports.filter(report => 
        (report.clientName || '').toLowerCase().includes(client)
      );
    }
    
    if (location) {
      const loc = location.toLowerCase();
      reports = reports.filter(report => 
        (report.location || '').toLowerCase().includes(loc)
      );
    }
    
    console.log(`Trouvé ${reports.length} rapports correspondant aux critères`);
    return reports;
    
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    throw new Error(`Erreur de recherche: ${error.message}`);
  }
}

/**
 * Batch update multiple reports
 */
export async function batchUpdateReports(reportIds, updateData) {
  try {
    console.log(`Mise à jour en lot de ${reportIds.length} rapports`);
    
    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      throw new Error('Liste des IDs de rapports requise');
    }
    
    const updatePromises = reportIds.map(reportId => {
      const docRef = doc(db, 'technical_visit_reports', reportId);
      return updateDoc(docRef, {
        ...updateData,
        lastModified: Timestamp.now()
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log('Mise à jour en lot terminée avec succès');
    return true;
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour en lot:", error);
    throw new Error(`Impossible de mettre à jour en lot: ${error.message}`);
  }
}

/**
 * Get report statistics for dashboard
 */
export async function getReportStatistics() {
  try {
    console.log('Calcul des statistiques des rapports');
    
    const reports = await getReportsByStatus();
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    
    const stats = {
      total: reports.length,
      thisMonth: reports.filter(r => r.createdAt >= startOfMonth).length,
      thisWeek: reports.filter(r => r.createdAt >= startOfWeek).length,
      byStatus: {
        submitted: reports.filter(r => r.status === 'submitted').length,
        reviewed: reports.filter(r => r.status === 'reviewed').length,
        approved: reports.filter(r => r.status === 'approved').length,
        rejected: reports.filter(r => r.status === 'rejected').length
      },
      averageProcessingTime: calculateAverageProcessingTime(reports),
      topTechnicians: getTopTechnicians(reports)
    };
    
    console.log('Statistiques calculées:', stats);
    return stats;
    
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques:", error);
    throw new Error(`Impossible de calculer les statistiques: ${error.message}`);
  }
}

/**
 * Calculate average processing time for reports
 */
function calculateAverageProcessingTime(reports) {
  const approvedReports = reports.filter(r => 
    r.status === 'approved' && r.submittedAt && r.approvedAt
  );
  
  if (approvedReports.length === 0) return 0;
  
  const totalTime = approvedReports.reduce((sum, report) => {
    const processingTime = new Date(report.approvedAt) - new Date(report.submittedAt);
    return sum + processingTime;
  }, 0);
  
  // Return average time in hours
  return Math.round((totalTime / approvedReports.length) / (1000 * 60 * 60) * 10) / 10;
}

/**
 * Get top performing technicians
 */
function getTopTechnicians(reports) {
  const technicianStats = reports.reduce((acc, report) => {
    if (report.technicianId && report.technicianName) {
      if (!acc[report.technicianId]) {
        acc[report.technicianId] = {
          id: report.technicianId,
          name: report.technicianName,
          totalReports: 0,
          approvedReports: 0
        };
      }
      
      acc[report.technicianId].totalReports++;
      if (report.status === 'approved') {
        acc[report.technicianId].approvedReports++;
      }
    }
    return acc;
  }, {});
  
  return Object.values(technicianStats)
    .map(tech => ({
      ...tech,
      approvalRate: tech.totalReports > 0 ? 
        Math.round((tech.approvedReports / tech.totalReports) * 100) : 0
    }))
    .sort((a, b) => b.approvalRate - a.approvalRate)
    .slice(0, 5);
}

/**
 * Validate report data before operations
 */
export function validateReportData(reportData) {
  const errors = [];
  
  if (!reportData) {
    errors.push('Données du rapport manquantes');
    return { isValid: false, errors };
  }
  
  // Required fields validation
  if (!reportData.clientName || reportData.clientName.trim().length === 0) {
    errors.push('Nom du client requis');
  }
  
  if (!reportData.location || reportData.location.trim().length === 0) {
    errors.push('Lieu requis');
  }
  
  if (!reportData.technicianId) {
    errors.push('Technicien requis');
  }
  
  // Status validation
  const validStatuses = ['draft', 'submitted', 'reviewed', 'approved', 'rejected'];
  if (reportData.status && !validStatuses.includes(reportData.status)) {
    errors.push('Statut invalide');
  }
  
  // Date validation
  if (reportData.date && isNaN(new Date(reportData.date).getTime())) {
    errors.push('Date invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize report data
 */
export function sanitizeReportData(reportData) {
  if (!reportData) return null;
  
  return {
    ...reportData,
    clientName: reportData.clientName?.trim(),
    location: reportData.location?.trim(),
    description: reportData.description?.trim(),
    projectContext: reportData.projectContext?.trim(),
    rejectReason: reportData.rejectReason?.trim()
  };
}

/**
 * Handle API errors consistently
 */
export function handleAPIError(error, operation = 'opération') {
  console.error(`Erreur lors de ${operation}:`, error);
  
  // Handle specific Firebase errors
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        throw new Error('Permissions insuffisantes pour cette opération');
      case 'not-found':
        throw new Error('Ressource non trouvée');
      case 'unavailable':
        throw new Error('Service temporairement indisponible');
      case 'deadline-exceeded':
        throw new Error('Opération expirée, veuillez réessayer');
      default:
        throw new Error(`Erreur système: ${error.message}`);
    }
  }
  
  // Handle network errors
  if (error.message?.includes('network')) {
    throw new Error('Erreur de connexion réseau');
  }
  
  // Default error handling
  throw new Error(error.message || `Erreur lors de ${operation}`);
}

// Export all functions
export {
  // Basic CRUD operations
  getReportsByStatus,
  getReportById,
  updateReportStatus,
  deleteReport,
  
  // Enhanced status operations
  rejectReport,
  approveReport,
  markAsReviewed,
  
  // User operations
  getUsers,
  getReportsByTechnician,
  
  // Analytics and reporting
  getReportsAnalytics,
  getReportStatistics,
  
  // Export functions
  exportReportsToCSV,
  exportReportsToPDF,
  
  // Search and filtering
  searchReports,
  
  // Batch operations
  batchUpdateReports,
  
  // Utility functions
  validateReportData,
  sanitizeReportData,
  handleAPIError
};