// src/components/reports.js
import { getReportsByStatus, updateReportStatus, deleteReport, getReportById } from '../utils/api.js';
import { generateReportPdf } from '../utils/pdf.js';

/**
 * Displays a modernized reports list
 * @param {HTMLElement} container - The container to render the reports in
 */
export async function showReportsList(container = document.getElementById('contentContainer')) {
  console.log('Showing modernized reports list');
  
  // Set page title
  const pageTitle = 'Technical Visit Reports';
  
  // Create reports interface
  container.innerHTML = `
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <h1 class="page-title">${pageTitle}</h1>
      <div class="page-actions">
        <button class="btn btn-primary" disabled>
          <i class="bi bi-plus-circle me-2"></i>New Report
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="card-body p-0">
        <ul class="nav nav-tabs nav-tabs-custom" id="reportTabs">
          <li class="nav-item">
            <a class="nav-link active" data-status="submitted" href="#">
              <i class="bi bi-inbox me-2"></i>Submitted
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-status="reviewed" href="#">
              <i class="bi bi-check-circle me-2"></i>Reviewed
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-status="approved" href="#">
              <i class="bi bi-trophy me-2"></i>Approved
            </a>
          </li>
        </ul>
        
        <div class="tab-content">
          <div id="reportsContainer" class="tab-pane active">
            <div class="loading-container py-5">
              <div class="spinner-container">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <p>Loading reports...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners for tabs
  document.querySelectorAll('#reportTabs .nav-link').forEach(tab => {
    tab.addEventListener('click', async (e) => {
      e.preventDefault();
      
      // Update active tab
      document.querySelectorAll('#reportTabs .nav-link').forEach(t => {
        t.classList.remove('active');
      });
      e.target.classList.add('active');
      
      // Load reports
      const status = e.target.getAttribute('data-status');
      await loadReports(status);
    });
  });
  
  // Load submitted reports by default
  await loadReports('submitted');
}

/**
 * Load reports by status with modern styling
 * @param {string} status - The status to filter by
 */
async function loadReports(status) {
  const reportsContainer = document.getElementById('reportsContainer');
  
  try {
    // Show loading state
    reportsContainer.innerHTML = `
      <div class="loading-container py-5">
        <div class="spinner-container">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <p>Loading ${getStatusLabel(status).toLowerCase()} reports...</p>
      </div>
    `;
    
    // Fetch reports
    const reports = await getReportsByStatus(status);
    
    if (reports.length === 0) {
      reportsContainer.innerHTML = `
        <div class="empty-state py-5">
          <div class="empty-state-icon">
            <i class="bi bi-clipboard-x"></i>
          </div>
          <h3>No ${getStatusLabel(status).toLowerCase()} reports</h3>
          <p class="text-muted">Reports will appear here when technicians submit them.</p>
        </div>
      `;
      return;
    }
    
    // Create modern card layout for reports
    reportsContainer.innerHTML = `
      <div class="reports-grid">
        ${reports.map(report => createReportCard(report, status)).join('')}
      </div>
    `;
    
    // Add event listeners for actions
    reports.forEach(report => {
      // PDF Download button
      document.querySelector(`.download-pdf-btn[data-id="${report.id}"]`)?.addEventListener('click', () => {
        downloadReportPdf(report.id);
      });
      
      // Status update buttons
      if (status === 'submitted') {
        document.querySelector(`.review-btn[data-id="${report.id}"]`)?.addEventListener('click', () => {
          updateStatus(report.id, 'reviewed');
        });
      }
      
      if (status === 'reviewed') {
        document.querySelector(`.approve-btn[data-id="${report.id}"]`)?.addEventListener('click', () => {
          updateStatus(report.id, 'approved');
        });
      }
      
      // Delete button
      document.querySelector(`.delete-btn[data-id="${report.id}"]`)?.addEventListener('click', () => {
        confirmDeleteReport(report.id);
      });
      
      // View details (expand/collapse)
      document.querySelector(`.report-card[data-id="${report.id}"] .card-header`)?.addEventListener('click', (e) => {
        // Ignore clicks on buttons
        if (e.target.closest('button') || e.target.closest('a')) {
          return;
        }
        
        const card = document.querySelector(`.report-card[data-id="${report.id}"]`);
        card.classList.toggle('expanded');
        
        const expandIcon = card.querySelector('.expand-icon');
        if (card.classList.contains('expanded')) {
          expandIcon.innerHTML = '<i class="bi bi-chevron-up"></i>';
        } else {
          expandIcon.innerHTML = '<i class="bi bi-chevron-down"></i>';
        }
      });
    });
    
  } catch (error) {
    console.error('Error loading reports:', error);
    reportsContainer.innerHTML = `
      <div class="alert alert-danger m-3">
        <div class="d-flex align-items-center">
          <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
          <div>
            <h5 class="alert-heading">Error Loading Reports</h5>
            <p class="mb-0">${error.message}</p>
          </div>
        </div>
        <button class="btn btn-danger mt-3" onclick="loadReports('${status}')">
          <i class="bi bi-arrow-clockwise me-2"></i>Try Again
        </button>
      </div>
    `;
  }
}

/**
 * Get a user-friendly status label
 * @param {string} status - The status code
 * @returns {string} - The formatted status label
 */
function getStatusLabel(status) {
  switch(status) {
    case 'submitted': return 'Submitted';
    case 'reviewed': return 'Reviewed';
    case 'approved': return 'Approved';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Create a modern report card
 * @param {Object} report - The report data
 * @param {string} status - The current status filter
 * @returns {string} - The HTML for the report card
 */
function createReportCard(report, status) {
  const statusClasses = {
    submitted: 'primary',
    reviewed: 'info',
    approved: 'success'
  };
  
  const statusClass = statusClasses[report.status] || 'secondary';
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const formattedDate = new Date(report.date).toLocaleDateString('fr-FR', dateOptions);
  const submittedDate = report.submittedAt ? 
    new Date(report.submittedAt).toLocaleDateString('fr-FR', dateOptions) : 'N/A';
  
  return `
    <div class="report-card card" data-id="${report.id}">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <div class="report-icon">
              <i class="bi bi-file-earmark-text"></i>
            </div>
            <div>
              <h5 class="mb-0">${report.clientName || 'Unnamed Report'}</h5>
              <p class="text-muted mb-0">${report.location || 'Location not specified'}</p>
            </div>
          </div>
          <div class="d-flex align-items-center">
            <span class="badge bg-${statusClass} me-3">${getStatusLabel(report.status)}</span>
            <span class="expand-icon">
              <i class="bi bi-chevron-down"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="report-details">
          <div class="row g-3">
            <div class="col-md-6">
              <div class="detail-item">
                <span class="detail-label">
                  <i class="bi bi-calendar me-2"></i>Visit Date
                </span>
                <span class="detail-value">${formattedDate}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-item">
                <span class="detail-label">
                  <i class="bi bi-clock me-2"></i>Submitted
                </span>
                <span class="detail-value">${submittedDate}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-item">
                <span class="detail-label">
                  <i class="bi bi-person me-2"></i>Technician
                </span>
                <span class="detail-value">${report.technicianName || 'Not assigned'}</span>
              </div>
            </div>
            <div class="col-md-6">
              <div class="detail-item">
                <span class="detail-label">
                  <i class="bi bi-briefcase me-2"></i>Project Manager
                </span>
                <span class="detail-value">${report.projectManager || 'Not assigned'}</span>
              </div>
            </div>
          </div>
          
          ${report.projectContext ? `
            <div class="mt-3">
              <h6 class="detail-section-title">Project Context</h6>
              <p class="context-text">${report.projectContext}</p>
            </div>
          ` : ''}
          
          <div class="mt-3">
            <h6 class="detail-section-title">Report Details</h6>
            <div class="details-summary">
              <div class="row g-2">
                <div class="col-6 col-md-3">
                  <div class="summary-item">
                    <div class="summary-value">${report.floors?.length || 0}</div>
                    <div class="summary-label">Floors</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="summary-item">
                    <div class="summary-value">${report.estimatedDurationDays || 'N/A'}</div>
                    <div class="summary-label">Duration (days)</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="summary-item">
                    <div class="summary-value">${countComponents(report)}</div>
                    <div class="summary-label">Components</div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="summary-item">
                    <div class="summary-value">${report.assumptions?.length || 0}</div>
                    <div class="summary-label">Assumptions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons mt-4">
          <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${report.id}">
            <i class="bi bi-trash me-1"></i> Delete
          </button>
          
          <button class="btn btn-sm btn-outline-primary download-pdf-btn" data-id="${report.id}">
            <i class="bi bi-download me-1"></i> Download PDF
          </button>
          
          ${status === 'submitted' ? `
            <button class="btn btn-sm btn-outline-info review-btn" data-id="${report.id}">
              <i class="bi bi-check-circle me-1"></i> Mark as Reviewed
            </button>
          ` : ''}
          
          ${status === 'reviewed' ? `
            <button class="btn btn-sm btn-success approve-btn" data-id="${report.id}">
              <i class="bi bi-check2-all me-1"></i> Approve
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

/**
 * Count the total components in a report
 * @param {Object} report - The report object
 * @returns {number} - The total number of components
 */
function countComponents(report) {
  if (!report.floors) return 0;
  
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
 * Download a report as PDF with modern loading indicators
 * @param {string} reportId - The ID of the report to download
 */
async function downloadReportPdf(reportId) {
  try {
    // Create toast notification container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    // Create loading toast
    const loadingToastId = `loading-toast-${Date.now()}`;
    const loadingToast = document.createElement('div');
    loadingToast.className = 'toast show';
    loadingToast.id = loadingToastId;
    loadingToast.setAttribute('role', 'alert');
    loadingToast.setAttribute('aria-live', 'assertive');
    loadingToast.setAttribute('aria-atomic', 'true');
    
    loadingToast.innerHTML = `
      <div class="toast-header">
        <i class="bi bi-file-pdf me-2 text-primary"></i>
        <strong class="me-auto">Generating PDF</strong>
        <small>Just now</small>
      </div>
      <div class="toast-body">
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <span>Preparing your report, please wait...</span>
        </div>
      </div>
    `;
    
    toastContainer.appendChild(loadingToast);
    
    console.log('Starting PDF generation for report ID:', reportId);
    
    // Generate the PDF
    const pdfBlob = await generateReportPdf(reportId);
    console.log('PDF blob generated, size:', pdfBlob.size, 'bytes');
    
    // Create URL for the blob
    const pdfUrl = URL.createObjectURL(pdfBlob);
    console.log('PDF URL created for download');
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = `technical-visit-report-${reportId}.pdf`;
    
    // Add to DOM, trigger download, and clean up
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Remove loading toast
    document.getElementById(loadingToastId).remove();
    
    // Show success toast
    const successToast = document.createElement('div');
    successToast.className = 'toast show';
    successToast.setAttribute('role', 'alert');
    successToast.setAttribute('aria-live', 'assertive');
    successToast.setAttribute('aria-atomic', 'true');
    
    successToast.innerHTML = `
      <div class="toast-header bg-success text-white">
        <i class="bi bi-check-circle me-2"></i>
        <strong class="me-auto">Download Complete</strong>
        <small>Just now</small>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        <div class="d-flex align-items-center">
          <i class="bi bi-file-earmark-check fs-5 me-2 text-success"></i>
          <span>PDF has been generated and downloaded successfully.</span>
        </div>
      </div>
    `;
    
    toastContainer.appendChild(successToast);
    
    // Clean up URL object
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
      console.log('PDF URL revoked');
      
      // Auto-remove success toast after 5 seconds
      setTimeout(() => {
        successToast.remove();
      }, 5000);
    }, 1000);
    
  } catch (error) {
    console.error('Error generating or downloading PDF:', error);
    
    // Show error toast
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(toastContainer);
    }
    
    const errorToast = document.createElement('div');
    errorToast.className = 'toast show';
    errorToast.setAttribute('role', 'alert');
    errorToast.setAttribute('aria-live', 'assertive');
    errorToast.setAttribute('aria-atomic', 'true');
    
    errorToast.innerHTML = `
      <div class="toast-header bg-danger text-white">
        <i class="bi bi-exclamation-triangle me-2"></i>
        <strong class="me-auto">Download Failed</strong>
        <small>Just now</small>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        <div class="d-flex align-items-start">
          <i class="bi bi-x-circle fs-5 me-2 text-danger"></i>
          <div>
            <p class="mb-1">Error generating PDF:</p>
            <p class="text-danger mb-0">${error.message}</p>
          </div>
        </div>
        <button class="btn btn-sm btn-outline-danger mt-2" onclick="downloadReportPdf('${reportId}')">
          <i class="bi bi-arrow-clockwise me-1"></i> Try Again
        </button>
      </div>
    `;
    
    toastContainer.appendChild(errorToast);
    
    // Auto-remove error toast after 8 seconds
    setTimeout(() => {
      errorToast.remove();
    }, 8000);
  }
}

/**
 * Update report status with modern confirmation
 * @param {string} reportId - The ID of the report
 * @param {string} newStatus - The new status to set
 */
async function updateStatus(reportId, newStatus) {
  // Create modal if it doesn't exist
  let confirmModal = document.getElementById('confirmStatusModal');
  if (!confirmModal) {
    confirmModal = document.createElement('div');
    confirmModal.className = 'modal fade';
    confirmModal.id = 'confirmStatusModal';
    confirmModal.setAttribute('tabindex', '-1');
    confirmModal.setAttribute('aria-hidden', 'true');
    
    confirmModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Confirm Status Change</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p id="confirmStatusMessage"></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmStatusBtn">Confirm</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmModal);
  }
  
  // Update modal content
  const confirmMessage = document.getElementById('confirmStatusMessage');
  confirmMessage.textContent = `Are you sure you want to change this report's status to "${getStatusLabel(newStatus)}"?`;
  
  // Create Bootstrap modal instance
  const modal = new bootstrap.Modal(confirmModal);
  modal.show();
  
  // Handle confirmation
  return new Promise((resolve) => {
    const confirmBtn = document.getElementById('confirmStatusBtn');
    
    // Remove existing listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new listener
    newConfirmBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        newConfirmBtn.disabled = true;
        newConfirmBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Updating...
        `;
        
        await updateReportStatus(reportId, newStatus);
        modal.hide();
        
        // Refresh the current view
        const activeTab = document.querySelector('#reportTabs .nav-link.active');
        if (activeTab) {
          await loadReports(activeTab.getAttribute('data-status'));
        }
        
        // Show success notification
        showNotification('Status Updated', `Report status changed to ${getStatusLabel(newStatus)}`, 'success');
        
        resolve(true);
      } catch (error) {
        console.error('Error updating report status:', error);
        
        // Reset button
        newConfirmBtn.disabled = false;
        newConfirmBtn.innerHTML = 'Confirm';
        
        // Show error in modal
        confirmMessage.innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Error: ${error.message}
          </div>
          <p>Do you want to try again?</p>
        `;
        
        resolve(false);
      }
    });
  });
}

/**
 * Confirm and delete a report with modern UX
 * @param {string} reportId - The ID of the report to delete
 */
async function confirmDeleteReport(reportId) {
  // Create modal if it doesn't exist
  let deleteModal = document.getElementById('deleteReportModal');
  if (!deleteModal) {
    deleteModal = document.createElement('div');
    deleteModal.className = 'modal fade';
    deleteModal.id = 'deleteReportModal';
    deleteModal.setAttribute('tabindex', '-1');
    deleteModal.setAttribute('aria-hidden', 'true');
    
    deleteModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Delete Report
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p id="deleteReportMessage">Are you sure you want to delete this report? This action cannot be undone.</p>
            <div class="form-check mt-3">
              <input class="form-check-input" type="checkbox" id="confirmDeleteCheck">
              <label class="form-check-label" for="confirmDeleteCheck">
                I understand that this action is permanent
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn" disabled>
              <i class="bi bi-trash me-2"></i>Delete Report
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(deleteModal);
  }
  
  // Create Bootstrap modal instance
  const modal = new bootstrap.Modal(deleteModal);
  modal.show();
  
  // Handle checkbox to enable delete button
  const checkbox = document.getElementById('confirmDeleteCheck');
  const deleteBtn = document.getElementById('confirmDeleteBtn');
  
  checkbox.checked = false; // Reset checkbox
  deleteBtn.disabled = true; // Disable button initially
  
  checkbox.addEventListener('change', () => {
    deleteBtn.disabled = !checkbox.checked;
  });
  
  // Handle delete confirmation
  return new Promise((resolve) => {
    // Remove existing listeners
    const newDeleteBtn = deleteBtn.cloneNode(true);
    deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
    newDeleteBtn.disabled = true; // Maintain disabled state
    
    // Add new listener
    newDeleteBtn.addEventListener('click', async () => {
      try {
        // Show loading state
        newDeleteBtn.disabled = true;
        newDeleteBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Deleting...
        `;
        
        await deleteReport(reportId);
        modal.hide();
        
        // Refresh the current view
        const activeTab = document.querySelector('#reportTabs .nav-link.active');
        if (activeTab) {
          await loadReports(activeTab.getAttribute('data-status'));
        }
        
        // Show success notification
        showNotification('Report Deleted', 'The report has been permanently deleted', 'success');
        
        resolve(true);
      } catch (error) {
        console.error('Error deleting report:', error);
        
        // Reset button
        newDeleteBtn.disabled = checkbox.checked ? false : true;
        newDeleteBtn.innerHTML = '<i class="bi bi-trash me-2"></i>Delete Report';
        
        // Show error in modal
        document.getElementById('deleteReportMessage').innerHTML = `
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            Error: ${error.message}
          </div>
          <p>Do you want to try again?</p>
        `;
        
        resolve(false);
      }
    });
  });
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