// src/bi/components/filters.js

/**
 * Creates a filter panel for the BI dashboard
 * @param {string} containerId - The ID of the container element
 * @param {Function} onFilterChange - Callback function when filters change
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} - Filter panel API
 */
export function createFilterPanel(containerId, onFilterChange, initialFilters = {}) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container element with ID ${containerId} not found`);
    return null;
  }
  
  // Create filter panel UI
  container.innerHTML = `
    <div class="card shadow-sm mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">
          <i class="bi bi-funnel me-2"></i>
          Filters
        </h5>
        <button class="btn btn-sm btn-icon" id="toggleFiltersBtn">
          <i class="bi bi-chevron-up"></i>
        </button>
      </div>
      <div class="card-body" id="filterBody">
        <!-- Date Range Filter -->
        <div class="mb-3">
          <label class="form-label">Date Range</label>
          <select class="form-select" id="dateRangeSelect">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        <!-- Custom Date Range (initially hidden) -->
        <div class="mb-3" id="customDateRange" style="display: none;">
          <div class="row">
            <div class="col-md-6">
              <label class="form-label">Start Date</label>
              <input type="date" class="form-control" id="startDateInput">
            </div>
            <div class="col-md-6">
              <label class="form-label">End Date</label>
              <input type="date" class="form-control" id="endDateInput">
            </div>
          </div>
        </div>
        
        <!-- Status Filter -->
        <div class="mb-3">
          <label class="form-label">Status</label>
          <div class="d-flex flex-wrap gap-2" id="statusFilter">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="statusAll" checked>
              <label class="form-check-label" for="statusAll">All</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="statusDraft">
              <label class="form-check-label" for="statusDraft">Draft</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="statusSubmitted">
              <label class="form-check-label" for="statusSubmitted">Submitted</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="statusReviewed">
              <label class="form-check-label" for="statusReviewed">Reviewed</label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="statusApproved">
              <label class="form-check-label" for="statusApproved">Approved</label>
            </div>
          </div>
        </div>
        
        <!-- Technician Filter -->
        <div class="mb-3">
          <label class="form-label">Technician</label>
          <select class="form-select" id="technicianSelect">
            <option value="all">All Technicians</option>
            <!-- Technician options will be added here dynamically -->
          </select>
        </div>
        
        <!-- Client Filter -->
        <div class="mb-3">
          <label class="form-label">Client</label>
          <select class="form-select" id="clientSelect">
            <option value="all">All Clients</option>
            <!-- Client options will be added here dynamically -->
          </select>
        </div>
        
        <!-- Component Count Filter -->
        <div class="mb-3">
          <label class="form-label">Component Count</label>
          <div class="row">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">Min</span>
                <input type="number" class="form-control" id="minComponentsInput" min="0">
              </div>
            </div>
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">Max</span>
                <input type="number" class="form-control" id="maxComponentsInput" min="0">
              </div>
            </div>
          </div>
        </div>
        
        <!-- Time Grouping Filter -->
        <div class="mb-3">
          <label class="form-label">Time Grouping</label>
          <select class="form-select" id="timeGroupingSelect">
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month" selected>Monthly</option>
          </select>
        </div>
        
        <!-- Filter Buttons -->
        <div class="d-flex gap-2">
          <button class="btn btn-primary w-100" id="applyFiltersBtn">
            <i class="bi bi-funnel me-2"></i>
            Apply Filters
          </button>
          <button class="btn btn-outline-secondary" id="resetFiltersBtn">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Set up event listeners
  const dateRangeSelect = document.getElementById('dateRangeSelect');
  const customDateRange = document.getElementById('customDateRange');
  const statusAll = document.getElementById('statusAll');
  const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
  const filterBody = document.getElementById('filterBody');
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  
  // Toggle custom date range based on selection
  dateRangeSelect.addEventListener('change', () => {
    customDateRange.style.display = dateRangeSelect.value === 'custom' ? 'block' : 'none';
  });
  
  // Handle "All" status checkbox
  statusAll.addEventListener('change', () => {
    const statusCheckboxes = document.querySelectorAll('#statusFilter input[type="checkbox"]:not(#statusAll)');
    statusCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
      checkbox.disabled = statusAll.checked;
    });
  });
  
  // Handle individual status checkboxes
  document.querySelectorAll('#statusFilter input[type="checkbox"]:not(#statusAll)').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const anyStatusChecked = Array.from(document.querySelectorAll('#statusFilter input[type="checkbox"]:not(#statusAll)')).some(cb => cb.checked);
      statusAll.checked = !anyStatusChecked;
    });
  });
  
  // Toggle filters visibility
  toggleFiltersBtn.addEventListener('click', () => {
    if (filterBody.style.display === 'none') {
      filterBody.style.display = 'block';
      toggleFiltersBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
    } else {
      filterBody.style.display = 'none';
      toggleFiltersBtn.innerHTML = '<i class="bi bi-chevron-down"></i>';
    }
  });
  
  // Apply filters
  applyFiltersBtn.addEventListener('click', () => {
    const filters = getFilters();
    if (onFilterChange) {
      onFilterChange(filters);
    }
  });
  
  // Reset filters
  resetFiltersBtn.addEventListener('click', () => {
    resetFilters();
    if (onFilterChange) {
      onFilterChange(getFilters());
    }
  });
  
  // Set initial filters if provided
  if (initialFilters && Object.keys(initialFilters).length > 0) {
    setFilters(initialFilters);
  }
  
  // Helper function to get current filters
  function getFilters() {
    // Process date range
    const dateRange = dateRangeSelect.value;
    let startDate = null;
    let endDate = null;
    
    if (dateRange === 'custom') {
      startDate = document.getElementById('startDateInput').value ? new Date(document.getElementById('startDateInput').value) : null;
      endDate = document.getElementById('endDateInput').value ? new Date(document.getElementById('endDateInput').value) : null;
      
      // Set end date to end of day
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }
    } else {
      const dates = getDateRangeFromSelection(dateRange);
      startDate = dates.startDate;
      endDate = dates.endDate;
    }
    
    // Process status filters
    const statusFilters = [];
    
    if (!statusAll.checked) {
      const statusCheckboxes = document.querySelectorAll('#statusFilter input[type="checkbox"]:not(#statusAll):checked');
      statusFilters.push(...Array.from(statusCheckboxes).map(checkbox => checkbox.id.replace('status', '').toLowerCase()));
    }
    
    // Get other filters
    const technician = document.getElementById('technicianSelect').value;
    const client = document.getElementById('clientSelect').value;
    const minComponents = document.getElementById('minComponentsInput').value;
    const maxComponents = document.getElementById('maxComponentsInput').value;
    const timeGrouping = document.getElementById('timeGroupingSelect').value;
    
    return {
      dateRange,
      startDate,
      endDate,
      status: statusFilters.length > 0 ? statusFilters : null,
      technician: technician !== 'all' ? technician : null,
      client: client !== 'all' ? client : null,
      minComponents: minComponents ? parseInt(minComponents) : null,
      maxComponents: maxComponents ? parseInt(maxComponents) : null,
      timeGrouping
    };
  }
  
  // Helper function to reset filters
  function resetFilters() {
    // Reset date range
    dateRangeSelect.value = 'all';
    customDateRange.style.display = 'none';
    document.getElementById('startDateInput').value = '';
    document.getElementById('endDateInput').value = '';
    
    // Reset status filters
    statusAll.checked = true;
    document.querySelectorAll('#statusFilter input[type="checkbox"]:not(#statusAll)').forEach(checkbox => {
      checkbox.checked = false;
      checkbox.disabled = true;
    });
    
    // Reset dropdown filters
    document.getElementById('technicianSelect').value = 'all';
    document.getElementById('clientSelect').value = 'all';
    
    // Reset component count filters
    document.getElementById('minComponentsInput').value = '';
    document.getElementById('maxComponentsInput').value = '';
    
    // Reset time grouping
    document.getElementById('timeGroupingSelect').value = 'month';
  }
  
  // Helper function to set filters
  function setFilters(filters) {
    if (filters.dateRange) {
      dateRangeSelect.value = filters.dateRange;
      
      if (filters.dateRange === 'custom') {
        customDateRange.style.display = 'block';
        
        if (filters.startDate) {
          document.getElementById('startDateInput').value = formatDateForInput(filters.startDate);
        }
        
        if (filters.endDate) {
          document.getElementById('endDateInput').value = formatDateForInput(filters.endDate);
        }
      }
    }
    
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      statusAll.checked = false;
      
      document.querySelectorAll('#statusFilter input[type="checkbox"]:not(#statusAll)').forEach(checkbox => {
        const statusValue = checkbox.id.replace('status', '').toLowerCase();
        checkbox.checked = filters.status.includes(statusValue);
        checkbox.disabled = false;
      });
    }
    
    if (filters.technician) {
      const techSelect = document.getElementById('technicianSelect');
      if (Array.from(techSelect.options).some(option => option.value === filters.technician)) {
        techSelect.value = filters.technician;
      }
    }
    
    if (filters.client) {
      const clientSelect = document.getElementById('clientSelect');
      if (Array.from(clientSelect.options).some(option => option.value === filters.client)) {
        clientSelect.value = filters.client;
      }
    }
    
    if (filters.minComponents !== null && filters.minComponents !== undefined) {
      document.getElementById('minComponentsInput').value = filters.minComponents;
    }
    
    if (filters.maxComponents !== null && filters.maxComponents !== undefined) {
      document.getElementById('maxComponentsInput').value = filters.maxComponents;
    }
    
    if (filters.timeGrouping) {
      document.getElementById('timeGroupingSelect').value = filters.timeGrouping;
    }
  }
  
  // Helper function to get date range from selection
  function getDateRangeFromSelection(selection) {
    const now = new Date();
    let startDate = null;
    let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    
    switch (selection) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
      case 'last7days':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        break;
      case 'last30days':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      default:
        startDate = null;
        endDate = null;
    }
    
    return { startDate, endDate };
  }
  
  // Helper function to format date for input element
  function formatDateForInput(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  // Return public API
  return {
    getFilters,
    setFilters,
    resetFilters,
    
    // Update technician options
    updateTechnicians: function(technicians) {
      const techSelect = document.getElementById('technicianSelect');
      const currentValue = techSelect.value;
      
      // Clear existing options except the first one
      while (techSelect.options.length > 1) {
        techSelect.remove(1);
      }
      
      // Add new options
      technicians.forEach(tech => {
        if (!tech) return; // Skip empty values
        
        const option = document.createElement('option');
        option.value = tech;
        option.textContent = tech;
        techSelect.appendChild(option);
      });
      
      // Restore selected value if it still exists
      if (currentValue !== 'all' && Array.from(techSelect.options).some(option => option.value === currentValue)) {
        techSelect.value = currentValue;
      }
    },
    
    // Update client options
    updateClients: function(clients) {
      const clientSelect = document.getElementById('clientSelect');
      const currentValue = clientSelect.value;
      
      // Clear existing options except the first one
      while (clientSelect.options.length > 1) {
        clientSelect.remove(1);
      }
      
      // Add new options
      clients.forEach(client => {
        if (!client) return; // Skip empty values
        
        const option = document.createElement('option');
        option.value = client;
        option.textContent = client;
        clientSelect.appendChild(option);
      });
      
      // Restore selected value if it still exists
      if (currentValue !== 'all' && Array.from(clientSelect.options).some(option => option.value === currentValue)) {
        clientSelect.value = currentValue;
      }
    }
  };
}