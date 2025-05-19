// src/bi/components/data-tables.js - Enhanced version
/**
 * Creates a modern, sortable data table with all features
 * @param {string} containerId - ID of the container element
 * @param {Array} data - Array of data objects to display
 * @param {Array} columns - Array of column configuration objects
 * @param {Object} options - Additional options for the table
 * @returns {HTMLElement} - The created table element
 */
export function createDataTable(containerId, data, columns, options = {}) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container with ID ${containerId} not found`);
    return;
  }
  
  // Clear previous content
  container.innerHTML = '';
  
  // Create wrapper with card styling
  const wrapper = document.createElement('div');
  wrapper.className = 'table-responsive';
  
  // Add title if provided
  if (options.title) {
    const titleSection = document.createElement('div');
    titleSection.className = 'table-title px-3 py-2 bg-light border-bottom';
    titleSection.innerHTML = `<h6 class="mb-0">${options.title}</h6>`;
    wrapper.appendChild(titleSection);
  }
  
  // Create the table element
  const table = document.createElement('table');
  table.className = options.tableClass || 'table table-striped table-hover align-middle mb-0';
  
  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.className = 'table-light';
  
  columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column.title;
    th.style.position = 'relative';
    
    if (column.width) {
      th.style.width = column.width;
    }
    
    if (column.sortable) {
      th.classList.add('sortable');
      th.style.cursor = 'pointer';
      
      // Add sort indicator
      th.innerHTML = `
        ${column.title}
        <span class="sort-indicator ms-1 opacity-50">
          <i class="bi bi-arrow-down-up"></i>
        </span>
      `;
      
      th.addEventListener('click', () => sortTable(table, column.field));
    }
    
    headerRow.appendChild(th);
  });
  
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create table body
  const tbody = document.createElement('tbody');
  
  // Add data rows
  data.forEach((item, index) => {
    const row = document.createElement('tr');
    
    // Add hover effect for clickable rows
    if (options.onRowClick) {
      row.style.cursor = 'pointer';
      row.classList.add('hoverable-row');
    }
    
    // Add striping effect
    if (index % 2 === 1) {
      row.classList.add('table-striped-row');
    }
    
    columns.forEach(column => {
      const cell = document.createElement('td');
      
      // Get cell value using field accessor
      let value = item[column.field];
      
      // Apply formatter if provided
      if (column.formatter) {
        value = column.formatter(value, item);
      }
      
      // Set cell content
      if (column.html) {
        cell.innerHTML = value;
      } else {
        cell.textContent = value;
      }
      
      // Add custom classes if specified
      if (column.cellClass) {
        cell.className = column.cellClass;
      }
      
      row.appendChild(cell);
    });
    
    // Add row click handler if provided
    if (options.onRowClick) {
      row.addEventListener('click', () => options.onRowClick(item));
    }
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  wrapper.appendChild(table);
  
  // Create empty state if no data
  if (data.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'text-center p-4 text-muted';
    emptyState.innerHTML = `
      <div class="mb-3">
        <i class="bi bi-inbox fs-1 opacity-50"></i>
      </div>
      <h5>No data to display</h5>
      <p class="mb-0">There are no records matching the current criteria.</p>
    `;
    wrapper.innerHTML = '';
    wrapper.appendChild(emptyState);
  }
  
  container.appendChild(wrapper);
  
  // Initialize table pagination if needed
  if (options.pagination && data.length > options.pagination.rowsPerPage) {
    createTablePagination(wrapper, table, options.pagination);
  }
  
  // Add custom styles for table
  addTableStyles();
  
  return table;
}

/**
 * Sort table by column
 * @param {HTMLElement} table - The table element
 * @param {string} field - The field to sort by
 */
function sortTable(table, field) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const headers = Array.from(table.querySelectorAll('th.sortable'));
  
  // Find the header element for this field
  const headerEl = headers.find(th => 
    th.textContent.toLowerCase().includes(field.toLowerCase()) ||
    th.dataset.field === field
  );
  
  if (!headerEl) return;
  
  // Toggle sort direction
  const currentDir = headerEl.dataset.sortDirection || 'asc';
  const newDir = currentDir === 'asc' ? 'desc' : 'asc';
  
  // Reset all headers
  headers.forEach(th => {
    th.dataset.sortDirection = '';
    const indicator = th.querySelector('.sort-indicator');
    if (indicator) {
      indicator.innerHTML = '<i class="bi bi-arrow-down-up"></i>';
      indicator.classList.add('opacity-50');
    }
  });
  
  // Set new sort direction
  headerEl.dataset.sortDirection = newDir;
  const indicator = headerEl.querySelector('.sort-indicator');
  if (indicator) {
    indicator.innerHTML = newDir === 'asc' ? 
      '<i class="bi bi-arrow-up"></i>' : 
      '<i class="bi bi-arrow-down"></i>';
    indicator.classList.remove('opacity-50');
  }
  
  // Sort the rows
  rows.sort((a, b) => {
    const aValue = getCellValue(a, field);
    const bValue = getCellValue(b, field);
    
    // Compare values
    if (aValue < bValue) return newDir === 'asc' ? -1 : 1;
    if (aValue > bValue) return newDir === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Reorder rows
  rows.forEach(row => tbody.appendChild(row));
}

/**
 * Get cell value for sorting
 * @param {HTMLElement} row - The table row
 * @param {string} field - The field to get
 * @returns {string} - The cell value
 */
function getCellValue(row, field) {
  const cells = row.querySelectorAll('td');
  const index = Array.from(row.parentNode.parentNode.querySelector('thead tr').cells)
    .findIndex(cell => 
      cell.textContent.toLowerCase().includes(field.toLowerCase()) || 
      cell.dataset.field === field
    );
  
  if (index === -1) return '';
  
  const cell = cells[index];
  return cell.textContent.trim();
}

/**
 * Create pagination for a table
 * @param {HTMLElement} wrapper - The table wrapper element
 * @param {HTMLElement} table - The table element
 * @param {Object} options - Pagination options
 */
function createTablePagination(wrapper, table, options) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const rowsPerPage = options.rowsPerPage || 10;
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  
  let currentPage = 1;
  
  // Create pagination container
  const paginationEl = document.createElement('nav');
  paginationEl.setAttribute('aria-label', 'Table pagination');
  paginationEl.className = 'mt-3 d-flex justify-content-between align-items-center px-3 py-2 border-top';
  
  // Create page info element
  const pageInfoEl = document.createElement('div');
  pageInfoEl.className = 'pagination-info text-muted small';
  
  // Create pagination logic
  function showPage(page) {
    currentPage = page;
    
    // Hide all rows
    rows.forEach(row => row.style.display = 'none');
    
    // Show rows for current page
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, rows.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      rows[i].style.display = '';
    }
    
    // Update page info
    pageInfoEl.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${rows.length} entries`;
    
    // Update pagination UI
    updatePagination();
  }
  
  // Update pagination links
  function updatePagination() {
    // Create pagination list
    const ul = document.createElement('ul');
    ul.className = 'pagination pagination-sm mb-0';
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    
    const prevLink = document.createElement('a');
    prevLink.className = 'page-link';
    prevLink.href = '#';
    prevLink.setAttribute('aria-label', 'Previous');
    prevLink.innerHTML = '<span aria-hidden="true">&laquo;</span>';
    prevLink.addEventListener('click', e => {
      e.preventDefault();
      if (currentPage > 1) showPage(currentPage - 1);
    });
    
    prevLi.appendChild(prevLink);
    ul.appendChild(prevLi);
    
    // Page links
    const maxVisiblePages = 5;
    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === currentPage ? 'active' : ''}`;
      
      const link = document.createElement('a');
      link.className = 'page-link';
      link.href = '#';
      link.textContent = i;
      link.addEventListener('click', e => {
        e.preventDefault();
        showPage(i);
      });
      
      li.appendChild(link);
      ul.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    
    const nextLink = document.createElement('a');
    nextLink.className = 'page-link';
    nextLink.href = '#';
    nextLink.setAttribute('aria-label', 'Next');
    nextLink.innerHTML = '<span aria-hidden="true">&raquo;</span>';
    nextLink.addEventListener('click', e => {
      e.preventDefault();
      if (currentPage < totalPages) showPage(currentPage + 1);
    });
    
    nextLi.appendChild(nextLink);
    ul.appendChild(nextLi);
    
    // Update pagination element
    const paginationControls = document.createElement('div');
    paginationControls.appendChild(ul);
    
    // Update pagination container
    paginationEl.innerHTML = '';
    paginationEl.appendChild(pageInfoEl);
    paginationEl.appendChild(paginationControls);
  }
  
  // Append pagination container
  wrapper.appendChild(paginationEl);
  
  // Show first page
  showPage(1);
}

/**
 * Add custom styles for tables
 */
function addTableStyles() {
  // Check if styles already exist
  if (document.getElementById('table-custom-styles')) return;
  
  // Create style element
  const style = document.createElement('style');
  style.id = 'table-custom-styles';
  style.textContent = `
    .table-title {
      background-color: var(--bs-light);
      border-bottom: 1px solid var(--bs-border-color);
    }
    
    .table th.sortable {
      white-space: nowrap;
    }
    
    .table th.sortable .sort-indicator {
      display: inline-block;
      vertical-align: middle;
    }
    
    .hoverable-row:hover {
      background-color: rgba(13, 110, 253, 0.1) !important;
    }
    
    .pagination-info {
      color: var(--bs-secondary);
    }
    
    /* Status badges */
    .status-badge {
      display: inline-block;
      padding: 0.25em 0.6em;
      font-size: 0.75em;
      font-weight: 700;
      border-radius: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    /* Dark mode compatibility */
    [data-theme="dark"] .table-title,
    [data-theme="dark"] .pagination-info {
      background-color: #2b3035 !important;
      color: #adb5bd !important;
    }
    
    [data-theme="dark"] .hoverable-row:hover {
      background-color: rgba(13, 110, 253, 0.2) !important;
    }
  `;
  
  // Add to document
  document.head.appendChild(style);
}

/**
 * Creates a technician performance table with enhanced styling
 * @param {string} containerId - ID of the container element
 * @param {Object} technicianData - Technician performance data
 * @returns {HTMLElement} - The created table
 */
export function createTechnicianTable(containerId, technicianData) {
  // Convert object to array data
  const tableData = Object.entries(technicianData)
    .filter(([name]) => name && name.trim()) // Filter out empty names
    .map(([name, data]) => ({
      name,
      totalReports: data.totalReports,
      submitted: data.statusCounts.submitted || 0,
      reviewed: data.statusCounts.reviewed || 0,
      approved: data.statusCounts.approved || 0,
      avgDays: data.avgCompletionDays,
      components: data.componentsDocumented,
      avgComponents: data.avgComponentsPerReport,
      mostRecent: data.mostRecentReport ? new Date(data.mostRecentReport.createdAt) : null
    }))
    .sort((a, b) => b.totalReports - a.totalReports); // Sort by total reports desc
  
  const columns = [
    { 
      field: 'name', 
      title: 'Technician', 
      sortable: true,
      formatter: (value) => {
        // Create initials from name
        const initials = value.split(' ')
          .map(part => part.charAt(0).toUpperCase())
          .join('')
          .substring(0, 2);
          
        return `
          <div class="d-flex align-items-center">
            <div class="avatar avatar-sm me-2 bg-primary text-white" data-initial="${initials}"></div>
            <div>${value}</div>
          </div>
        `;
      },
      html: true
    },
    { 
      field: 'totalReports', 
      title: 'Total', 
      sortable: true,
      formatter: (value) => `<span class="fw-bold">${value}</span>`,
      html: true
    },
    { 
      field: 'submitted', 
      title: 'Submitted', 
      sortable: true,
      formatter: (value) => `<span class="text-primary">${value}</span>`,
      html: true
    },
    { 
      field: 'reviewed', 
      title: 'Reviewed', 
      sortable: true,
      formatter: (value) => `<span class="text-info">${value}</span>`,
      html: true
    },
    { 
      field: 'approved', 
      title: 'Approved', 
      sortable: true,
      formatter: (value) => `<span class="text-success">${value}</span>`,
      html: true
    },
    { 
      field: 'avgDays', 
      title: 'Avg. Days', 
      sortable: true,
      formatter: value => `<span class="small">${value.toFixed(1)}</span>`,
      html: true
    },
    { 
      field: 'components', 
      title: 'Components', 
      sortable: true
    },
    { 
      field: 'avgComponents', 
      title: 'Avg. Components', 
      sortable: true,
      formatter: value => value.toFixed(1)
    },
    { 
      field: 'mostRecent', 
      title: 'Last Activity', 
      sortable: true,
      formatter: value => {
        if (!value) return 'Never';
        
        // Format date
        const now = new Date();
        const diff = now - value;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        
        return value.toLocaleDateString();
      }
    }
  ];
  
  return createDataTable(containerId, tableData, columns, {
    pagination: { rowsPerPage: 5 }
  });
}

/**
 * Creates a report summary table with enhanced styling
 * @param {string} containerId - ID of the container element
 * @param {Array} reports - Array of report data
 * @returns {HTMLElement} - The created table
 */
export function createReportSummaryTable(containerId, reports) {
  const tableData = reports.map(report => ({
    id: report.id,
    clientName: report.clientName || 'Unknown',
    technicianName: report.technicianName || 'Unassigned',
    status: report.status,
    createdAt: new Date(report.createdAt),
    submittedAt: report.submittedAt ? new Date(report.submittedAt) : null,
    components: calculateTotalComponents(report),
    location: report.location || 'Unknown'
  }));
  
  const columns = [
    { 
      field: 'clientName', 
      title: 'Client', 
      sortable: true,
      formatter: (value, row) => `
        <div class="fw-medium">${value}</div>
        <div class="text-muted small">${row.location}</div>
      `,
      html: true
    },
    { 
      field: 'technicianName', 
      title: 'Technician', 
      sortable: true
    },
    { 
      field: 'status', 
      title: 'Status', 
      sortable: true,
      formatter: value => {
        const statusLabels = {
          draft: 'Draft',
          submitted: 'Submitted',
          reviewed: 'Reviewed',
          approved: 'Approved'
        };
        
        const statusColors = {
          draft: 'secondary',
          submitted: 'primary',
          reviewed: 'info',
          approved: 'success'
        };
        
        const label = statusLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);
        const color = statusColors[value] || 'secondary';
        
        return `<span class="status-badge bg-${color} bg-opacity-10 text-${color}">${label}</span>`;
      },
      html: true
    },
    { 
      field: 'createdAt', 
      title: 'Created', 
      sortable: true,
      formatter: value => {
        const formattedDate = value.toLocaleDateString();
        const formattedTime = value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
          <div>${formattedDate}</div>
          <small class="text-muted">${formattedTime}</small>
        `;
      },
      html: true
    },
    { 
      field: 'components', 
      title: 'Components', 
      sortable: true,
      formatter: value => `<span class="badge bg-light text-dark">${value}</span>`,
      html: true
    },
    {
      field: 'actions',
      title: 'Actions',
      formatter: (value, row) => `
        <div class="d-flex gap-1 justify-content-end">
          <button class="btn btn-sm btn-outline-primary view-report-btn" data-id="${row.id}" data-bs-toggle="tooltip" title="View Details">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary download-pdf-btn" data-id="${row.id}" data-bs-toggle="tooltip" title="Download PDF">
            <i class="bi bi-download"></i>
          </button>
        </div>
      `,
      html: true
    }
  ];
  
  const table = createDataTable(containerId, tableData, columns, {
    pagination: { rowsPerPage: 10 }
  });
  
  // Add event handlers for buttons
  document.querySelectorAll('.view-report-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const reportId = btn.getAttribute('data-id');
      console.log(`View report details for ID: ${reportId}`);
      // Implementation would go here
    });
  });
  
  document.querySelectorAll('.download-pdf-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const reportId = btn.getAttribute('data-id');
      console.log(`Download PDF for report ID: ${reportId}`);
      // Call the download function from pdf.js
      try {
        downloadReportPdf(reportId);
      } catch (error) {
        console.error('Error initiating PDF download:', error);
      }
    });
  });
  
  return table;
}

/**
 * Count the total components in a report
 * @param {Object} report - The report object
 * @returns {number} - The total number of components
 */
function calculateTotalComponents(report) {
  if (!report.floors) return 0;
  
  let total = 0;
  const componentTypes = [
    'networkCabinets', 'perforations', 'accessTraps', 'cablePaths',
    'cableTrunkings', 'conduits', 'copperCablings', 'fiberOpticCablings',
    'customComponents'
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
 * Download a report as PDF
 * This is a stub function that should be implemented in the main application
 * @param {string} reportId - The ID of the report to download
 */
function downloadReportPdf(reportId) {
  // This should be replaced with an actual implementation
  console.log(`Downloading PDF for report ID: ${reportId}`);
  
  // Typically, this would navigate to the reports module and call its downloadReportPdf function
  if (typeof window.downloadReportPdf === 'function') {
    window.downloadReportPdf(reportId);
  } else {
    // Show notification toast if toast function is defined
    if (typeof window.showNotification === 'function') {
      window.showNotification(
        'PDF Download', 
        'PDF download feature is being initialized...', 
        'info'
      );
    }
    
    // Dispatch a custom event that the main application can listen for
    const event = new CustomEvent('downloadReport', { 
      detail: { reportId, format: 'pdf' } 
    });
    document.dispatchEvent(event);
  }
}