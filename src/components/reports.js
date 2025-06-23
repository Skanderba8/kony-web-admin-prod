// src/components/reports.js - Simple temporary reports component
import { getReportsByStatus } from '../utils/api.js';

/**
 * Show reports list in the container
 * @param {HTMLElement} container - The container to render reports in
 */
export async function showReportsList(container) {
  try {
    console.log('Loading reports module...');
    
    // Show loading state
    container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="min-height: 50vh;">
        <div class="text-center">
          <div class="spinner-border text-primary mb-3" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <h4>Chargement des rapports...</h4>
        </div>
      </div>
    `;

    // Try to load actual reports
    let reports = [];
    try {
      reports = await getReportsByStatus('all');
    } catch (error) {
      console.warn('Could not load reports from database:', error);
      // Continue with empty array
    }

    // Render reports interface
    container.innerHTML = `
      <div class="reports-container">
        <div class="reports-header bg-white rounded-3 shadow-sm p-4 mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <i class="bi bi-file-text text-primary me-2"></i>
                Gestion des Rapports
              </h2>
              <p class="text-muted mb-0">Validation et suivi des rapports techniques</p>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-primary" id="refreshReports">
                <i class="bi bi-arrow-clockwise me-1"></i>
                Actualiser
              </button>
              <button class="btn btn-primary" id="newReport">
                <i class="bi bi-plus-lg me-1"></i>
                Nouveau Rapport
              </button>
            </div>
          </div>
        </div>

        <!-- Status Tabs -->
        <div class="bg-white rounded-3 shadow-sm mb-4">
          <div class="nav nav-tabs border-0 p-3" id="reportTabs" role="tablist">
            <button class="nav-link active" data-status="all" type="button">
              <i class="bi bi-collection me-1"></i>
              Tous <span class="badge bg-secondary ms-1">${reports.length}</span>
            </button>
            <button class="nav-link" data-status="submitted" type="button">
              <i class="bi bi-clock me-1"></i>
              Soumis <span class="badge bg-warning ms-1">${reports.filter(r => r.status === 'submitted').length}</span>
            </button>
            <button class="nav-link" data-status="reviewed" type="button">
              <i class="bi bi-search me-1"></i>
              Examinés <span class="badge bg-info ms-1">${reports.filter(r => r.status === 'reviewed').length}</span>
            </button>
            <button class="nav-link" data-status="approved" type="button">
              <i class="bi bi-check-circle me-1"></i>
              Approuvés <span class="badge bg-success ms-1">${reports.filter(r => r.status === 'approved').length}</span>
            </button>
            <button class="nav-link" data-status="rejected" type="button">
              <i class="bi bi-x-circle me-1"></i>
              Rejetés <span class="badge bg-danger ms-1">${reports.filter(r => r.status === 'rejected').length}</span>
            </button>
          </div>
        </div>

        <!-- Reports Content -->
        <div class="bg-white rounded-3 shadow-sm p-4">
          <div id="reportsContent">
            ${renderReportsContent(reports)}
          </div>
        </div>
      </div>
    `;

    // Setup event listeners
    setupReportsEventListeners(container);

  } catch (error) {
    console.error('Error loading reports module:', error);
    container.innerHTML = `
      <div class="alert alert-danger m-4">
        <div class="d-flex align-items-center">
          <i class="bi bi-exclamation-triangle fs-1 me-3"></i>
          <div>
            <h4 class="alert-heading">Erreur de Chargement</h4>
            <p class="mb-0">Impossible de charger le module des rapports.</p>
            <small class="text-muted">Erreur: ${error.message}</small>
          </div>
        </div>
        <hr>
        <button class="btn btn-danger" onclick="window.location.reload()">
          <i class="bi bi-arrow-clockwise me-2"></i>Recharger
        </button>
      </div>
    `;
  }
}

/**
 * Render reports content based on data
 */
function renderReportsContent(reports) {
  if (reports.length === 0) {
    return `
      <div class="text-center py-5">
        <i class="bi bi-file-text text-muted" style="font-size: 4rem;"></i>
        <h4 class="mt-3 text-muted">Aucun rapport trouvé</h4>
        <p class="text-muted">Les rapports techniques apparaîtront ici une fois créés.</p>
        <button class="btn btn-primary mt-3" id="createFirstReport">
          <i class="bi bi-plus-lg me-2"></i>
          Créer le Premier Rapport
        </button>
      </div>
    `;
  }

  return `
    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>Client</th>
            <th>Lieu</th>
            <th>Technicien</th>
            <th>Date de Création</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${reports.map(report => `
            <tr>
              <td>
                <div class="fw-bold">${report.clientName || 'Non spécifié'}</div>
                <small class="text-muted">${report.projectContext || ''}</small>
              </td>
              <td>${report.location || 'Non spécifié'}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="avatar-sm bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; font-size: 0.8rem;">
                    ${(report.technicianName || 'U').charAt(0).toUpperCase()}
                  </div>
                  ${report.technicianName || 'Non assigné'}
                </div>
              </td>
              <td>${formatDate(report.createdAt || report.date)}</td>
              <td>
                <span class="badge ${getStatusBadgeClass(report.status)}">
                  ${getStatusLabel(report.status)}
                </span>
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-primary" onclick="viewReport('${report.id}')" title="Voir">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button class="btn btn-outline-secondary" onclick="downloadReport('${report.id}')" title="Télécharger">
                    <i class="bi bi-download"></i>
                  </button>
                  ${getActionButtons(report)}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Get status badge CSS class
 */
function getStatusBadgeClass(status) {
  const classes = {
    submitted: 'bg-warning text-dark',
    reviewed: 'bg-info',
    approved: 'bg-success',
    rejected: 'bg-danger',
    draft: 'bg-secondary'
  };
  return classes[status] || 'bg-secondary';
}

/**
 * Get French status label
 */
function getStatusLabel(status) {
  const labels = {
    submitted: 'Soumis',
    reviewed: 'Examiné',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    draft: 'Brouillon'
  };
  return labels[status] || status;
}

/**
 * Format date for display
 */
function formatDate(date) {
  if (!date) return 'Non spécifié';
  
  try {
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Date invalide';
  }
}

/**
 * Get action buttons based on report status
 */
function getActionButtons(report) {
  switch (report.status) {
    case 'submitted':
      return `
        <button class="btn btn-outline-info" onclick="reviewReport('${report.id}')" title="Examiner">
          <i class="bi bi-search"></i>
        </button>
      `;
    case 'reviewed':
      return `
        <button class="btn btn-outline-success" onclick="approveReport('${report.id}')" title="Approuver">
          <i class="bi bi-check"></i>
        </button>
        <button class="btn btn-outline-danger" onclick="rejectReport('${report.id}')" title="Rejeter">
          <i class="bi bi-x"></i>
        </button>
      `;
    default:
      return '';
  }
}

/**
 * Setup event listeners for the reports module
 */
function setupReportsEventListeners(container) {
  // Tab switching
  container.querySelectorAll('[data-status]').forEach(tab => {
    tab.addEventListener('click', async (e) => {
      const status = e.currentTarget.dataset.status;
      
      // Update active tab
      container.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      e.currentTarget.classList.add('active');
      
      // Load reports for this status
      await loadReportsByStatus(container, status);
    });
  });

  // Refresh button
  const refreshBtn = container.querySelector('#refreshReports');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      showReportsList(container);
    });
  }

  // New report button
  const newReportBtn = container.querySelector('#newReport');
  if (newReportBtn) {
    newReportBtn.addEventListener('click', () => {
      alert('Fonctionnalité de création de rapport en cours de développement');
    });
  }
}

/**
 * Load reports by status
 */
async function loadReportsByStatus(container, status) {
  try {
    const reportsContent = container.querySelector('#reportsContent');
    if (!reportsContent) return;

    // Show loading
    reportsContent.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary mb-2"></div>
        <p>Chargement des rapports...</p>
      </div>
    `;

    // Load reports
    const reports = await getReportsByStatus(status === 'all' ? '' : status);
    
    // Update content
    reportsContent.innerHTML = renderReportsContent(reports);

  } catch (error) {
    console.error('Error loading reports by status:', error);
    const reportsContent = container.querySelector('#reportsContent');
    if (reportsContent) {
      reportsContent.innerHTML = `
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Erreur lors du chargement des rapports: ${error.message}
        </div>
      `;
    }
  }
}

// Global functions for report actions
window.viewReport = function(reportId) {
  console.log('Viewing report:', reportId);
  alert(`Affichage du rapport ${reportId}\n(Fonctionnalité en cours de développement)`);
};

window.downloadReport = function(reportId) {
  console.log('Downloading report:', reportId);
  alert(`Téléchargement du rapport ${reportId}\n(Fonctionnalité en cours de développement)`);
};

window.reviewReport = function(reportId) {
  console.log('Reviewing report:', reportId);
  alert(`Examen du rapport ${reportId}\n(Fonctionnalité en cours de développement)`);
};

window.approveReport = function(reportId) {
  console.log('Approving report:', reportId);
  if (confirm('Êtes-vous sûr de vouloir approuver ce rapport ?')) {
    alert(`Rapport ${reportId} approuvé\n(Fonctionnalité en cours de développement)`);
  }
};

window.rejectReport = function(reportId) {
  console.log('Rejecting report:', reportId);
  const reason = prompt('Motif du rejet:');
  if (reason) {
    alert(`Rapport ${reportId} rejeté\nMotif: ${reason}\n(Fonctionnalité en cours de développement)`);
  }
};

// Export the main function
export { showReportsList };