// src/components/reports-enhanced.js - Professional Reports Management with Reject Functionality
import { getReportsByStatus, updateReportStatus, deleteReport } from '../utils/api.js';

/**
 * Initialize Enhanced Reports Module with Professional UI
 */
export async function initializeEnhancedReports(container = document.getElementById('contentContainer')) {
  console.log('Initialisation du Module Rapports Amélioré');
  
  try {
    container.innerHTML = '';
    
    // Create professional reports interface
    container.innerHTML = `
      <div class="enhanced-reports">
        <!-- Header -->
        <div class="reports-header">
          <div class="header-content">
            <div class="header-info">
              <h1 class="reports-title">
                <i class="bi bi-file-text"></i>
                Gestion des Rapports
              </h1>
              <p class="reports-subtitle">Validation et suivi des rapports techniques</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-refresh" id="refreshReportsBtn">
                <i class="bi bi-arrow-clockwise"></i>
                <span>Actualiser</span>
              </button>
              <div class="search-container">
                <i class="bi bi-search"></i>
                <input type="text" placeholder="Rechercher un rapport..." id="reportsSearch">
              </div>
            </div>
          </div>
        </div>

        <!-- Status Tabs -->
        <div class="status-tabs">
          <button class="tab-btn active" data-status="all">
            <span class="tab-label">Tous</span>
            <span class="tab-count" id="countAll">0</span>
          </button>
          <button class="tab-btn" data-status="submitted">
            <span class="tab-label">Soumis</span>
            <span class="tab-count" id="countSubmitted">0</span>
          </button>
          <button class="tab-btn" data-status="reviewed">
            <span class="tab-label">Examinés</span>
            <span class="tab-count" id="countReviewed">0</span>
          </button>
          <button class="tab-btn" data-status="approved">
            <span class="tab-label">Approuvés</span>
            <span class="tab-count" id="countApproved">0</span>
          </button>
          <button class="tab-btn" data-status="rejected">
            <span class="tab-label">Rejetés</span>
            <span class="tab-count" id="countRejected">0</span>
          </button>
        </div>

        <!-- Reports Grid -->
        <div class="reports-container">
          <div class="reports-grid" id="reportsGrid">
            <!-- Reports will be rendered here -->
          </div>
          
          <!-- Empty State -->
          <div class="empty-state" id="emptyState" style="display: none;">
            <i class="bi bi-file-text"></i>
            <h3>Aucun rapport trouvé</h3>
            <p>Aucun rapport ne correspond aux critères sélectionnés.</p>
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" id="loadingState">
          <div class="loading-spinner"></div>
          <p>Chargement des rapports...</p>
        </div>
      </div>

      <!-- Reject Modal -->
      <div class="modal-overlay" id="rejectModal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3>
              <i class="bi bi-x-circle text-danger"></i>
              Rejeter le Rapport
            </h3>
            <button class="modal-close" id="closeRejectModal">
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="rejectReason">Motif du rejet <span class="required">*</span></label>
              <textarea 
                id="rejectReason" 
                placeholder="Veuillez expliquer pourquoi ce rapport est rejeté..."
                rows="4"
                required
              ></textarea>
              <div class="character-count">
                <span id="charCount">0</span>/500 caractères
              </div>
            </div>
            <div class="form-group">
              <label>Catégorie du problème</label>
              <div class="reason-categories">
                <button class="reason-btn" data-reason="Informations manquantes">
                  <i class="bi bi-info-circle"></i>
                  Informations manquantes
                </button>
                <button class="reason-btn" data-reason="Photos de mauvaise qualité">
                  <i class="bi bi-camera"></i>
                  Photos de mauvaise qualité
                </button>
                <button class="reason-btn" data-reason="Données incorrectes">
                  <i class="bi bi-exclamation-triangle"></i>
                  Données incorrectes
                </button>
                <button class="reason-btn" data-reason="Format non conforme">
                  <i class="bi bi-file-x"></i>
                  Format non conforme
                </button>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" id="cancelReject">
              Annuler
            </button>
            <button class="btn btn-danger" id="confirmReject" disabled>
              <i class="bi bi-x-circle"></i>
              Rejeter le Rapport
            </button>
          </div>
        </div>
      </div>

      <!-- Success/Error Toast Container -->
      <div class="toast-container" id="toastContainer"></div>
    `;

    // Apply professional styles
    applyReportsStyles();
    
    // Setup event listeners
    setupReportsEventListeners();
    
    // Load initial data
    await loadReportsByStatus('all');
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du module rapports:', error);
    showErrorState(container, error);
  }
}

/**
 * Apply professional CSS styles for reports
 */
function applyReportsStyles() {
  const styles = `
    <style>
      .enhanced-reports {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      }

      .reports-header {
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

      .reports-title {
        font-size: 2rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .reports-subtitle {
        color: #64748b;
        margin: 0.25rem 0 0 0;
        font-size: 1rem;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      .search-container {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-container i {
        position: absolute;
        left: 12px;
        color: #9ca3af;
        z-index: 1;
      }

      .search-container input {
        padding: 0.75rem 0.75rem 0.75rem 2.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: white;
        width: 250px;
        transition: all 0.2s ease;
        font-size: 0.875rem;
      }

      .search-container input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .status-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 1rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        overflow-x: auto;
      }

      .tab-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.75rem 1.5rem;
        border: none;
        background: transparent;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 100px;
        white-space: nowrap;
      }

      .tab-btn:hover {
        background: #f8fafc;
      }

      .tab-btn.active {
        background: #3b82f6;
        color: white;
      }

      .tab-label {
        font-weight: 500;
        font-size: 0.875rem;
      }

      .tab-count {
        background: rgba(255, 255, 255, 0.2);
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        min-width: 20px;
        text-align: center;
      }

      .tab-btn.active .tab-count {
        background: rgba(255, 255, 255, 0.3);
      }

      .reports-container {
        position: relative;
      }

      .reports-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 1.5rem;
      }

      .report-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        border: 1px solid transparent;
      }

      .report-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        border-color: #3b82f6;
      }

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .report-info h3 {
        margin: 0 0 0.25rem 0;
        color: #1e293b;
        font-size: 1.125rem;
        font-weight: 600;
      }

      .report-meta {
        color: #64748b;
        font-size: 0.875rem;
      }

      .report-status {
        padding: 0.375rem 0.75rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.025em;
      }

      .status-submitted {
        background: #fef3c7;
        color: #92400e;
      }

      .status-reviewed {
        background: #dbeafe;
        color: #1e40af;
      }

      .status-approved {
        background: #d1fae5;
        color: #065f46;
      }

      .status-rejected {
        background: #fee2e2;
        color: #991b1b;
      }

      .report-details {
        margin-bottom: 1.5rem;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #f1f5f9;
      }

      .detail-row:last-child {
        border-bottom: none;
      }

      .detail-label {
        color: #64748b;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .detail-value {
        color: #1e293b;
        font-size: 0.875rem;
        font-weight: 600;
      }

      .report-actions {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        font-size: 0.875rem;
        flex: 1;
        justify-content: center;
        min-width: 0;
      }

      .btn-primary {
        background: #3b82f6;
        color: white;
      }

      .btn-primary:hover {
        background: #2563eb;
      }

      .btn-success {
        background: #10b981;
        color: white;
      }

      .btn-success:hover {
        background: #059669;
      }

      .btn-danger {
        background: #ef4444;
        color: white;
      }

      .btn-danger:hover {
        background: #dc2626;
      }

      .btn-warning {
        background: #f59e0b;
        color: white;
      }

      .btn-warning:hover {
        background: #d97706;
      }

      .btn-secondary {
        background: #6b7280;
        color: white;
      }

      .btn-secondary:hover {
        background: #4b5563;
      }

      .btn-outline {
        background: transparent;
        color: #6b7280;
        border: 1px solid #d1d5db;
      }

      .btn-outline:hover {
        background: #f9fafb;
        border-color: #9ca3af;
      }

      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #6b7280;
      }

      .empty-state i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .empty-state h3 {
        margin-bottom: 0.5rem;
        color: #374151;
      }

      .loading-state {
        text-align: center;
        padding: 4rem 2rem;
        color: #6b7280;
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

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }

      .modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }

      .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        transform: scale(0.95);
        transition: transform 0.3s ease;
      }

      .modal-overlay.show .modal-content {
        transform: scale(1);
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e5e7eb;
      }

      .modal-header h3 {
        margin: 0;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .modal-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #6b7280;
        font-size: 1.25rem;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .modal-close:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .modal-body {
        padding: 1.5rem;
      }

      .form-group {
        margin-bottom: 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
      }

      .required {
        color: #ef4444;
      }

      .form-group textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        resize: vertical;
        font-family: inherit;
        transition: border-color 0.2s ease;
      }

      .form-group textarea:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .character-count {
        text-align: right;
        font-size: 0.75rem;
        color: #6b7280;
        margin-top: 0.25rem;
      }

      .reason-categories {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 0.5rem;
      }

      .reason-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border: 1px solid #d1d5db;
        background: white;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: left;
        font-size: 0.875rem;
      }

      .reason-btn:hover {
        border-color: #3b82f6;
        background: #f8fafc;
      }

      .reason-btn.selected {
        border-color: #3b82f6;
        background: #dbeafe;
        color: #1e40af;
      }

      .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
      }

      .toast-container {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 10001;
      }

      @media (max-width: 768px) {
        .enhanced-reports {
          padding: 1rem;
        }
        
        .header-content {
          flex-direction: column;
          align-items: stretch;
        }
        
        .reports-grid {
          grid-template-columns: 1fr;
        }
        
        .status-tabs {
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .status-tabs::-webkit-scrollbar {
          display: none;
        }

        .search-container input {
          width: 100%;
        }

        .modal-content {
          width: 95%;
        }

        .reason-categories {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
}

/**
 * Setup event listeners for reports management
 */
function setupReportsEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', async (e) => {
      const status = e.currentTarget.dataset.status;
      
      // Update active tab
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      // Load reports for this status
      await loadReportsByStatus(status);
    });
  });

  // Search functionality
  document.getElementById('reportsSearch')?.addEventListener('input', (e) => {
    filterReports(e.target.value);
  });

  // Refresh button
  document.getElementById('refreshReportsBtn')?.addEventListener('click', async () => {
    const activeTab = document.querySelector('.tab-btn.active');
    const status = activeTab?.dataset.status || 'all';
    await loadReportsByStatus(status);
    showToast('Rapports actualisés avec succès', 'success');
  });

  // Reject modal event listeners
  setupRejectModalListeners();
}

/**
 * Setup reject modal event listeners
 */
function setupRejectModalListeners() {
  const rejectModal = document.getElementById('rejectModal');
  const rejectReason = document.getElementById('rejectReason');
  const charCount = document.getElementById('charCount');
  const confirmReject = document.getElementById('confirmReject');

  // Close modal handlers
  document.getElementById('closeRejectModal')?.addEventListener('click', () => {
    closeRejectModal();
  });

  document.getElementById('cancelReject')?.addEventListener('click', () => {
    closeRejectModal();
  });

  // Close on overlay click
  rejectModal?.addEventListener('click', (e) => {
    if (e.target === rejectModal) {
      closeRejectModal();
    }
  });

  // Character count and validation
  rejectReason?.addEventListener('input', (e) => {
    const length = e.target.value.length;
    charCount.textContent = length;
    
    // Update character count color
    if (length > 500) {
      charCount.style.color = '#ef4444';
    } else if (length > 400) {
      charCount.style.color = '#f59e0b';
    } else {
      charCount.style.color = '#6b7280';
    }
    
    // Enable/disable confirm button
    confirmReject.disabled = length < 10 || length > 500;
  });

  // Reason category buttons
  document.querySelectorAll('.reason-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Toggle selection
      document.querySelectorAll('.reason-btn').forEach(b => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      
      // Add reason to textarea
      const reason = e.currentTarget.dataset.reason;
      const currentText = rejectReason.value;
      const newText = currentText ? `${currentText}\n\n${reason}: ` : `${reason}: `;
      rejectReason.value = newText;
      rejectReason.focus();
      
      // Trigger input event to update character count
      rejectReason.dispatchEvent(new Event('input'));
    });
  });

  // Confirm reject
  confirmReject?.addEventListener('click', async () => {
    const reportId = confirmReject.dataset.reportId;
    const reason = rejectReason.value.trim();
    
    if (!reason || reason.length < 10) {
      showToast('Le motif du rejet doit contenir au moins 10 caractères', 'error');
      return;
    }
    
    await handleRejectReport(reportId, reason);
  });
}

/**
 * Load reports by status
 */
async function loadReportsByStatus(status) {
  try {
    showLoadingState();
    
    const reports = await getReportsByStatus(status === 'all' ? '' : status);
    
    // Update counts
    updateStatusCounts(reports, status);
    
    // Render reports
    renderReports(reports, status);
    
    hideLoadingState();
    
  } catch (error) {
    console.error('Erreur lors du chargement des rapports:', error);
    hideLoadingState();
    showErrorState(document.getElementById('reportsGrid'), error);
    showToast('Erreur lors du chargement des rapports', 'error');
  }
}

/**
 * Update status counts in tabs
 */
function updateStatusCounts(allReports, currentStatus) {
  // Get counts for each status
  const counts = {
    all: allReports.length,
    submitted: allReports.filter(r => r.status === 'submitted').length,
    reviewed: allReports.filter(r => r.status === 'reviewed').length,
    approved: allReports.filter(r => r.status === 'approved').length,
    rejected: allReports.filter(r => r.status === 'rejected').length
  };

  // Update tab counts
  Object.entries(counts).forEach(([status, count]) => {
    const countElement = document.getElementById(`count${status.charAt(0).toUpperCase() + status.slice(1)}`);
    if (countElement) {
      countElement.textContent = count;
    }
  });
}

/**
 * Render reports grid
 */
function renderReports(reports, status) {
  const reportsGrid = document.getElementById('reportsGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (reports.length === 0) {
    reportsGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }
  
  reportsGrid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  reportsGrid.innerHTML = reports.map(report => createEnhancedReportCard(report)).join('');
  
  // Setup card event listeners
  setupReportCardListeners(reports);
}

/**
 * Create enhanced report card
 */
function createEnhancedReportCard(report) {
  const statusClass = `status-${report.status}`;
  const statusLabel = getStatusLabel(report.status);
  const createdDate = new Date(report.createdAt || report.date).toLocaleDateString('fr-FR');
  const submittedDate = report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('fr-FR') : '-';
  
  return `
    <div class="report-card" data-report-id="${report.id}">
      <div class="report-header">
        <div class="report-info">
          <h3>${report.clientName || 'Client non spécifié'}</h3>
          <div class="report-meta">
            <i class="bi bi-geo-alt"></i>
            ${report.location || 'Lieu non spécifié'}
          </div>
        </div>
        <div class="report-status ${statusClass}">
          ${statusLabel}
        </div>
      </div>
      
      <div class="report-details">
        <div class="detail-row">
          <span class="detail-label">Technicien</span>
          <span class="detail-value">${report.technicianName || 'Non assigné'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date de création</span>
          <span class="detail-value">${createdDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date de soumission</span>
          <span class="detail-value">${submittedDate}</span>
        </div>
        ${report.rejectReason ? `
        <div class="detail-row">
          <span class="detail-label">Motif du rejet</span>
          <span class="detail-value" style="color: #ef4444;">${report.rejectReason}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="report-actions">
        <button class="btn btn-outline view-btn" data-report-id="${report.id}">
          <i class="bi bi-eye"></i>
          Voir
        </button>
        
        <button class="btn btn-primary download-btn" data-report-id="${report.id}">
          <i class="bi bi-download"></i>
          PDF
        </button>
        
        ${report.status === 'submitted' ? `
          <button class="btn btn-warning review-btn" data-report-id="${report.id}">
            <i class="bi bi-search"></i>
            Examiner
          </button>
        ` : ''}
        
        ${report.status === 'reviewed' ? `
          <button class="btn btn-success approve-btn" data-report-id="${report.id}">
            <i class="bi bi-check-circle"></i>
            Approuver
          </button>
          <button class="btn btn-danger reject-btn" data-report-id="${report.id}">
            <i class="bi bi-x-circle"></i>
            Rejeter
          </button>
        ` : ''}
        
        ${report.status === 'rejected' ? `
          <button class="btn btn-warning resubmit-btn" data-report-id="${report.id}">
            <i class="bi bi-arrow-clockwise"></i>
            Remettre en examen
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Setup report card event listeners
 */
function setupReportCardListeners(reports) {
  // View report buttons
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reportId = e.currentTarget.dataset.reportId;
      viewReport(reportId);
    });
  });

  // Download PDF buttons
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reportId = e.currentTarget.dataset.reportId;
      downloadReport(reportId);
    });
  });

  // Review buttons
  document.querySelectorAll('.review-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reportId = e.currentTarget.dataset.reportId;
      await updateReportStatusWithConfirm(reportId, 'reviewed', 'Marquer comme examiné');
    });
  });

  // Approve buttons
  document.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reportId = e.currentTarget.dataset.reportId;
      await updateReportStatusWithConfirm(reportId, 'approved', 'Approuver le rapport');
    });
  });

  // Reject buttons
  document.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const reportId = e.currentTarget.dataset.reportId;
      openRejectModal(reportId);
    });
  });

  // Resubmit buttons
  document.querySelectorAll('.resubmit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const reportId = e.currentTarget.dataset.reportId;
      await updateReportStatusWithConfirm(reportId, 'submitted', 'Remettre en examen');
    });
  });
}

/**
 * Open reject modal
 */
function openRejectModal(reportId) {
  const modal = document.getElementById('rejectModal');
  const confirmBtn = document.getElementById('confirmReject');
  const reasonTextarea = document.getElementById('rejectReason');
  
  // Reset modal
  reasonTextarea.value = '';
  document.getElementById('charCount').textContent = '0';
  confirmBtn.disabled = true;
  confirmBtn.dataset.reportId = reportId;
  
  // Clear previous selections
  document.querySelectorAll('.reason-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  // Show modal
  modal.classList.add('show');
  reasonTextarea.focus();
}

/**
 * Close reject modal
 */
function closeRejectModal() {
  const modal = document.getElementById('rejectModal');
  modal.classList.remove('show');
}

/**
 * Handle reject report
 */
async function handleRejectReport(reportId, reason) {
  try {
    const confirmBtn = document.getElementById('confirmReject');
    
    // Show loading state
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `
      <div class="loading-spinner" style="width: 16px; height: 16px; margin-right: 0.5rem;"></div>
      Rejet en cours...
    `;

    // Update report status with reject reason
    await updateReportStatus(reportId, 'rejected', { rejectReason: reason });

    // Close modal
    closeRejectModal();

    // Refresh reports
    const activeTab = document.querySelector('.tab-btn.active');
    const status = activeTab?.dataset.status || 'all';
    await loadReportsByStatus(status);

    // Show success message
    showToast('Rapport rejeté avec succès', 'success');

  } catch (error) {
    console.error('Erreur lors du rejet du rapport:', error);
    
    // Reset button
    const confirmBtn = document.getElementById('confirmReject');
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = `
      <i class="bi bi-x-circle"></i>
      Rejeter le Rapport
    `;
    
    showToast('Erreur lors du rejet du rapport', 'error');
  }
}

/**
 * Update report status with confirmation
 */
async function updateReportStatusWithConfirm(reportId, newStatus, actionText) {
  try {
    // Show confirmation
    const confirmed = await showConfirmDialog(
      `Confirmer l'action`,
      `Êtes-vous sûr de vouloir ${actionText.toLowerCase()} ?`,
      actionText
    );
    
    if (!confirmed) return;

    // Update status
    await updateReportStatus(reportId, newStatus);

    // Refresh reports
    const activeTab = document.querySelector('.tab-btn.active');
    const status = activeTab?.dataset.status || 'all';
    await loadReportsByStatus(status);

    // Show success message
    showToast(`${actionText} effectué avec succès`, 'success');

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    showToast('Erreur lors de la mise à jour du statut', 'error');
  }
}

/**
 * Show confirmation dialog
 */
function showConfirmDialog(title, message, confirmText) {
  return new Promise((resolve) => {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay show';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
        </div>
        <div class="modal-body">
          <p>${message}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancelConfirm">
            Annuler
          </button>
          <button class="btn btn-primary" id="acceptConfirm">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle buttons
    document.getElementById('cancelConfirm').addEventListener('click', () => {
      modal.remove();
      resolve(false);
    });

    document.getElementById('acceptConfirm').addEventListener('click', () => {
      modal.remove();
      resolve(true);
    });

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    });
  });
}

/**
 * Filter reports based on search term
 */
function filterReports(searchTerm) {
  const cards = document.querySelectorAll('.report-card');
  const term = searchTerm.toLowerCase();
  
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const isVisible = text.includes(term);
    card.style.display = isVisible ? 'block' : 'none';
  });
  
  // Update empty state
  const visibleCards = document.querySelectorAll('.report-card[style*="block"], .report-card:not([style*="none"])');
  const emptyState = document.getElementById('emptyState');
  const reportsGrid = document.getElementById('reportsGrid');
  
  if (visibleCards.length === 0 && searchTerm) {
    reportsGrid.style.display = 'none';
    emptyState.style.display = 'block';
    emptyState.querySelector('h3').textContent = 'Aucun rapport trouvé';
    emptyState.querySelector('p').textContent = `Aucun rapport ne correspond à "${searchTerm}".`;
  } else if (visibleCards.length > 0) {
    reportsGrid.style.display = 'grid';
    emptyState.style.display = 'none';
  }
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
 * Show loading state
 */
function showLoadingState() {
  document.getElementById('loadingState').style.display = 'block';
  document.getElementById('reportsGrid').style.display = 'none';
  document.getElementById('emptyState').style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  document.getElementById('loadingState').style.display = 'none';
}

/**
 * View report function
 */
function viewReport(reportId) {
  console.log('Affichage du rapport:', reportId);
  showToast('Ouverture du rapport...', 'info');
  // Navigate to detailed report view
}

/**
 * Download report function
 */
function downloadReport(reportId) {
  console.log('Téléchargement du rapport PDF:', reportId);
  showToast('Téléchargement du PDF en cours...', 'info');
  
  // Simulate download
  setTimeout(() => {
    showToast('PDF téléchargé avec succès', 'success');
  }, 2000);
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
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; color: #6b7280; padding: 2rem;">
      <i class="bi bi-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
      <h3 style="color: #374151; margin-bottom: 0.5rem;">Erreur de Chargement</h3>
      <p style="margin-bottom: 2rem; max-width: 500px;">Une erreur s'est produite lors du chargement des rapports. Veuillez réessayer.</p>
      <button onclick="window.location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 500;">
        <i class="bi bi-arrow-clockwise" style="margin-right: 0.5rem;"></i>
        Recharger la Page
      </button>
    </div>
  `;
}

// Export the main function
export { initializeEnhancedReports };