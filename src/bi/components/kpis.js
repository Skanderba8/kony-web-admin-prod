// src/bi/components/kpis.js - Enhanced version
/**
 * Renders enhanced KPI cards in a container with a modern visual style
 * @param {string} containerId - The ID of the container element
 * @param {Object} kpiData - The KPI data to render
 */
export function renderKPICards(containerId, kpiData) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  
  // Clear previous content
  container.innerHTML = '';
  
  // Define KPI configurations with icons, titles, and formatting
  const kpiConfigs = [
    {
      key: 'totalReports',
      title: 'Total Reports',
      icon: 'bi-file-earmark-text',
      color: 'primary',
      formatter: value => value.toString(),
      tooltip: 'Total number of technical visit reports in the system'
    },
    {
      key: 'totalSubmitted',
      title: 'Submitted',
      icon: 'bi-send',
      color: 'info',
      formatter: value => value.toString(),
      tooltip: 'Reports submitted by technicians pending review'
    },
    {
      key: 'totalReviewed',
      title: 'Reviewed',
      icon: 'bi-check2-circle',
      color: 'purple',
      formatter: value => value.toString(),
      tooltip: 'Reports that have been reviewed but not yet approved'
    },
    {
      key: 'totalApproved',
      title: 'Approved',
      icon: 'bi-trophy',
      color: 'success',
      formatter: value => value.toString(),
      tooltip: 'Reports that have been fully approved'
    },
    {
      key: 'avgCompletionTime',
      title: 'Avg. Completion Time',
      icon: 'bi-clock',
      color: 'warning',
      formatter: value => `${value} days`,
      tooltip: 'Average time from creation to submission'
    },
    {
      key: 'avgComponentsPerReport',
      title: 'Avg. Components/Report',
      icon: 'bi-diagram-3',
      color: 'indigo',
      formatter: value => value.toString(),
      tooltip: 'Average number of components documented per report'
    },
    {
      key: 'totalComponents',
      title: 'Total Components',
      icon: 'bi-boxes',
      color: 'cyan',
      formatter: value => value?.toString() || '0',
      tooltip: 'Total number of technical components documented across all reports'
    },
    {
      key: 'mostActiveClient',
      title: 'Most Active Client',
      icon: 'bi-building',
      color: 'secondary',
      formatter: value => value || 'N/A',
      tooltip: 'Client with the most technical visit reports'
    },
    {
      key: 'mostActiveTechnician',
      title: 'Top Technician',
      icon: 'bi-person-badge',
      color: 'dark',
      formatter: value => value || 'N/A',
      tooltip: 'Technician who has created the most reports'
    }
  ];
  
  // Create a modern card-based grid layout
  const cardGrid = document.createElement('div');
  cardGrid.className = 'row g-3';
  
  // Create and populate KPI cards
  kpiConfigs.forEach(config => {
    const value = kpiData[config.key];
    if (value === undefined && config.key !== 'totalComponents') return;
    
    const col = document.createElement('div');
    col.className = 'col-md-4 col-sm-6';
    
    // Determine color classes
    const bgClass = config.color === 'purple' ? 'bg-purple' : 
                   config.color === 'indigo' ? 'bg-indigo' :
                   config.color === 'cyan' ? 'bg-cyan' :
                   `bg-${config.color}`;
    
    const textClass = config.color === 'light' || config.color === 'warning' ? 'text-dark' : 'text-white';
    
    col.innerHTML = `
      <div class="card shadow-sm h-100 kpi-card" data-bs-toggle="tooltip" title="${config.tooltip}">
        <div class="card-body p-0">
          <div class="d-flex align-items-center">
            <div class="kpi-icon ${bgClass} ${textClass}">
              <i class="bi ${config.icon}"></i>
            </div>
            <div class="kpi-content">
              <h4 class="kpi-value">${config.formatter(value)}</h4>
              <p class="kpi-title text-muted">${config.title}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    cardGrid.appendChild(col);
  });
  
  container.appendChild(cardGrid);
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(container.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Add custom CSS for KPI cards
  addKpiStyles();
}

/**
 * Adds custom CSS styles for KPI cards if not already present
 */
function addKpiStyles() {
  // Check if styles already exist
  if (document.getElementById('kpi-custom-styles')) return;
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'kpi-custom-styles';
  style.textContent = `
    .kpi-card {
      transition: all 0.3s ease;
      border-radius: 10px;
      overflow: hidden;
    }
    
    .kpi-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }
    
    .kpi-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      font-size: 2rem;
    }
    
    .kpi-content {
      padding: 15px;
      flex-grow: 1;
    }
    
    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    
    .kpi-title {
      font-size: 0.9rem;
      margin-bottom: 0;
      font-weight: 500;
    }
    
    /* Custom colors */
    .bg-purple {
      background-color: #6f42c1;
    }
    
    .bg-indigo {
      background-color: #6610f2;
    }
    
    .bg-cyan {
      background-color: #0dcaf0;
    }
    
    /* Dark mode compatibility */
    [data-theme="dark"] .kpi-card {
      background-color: #2b3035;
    }
    
    [data-theme="dark"] .kpi-value {
      color: #f8f9fa;
    }
    
    [data-theme="dark"] .kpi-title {
      color: #adb5bd !important;
    }
  `;
  
  // Add to document
  document.head.appendChild(style);
}