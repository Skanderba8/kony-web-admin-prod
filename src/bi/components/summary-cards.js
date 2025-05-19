// src/bi/components/summary-cards.js

/**
 * Renders KPI summary cards for the BI dashboard
 * @param {string} containerId - ID of the container element
 * @param {Object} kpiData - KPI data to display
 */
export function renderKPISummaryCards(containerId, kpiData) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return;
  }
  
  // Prepare content for KPI cards
  const cardsHTML = `
    <!-- Total Reports KPI -->
    <div class="col-xl-3 col-md-6">
      <div class="card shadow-sm h-100 kpi-card">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-3">
            <div class="kpi-icon rounded-circle me-3 bg-primary-lighter">
              <i class="bi bi-file-earmark-text text-primary"></i>
            </div>
            <div>
              <h3 class="kpi-value">${kpiData.totalReports || 0}</h3>
              <span class="kpi-label text-muted">Total Reports</span>
            </div>
          </div>
          <div class="kpi-footer">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-muted">Draft</small>
              <span class="badge bg-secondary">${kpiData.reportsByStatus?.draft || 0}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-muted">Submitted</small>
              <span class="badge bg-primary">${kpiData.reportsByStatus?.submitted || 0}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-muted">Reviewed</small>
              <span class="badge bg-info">${kpiData.reportsByStatus?.reviewed || 0}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">Approved</small>
              <span class="badge bg-success">${kpiData.reportsByStatus?.approved || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Time KPI -->
    <div class="col-xl-3 col-md-6">
      <div class="card shadow-sm h-100 kpi-card">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-3">
            <div class="kpi-icon rounded-circle me-3 bg-success-lighter">
              <i class="bi bi-clock-history text-success"></i>
            </div>
            <div>
              <h3 class="kpi-value">${kpiData.avgCompletionTime || 0} days</h3>
              <span class="kpi-label text-muted">Average Completion</span>
            </div>
          </div>
          <div class="kpi-footer">
            <div class="mb-2">
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-success" style="width: ${calculateCompletionProgress(kpiData)}%"></div>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">Completion Rate</small>
              <span class="badge bg-light text-dark">
                ${calculateCompletionRate(kpiData)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Components KPI -->
    <div class="col-xl-3 col-md-6">
      <div class="card shadow-sm h-100 kpi-card">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-3">
            <div class="kpi-icon rounded-circle me-3 bg-info-lighter">
              <i class="bi bi-diagram-3 text-info"></i>
            </div>
            <div>
              <h3 class="kpi-value">${kpiData.totalComponents || 0}</h3>
              <span class="kpi-label text-muted">Total Components</span>
            </div>
          </div>
          <div class="kpi-footer">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted">Components per Report</span>
              <span class="badge bg-info">${kpiData.avgComponentsPerReport || 0}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted">Most Common</span>
              <span class="badge bg-light text-dark">${findMostCommonComponent(kpiData)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- People KPI -->
    <div class="col-xl-3 col-md-6">
      <div class="card shadow-sm h-100 kpi-card">
        <div class="card-body p-3">
          <div class="d-flex align-items-center mb-3">
            <div class="kpi-icon rounded-circle me-3 bg-warning-lighter">
              <i class="bi bi-people text-warning"></i>
            </div>
            <div>
              <h3 class="kpi-value">${kpiData.totalTechnicians || 0}</h3>
              <span class="kpi-label text-muted">Technicians</span>
            </div>
          </div>
          <div class="kpi-footer">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-muted">Top Technician</span>
              <span class="badge bg-light text-dark" title="${kpiData.mostActiveTechnician || 'N/A'}">
                ${truncateText(kpiData.mostActiveTechnician || 'N/A', 15)}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-muted">Top Client</span>
              <span class="badge bg-light text-dark" title="${kpiData.mostActiveClient || 'N/A'}">
                ${truncateText(kpiData.mostActiveClient || 'N/A', 15)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Update container
  container.innerHTML = cardsHTML;
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(container.querySelectorAll('[title]'));
  tooltipTriggerList.forEach(element => {
    new bootstrap.Tooltip(element);
  });
}

/**
 * Calculate completion progress percentage for progress bar
 * @param {Object} kpiData - KPI data
 * @returns {number} - Progress percentage
 */
function calculateCompletionProgress(kpiData) {
  if (!kpiData || !kpiData.reportsByStatus) return 0;
  
  const { draft, submitted, reviewed, approved } = kpiData.reportsByStatus;
  const total = (draft || 0) + (submitted || 0) + (reviewed || 0) + (approved || 0);
  
  if (total === 0) return 0;
  
  // Calculate weighted progress: submitted = 33%, reviewed = 66%, approved = 100%
  const progress = ((submitted || 0) * 0.33 + (reviewed || 0) * 0.66 + (approved || 0)) / total * 100;
  
  return Math.round(progress);
}

/**
 * Calculate completion rate percentage
 * @param {Object} kpiData - KPI data
 * @returns {number} - Completion rate percentage
 */
function calculateCompletionRate(kpiData) {
  if (!kpiData || !kpiData.reportsByStatus) return 0;
  
  const { draft, submitted, reviewed, approved } = kpiData.reportsByStatus;
  const total = (draft || 0) + (submitted || 0) + (reviewed || 0) + (approved || 0);
  
  if (total === 0) return 0;
  
  // Reports that have moved beyond draft status
  const completed = (submitted || 0) + (reviewed || 0) + (approved || 0);
  
  return Math.round((completed / total) * 100);
}

/**
 * Find the most common component type
 * @param {Object} kpiData - KPI data
 * @returns {string} - Name of most common component
 */
function findMostCommonComponent(kpiData) {
  if (!kpiData || !kpiData.componentStats || !kpiData.componentStats.types) {
    return 'N/A';
  }
  
  let maxCount = 0;
  let mostCommonName = 'N/A';
  
  Object.entries(kpiData.componentStats.types).forEach(([type, data]) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      mostCommonName = data.name;
    }
  });
  
  return mostCommonName;
}

/**
 * Truncate text with ellipsis if too long
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}