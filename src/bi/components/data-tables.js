// src/bi/components/data-tables.js

/**
 * Creates a modern, interactive data table for the BI dashboard
 * @param {string} containerId - ID of the container element
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column configuration array
 * @param {Object} options - Additional table options
 * @returns {Object} - Table API
 */
export function createDataTable(containerId, data, columns, options = {}) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error(`Container element with ID "${containerId}" not found`);
    return null;
  }
  
  // Default options
  const defaultOptions = {
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    sortable: true,
    searchable: true,
    responsive: true,
    showPagination: true,
    showInfo: true,
    emptyMessage: 'No data available',
    tableClass: 'table table-hover',
    onRowClick: null,
    title: null,
    exportable: false
  };
  
  // Merge default options with user options
  const tableOptions = { ...defaultOptions, ...options };
  
  // Component state
  let tableState = {
    currentPage: 1,
    pageSize: tableOptions.pageSize,
    totalPages: Math.ceil(data.length / tableOptions.pageSize),
    sortColumn: null,
    sortDirection: 'asc',
    searchTerm: '',
    filteredData: [...data]
  };
  
  // Generate unique table ID
  const tableId = `data-table-${Math.random().toString(36).substr(2, 9)}`;
  
  // Create table container
  container.innerHTML = `
    <div class="data-table-container">
      ${tableOptions.title ? `<h5 class="data-table-title mb-3">${tableOptions.title}</h5>` : ''}
      
      <div class="data-table-toolbar mb-3">
        <div class="row align-items-center">
          ${tableOptions.searchable ? `
            <div class="col-md-6 mb-2 mb-md-0">
              <div class="input-group search-box">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Search..." id="${tableId}-search">
              </div>
            </div>
          ` : ''}
          
          <div class="col-md-${tableOptions.searchable ? '6' : '12'}">
            <div class="d-flex justify-content-${tableOptions.searchable ? 'end' : 'between'} align-items-center">
              ${tableOptions.showInfo ? `
                <div class="table-info me-3">
                  <span id="${tableId}-info">Showing 0 to 0 of 0 entries</span>
                </div>
              ` : ''}
              
              <div class="page-size-selector">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Show</span>
                  <select class="form-select form-select-sm" id="${tableId}-page-size">
                    ${tableOptions.pageSizeOptions.map(size => 
                      `<option value="${size}" ${size === tableOptions.pageSize ? 'selected' : ''}>${size}</option>`
                    ).join('')}
                  </select>
                </div>
              </div>
              
              ${tableOptions.exportable ? `
                <div class="ms-3">
                  <button class="btn btn-sm btn-outline-primary" id="${tableId}-export">
                    <i class="bi bi-download me-1"></i> Export
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
      
      <div class="table-responsive">
        <table id="${tableId}" class="${tableOptions.tableClass}">
          <thead>
            <tr>
              ${columns.map(column => `
                <th 
                  class="${column.sortable !== false && tableOptions.sortable ? 'sortable' : ''} ${column.headerClass || ''}"
                  data-field="${column.field}"
                  style="${column.width ? `width: ${column.width};` : ''}"
                >
                  ${column.title}
                  ${column.sortable !== false && tableOptions.sortable ? 
                    `<i class="bi bi-arrow-down-up sort-icon"></i>` : 
                    ''}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody id="${tableId}-body">
            <!-- Table rows will be inserted here -->
          </tbody>
        </table>
      </div>
      
      ${tableOptions.showPagination ? `
        <div class="data-table-pagination mt-3">
          <div class="row align-items-center">
            <div class="col-md-6 text-md-start text-center mb-2 mb-md-0">
              <span id="${tableId}-page-info">Showing page 0 of 0</span>
            </div>
            <div class="col-md-6">
              <nav aria-label="Table navigation">
                <ul class="pagination pagination-sm justify-content-md-end justify-content-center mb-0" id="${tableId}-pagination">
                  <!-- Pagination will be inserted here -->
                </ul>
              </nav>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
  
  // Get table elements
  const searchInput = document.getElementById(`${tableId}-search`);
  const pageSizeSelect = document.getElementById(`${tableId}-page-size`);
  const tableBody = document.getElementById(`${tableId}-body`);
  const tableInfo = document.getElementById(`${tableId}-info`);
  const pageInfo = document.getElementById(`${tableId}-page-info`);
  const pagination = document.getElementById(`${tableId}-pagination`);
  const exportBtn = document.getElementById(`${tableId}-export`);
  const tableSortHeaders = document.querySelectorAll(`#${tableId} th.sortable`);
  
  // Add event listeners
  if (tableOptions.searchable && searchInput) {
    searchInput.addEventListener('input', e => {
      tableState.searchTerm = e.target.value.toLowerCase();
      tableState.currentPage = 1;
      filterAndRenderTable();
    });
  }
  
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', e => {
      tableState.pageSize = parseInt(e.target.value);
      tableState.currentPage = 1;
      tableState.totalPages = Math.ceil(tableState.filteredData.length / tableState.pageSize);
      renderTable();
    });
  }
  
  if (tableOptions.sortable) {
    tableSortHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const field = header.getAttribute('data-field');
        
        // Toggle sort direction if clicking on the same column
        if (tableState.sortColumn === field) {
          tableState.sortDirection = tableState.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          tableState.sortColumn = field;
          tableState.sortDirection = 'asc';
        }
        
        // Reset all sort icons
        tableSortHeaders.forEach(h => {
          h.querySelector('.sort-icon').className = 'bi bi-arrow-down-up sort-icon';
        });
        
        // Update current sort icon
        header.querySelector('.sort-icon').className = `bi bi-arrow-${tableState.sortDirection === 'asc' ? 'up' : 'down'} sort-icon`;
        
        filterAndRenderTable();
      });
    });
  }
  
  if (tableOptions.exportable && exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportTableData(tableState.filteredData);
    });
  }
  
  // Initial render
  filterAndRenderTable();
  
  /**
   * Filter, sort and render the table
   */
  function filterAndRenderTable() {
    // 1. Filter data
    if (tableState.searchTerm) {
      tableState.filteredData = data.filter(item => {
        return columns.some(column => {
          const value = getNestedValue(item, column.field);
          return value != null && 
            value.toString().toLowerCase().includes(tableState.searchTerm);
        });
      });
    } else {
      tableState.filteredData = [...data];
    }
    
    // 2. Sort data if needed
    if (tableState.sortColumn) {
      tableState.filteredData.sort((a, b) => {
        const aValue = getNestedValue(a, tableState.sortColumn);
        const bValue = getNestedValue(b, tableState.sortColumn);
        
        // Handle null or undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        // Compare based on value type
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return tableState.sortDirection === 'asc' ? comparison : -comparison;
        } else {
          // Numeric comparison
          const comparison = aValue - bValue;
          return tableState.sortDirection === 'asc' ? comparison : -comparison;
        }
      });
    }
    
    // 3. Update pagination state
    tableState.totalPages = Math.ceil(tableState.filteredData.length / tableState.pageSize);
    
    // Ensure current page is in valid range
    if (tableState.currentPage > tableState.totalPages) {
      tableState.currentPage = Math.max(1, tableState.totalPages);
    }
    
    // 4. Render table
    renderTable();
  }
  
  /**
   * Render the table with current state
   */
  function renderTable() {
    // Calculate indices for current page
    const start = (tableState.currentPage - 1) * tableState.pageSize;
    const end = Math.min(start + tableState.pageSize, tableState.filteredData.length);
    const pageData = tableState.filteredData.slice(start, end);
    
    // Render table body
    if (pageData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="${columns.length}" class="text-center py-4">
            <div class="empty-state">
              <i class="bi bi-inbox fs-1 mb-3 text-muted"></i>
              <h6>${tableOptions.emptyMessage}</h6>
              ${tableState.searchTerm ? `<p class="text-muted">Try changing your search criteria</p>` : ''}
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = pageData.map(item => {
        const rowHtml = `
          <tr class="${tableOptions.onRowClick ? 'cursor-pointer' : ''}">
            ${columns.map(column => {
              let cellContent = '';
              
              // Get cell value
              const value = getNestedValue(item, column.field);
              
              // Format the value based on column configuration
              if (column.formatter) {
                cellContent = column.formatter(value, item);
              } else {
                cellContent = value != null ? value : '';
              }
              
              return `<td class="${column.cellClass || ''}" ${column.align ? `style="text-align:${column.align}"` : ''}>
                ${column.html ? cellContent : escapeHtml(cellContent)}
              </td>`;
            }).join('')}
          </tr>
        `;
        
        return rowHtml;
      }).join('');
      
      // Add row click handlers if needed
      if (tableOptions.onRowClick) {
        tableBody.querySelectorAll('tr').forEach((row, index) => {
          row.addEventListener('click', () => {
            tableOptions.onRowClick(pageData[index]);
          });
        });
      }
    }
    
    // Update pagination
    if (tableOptions.showPagination && pagination) {
      renderPagination();
    }
    
    // Update info text
    if (tableOptions.showInfo && tableInfo) {
      if (tableState.filteredData.length === 0) {
        tableInfo.textContent = 'Showing 0 to 0 of 0 entries';
      } else {
        tableInfo.textContent = `Showing ${start + 1} to ${end} of ${tableState.filteredData.length} entries`;
      }
    }
    
    // Update page info
    if (pageInfo) {
      pageInfo.textContent = `Showing page ${tableState.currentPage} of ${tableState.totalPages}`;
    }
  }
  
  /**
   * Render pagination controls
   */
  function renderPagination() {
    // Don't show pagination if there's only one page
    if (tableState.totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }
    
    // Calculate page numbers to show (always show first, last, current, and pages around current)
    const maxVisiblePages = 5;
    let pagesToShow = [];
    
    if (tableState.totalPages <= maxVisiblePages) {
      // Show all pages
      pagesToShow = Array.from({ length: tableState.totalPages }, (_, i) => i + 1);
    } else {
      // Always include first and last page
      pagesToShow.push(1);
      
      // Calculate range around current page
      let rangeStart = Math.max(2, tableState.currentPage - 1);
      let rangeEnd = Math.min(tableState.totalPages - 1, tableState.currentPage + 1);
      
      // Adjust range to show maxVisiblePages - 2 pages (excluding first and last)
      while (rangeEnd - rangeStart + 1 < maxVisiblePages - 2) {
        if (rangeStart > 2) {
          rangeStart--;
        } else if (rangeEnd < tableState.totalPages - 1) {
          rangeEnd++;
        } else {
          break;
        }
      }
      
      // Add ellipsis if needed
      if (rangeStart > 2) {
        pagesToShow.push('...');
      }
      
      // Add pages in range
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pagesToShow.push(i);
      }
      
      // Add ellipsis if needed
      if (rangeEnd < tableState.totalPages - 1) {
        pagesToShow.push('...');
      }
      
      // Add last page if not already included
      if (tableState.totalPages > 1) {
        pagesToShow.push(tableState.totalPages);
      }
    }
    
    // Create pagination HTML
    const paginationHtml = `
      <li class="page-item ${tableState.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="prev" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      ${pagesToShow.map(page => {
        if (page === '...') {
          return `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        return `
          <li class="page-item ${page === tableState.currentPage ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${page}">${page}</a>
          </li>
        `;
      }).join('')}
      <li class="page-item ${tableState.currentPage === tableState.totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="next" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;
    
    pagination.innerHTML = paginationHtml;
    
    // Add click handlers to pagination links
    pagination.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        
        const page = link.getAttribute('data-page');
        
        if (page === 'prev') {
          if (tableState.currentPage > 1) {
            tableState.currentPage--;
            renderTable();
          }
        } else if (page === 'next') {
          if (tableState.currentPage < tableState.totalPages) {
            tableState.currentPage++;
            renderTable();
          }
        } else {
          const pageNum = parseInt(page);
          if (pageNum !== tableState.currentPage) {
            tableState.currentPage = pageNum;
            renderTable();
          }
        }
      });
    });
  }
  
  /**
   * Export table data to CSV
   * @param {Array} data - Data to export
   */
  function exportTableData(data) {
    // Create CSV content
    let csvContent = '';
    
    // Add header row
    csvContent += columns.map(column => `"${column.title}"`).join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const row = columns.map(column => {
        const value = getNestedValue(item, column.field);
        const formattedValue = column.formatter ? column.formatter(value, item, false) : value;
        
        // Handle string formatting for CSV
        return `"${formattedValue != null ? formattedValue.toString().replace(/"/g, '""') : ''}"`;
      }).join(',');
      
      csvContent += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableOptions.title || 'export'}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Get nested property value from an object
   * @param {Object} obj - Object to get value from
   * @param {string} path - Property path (e.g. "user.address.city")
   * @returns {*} - Property value
   */
  function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    
    // Handle nested properties (e.g. "user.name")
    const props = path.split('.');
    let value = obj;
    
    for (const prop of props) {
      if (value == null || typeof value !== 'object') {
        return null;
      }
      value = value[prop];
    }
    
    return value;
  }
  
  /**
   * Escape HTML special characters
   * @param {string} html - String to escape
   * @returns {string} - Escaped string
   */
  function escapeHtml(html) {
    if (html == null) return '';
    
    const htmlStr = html.toString();
    return htmlStr
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  // Public API
  return {
    // Refresh table with new data
    setData: function(newData) {
      data = [...newData];
      tableState.currentPage = 1;
      filterAndRenderTable();
    },
    
    // Get current data
    getData: function() {
      return [...data];
    },
    
    // Get filtered data
    getFilteredData: function() {
      return [...tableState.filteredData];
    },
    
    // Get current page data
    getCurrentPageData: function() {
      const start = (tableState.currentPage - 1) * tableState.pageSize;
      const end = Math.min(start + tableState.pageSize, tableState.filteredData.length);
      return tableState.filteredData.slice(start, end);
    },
    
    // Refresh table display
    refresh: function() {
      filterAndRenderTable();
    },
    
    // Set search term
    search: function(term) {
      if (searchInput) {
        searchInput.value = term;
      }
      tableState.searchTerm = term.toLowerCase();
      tableState.currentPage = 1;
      filterAndRenderTable();
    },
    
    // Sort table by column
    sort: function(column, direction = 'asc') {
      tableState.sortColumn = column;
      tableState.sortDirection = direction;
      
      // Update sort icons
      tableSortHeaders.forEach(header => {
        const field = header.getAttribute('data-field');
        const icon = header.querySelector('.sort-icon');
        
        if (field === column) {
          icon.className = `bi bi-arrow-${direction === 'asc' ? 'up' : 'down'} sort-icon`;
        } else {
          icon.className = 'bi bi-arrow-down-up sort-icon';
        }
      });
      
      filterAndRenderTable();
    },
    
    // Go to specific page
    goToPage: function(page) {
      if (page >= 1 && page <= tableState.totalPages) {
        tableState.currentPage = page;
        renderTable();
      }
    },
    
    // Export data
    export: function() {
      exportTableData(tableState.filteredData);
    }
  };
}

/**
 * Creates a report summary table
 * @param {string} containerId - ID of the container element
 * @param {Array} reports - Array of report objects
 * @param {Function} onViewReport - Function to call when view button is clicked
 * @param {Function} onDownloadReport - Function to call when download button is clicked
 * @returns {Object} - Table API
 */
export function createReportSummaryTable(containerId, reports, onViewReport, onDownloadReport) {
  // Define columns
  const columns = [
    {
      field: 'clientName',
      title: 'Client',
      formatter: (value, report) => {
        return `<div class="fw-medium">${value || 'Unknown'}</div>
          <div class="text-muted small">${report.location || 'N/A'}</div>`;
      },
      html: true
    },
    {
      field: 'technicianName',
      title: 'Technician',
      formatter: (value) => value || 'N/A'
    },
    {
      field: 'status',
      title: 'Status',
      formatter: (value) => {
        const statusMap = {
          draft: { label: 'Draft', class: 'secondary' },
          submitted: { label: 'Submitted', class: 'primary' },
          reviewed: { label: 'Reviewed', class: 'info' },
          approved: { label: 'Approved', class: 'success' }
        };
        
        const status = statusMap[value] || { label: 'Unknown', class: 'secondary' };
        return `<span class="badge bg-${status.class}">${status.label}</span>`;
      },
      html: true,
      align: 'center'
    },
    {
      field: 'createdAt',
      title: 'Created',
      formatter: (value) => {
        if (!value) return 'N/A';
        
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleDateString();
      }
    },
    {
      field: 'submittedAt',
      title: 'Submitted',
      formatter: (value) => {
        if (!value) return '-';
        
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleDateString();
      }
    },
    {
      field: 'actions',
      title: 'Actions',
      formatter: (_, report) => {
        return `
          <div class="d-flex justify-content-end gap-1">
            <button class="btn btn-sm btn-outline-primary view-btn" data-id="${report.id}" title="View Report">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-secondary download-btn" data-id="${report.id}" title="Download PDF">
              <i class="bi bi-download"></i>
            </button>
          </div>
        `;
      },
      html: true,
      sortable: false
    }
  ];
  
  // Create table
  const table = createDataTable(containerId, reports, columns, {
    title: 'Recent Reports',
    pageSize: 10,
    exportable: true
  });
  
  // Add event listeners for action buttons
  const container = document.getElementById(containerId);
  
  // View report button
  container.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('.view-btn');
    if (viewBtn && onViewReport) {
      const reportId = viewBtn.getAttribute('data-id');
      onViewReport(reportId);
      event.stopPropagation();
    }
    
    const downloadBtn = event.target.closest('.download-btn');
    if (downloadBtn && onDownloadReport) {
      const reportId = downloadBtn.getAttribute('data-id');
      onDownloadReport(reportId);
      event.stopPropagation();
    }
  });
  
  return table;
}

/**
 * Creates a technician performance table
 * @param {string} containerId - ID of the container element
 * @param {Object} technicianData - Technician performance data
 * @returns {Object} - Table API
 */
export function createTechnicianPerformanceTable(containerId, technicianData) {
  // Convert object to array
  const technicianArray = Object.entries(technicianData).map(([name, data]) => ({
    name,
    ...data
  }));
  
  // Define columns
  const columns = [
    {
      field: 'name',
      title: 'Technician',
      formatter: (value) => {
        const initials = value.split(' ')
          .map(part => part.charAt(0).toUpperCase())
          .join('')
          .substring(0, 2);
          
        return `
          <div class="d-flex align-items-center">
            <div class="avatar avatar-sm bg-primary text-white me-2" data-initial="${initials}">
              <span>${initials}</span>
            </div>
            <span>${value}</span>
          </div>
        `;
      },
      html: true
    },
    {
      field: 'totalReports',
      title: 'Reports',
      align: 'center'
    },
    {
      field: 'statusCounts.submitted',
      title: 'Submitted',
      formatter: (value) => `<span class="text-primary">${value || 0}</span>`,
      html: true,
      align: 'center'
    },
    {
      field: 'statusCounts.reviewed',
      title: 'Reviewed',
      formatter: (value) => `<span class="text-info">${value || 0}</span>`,
      html: true,
      align: 'center'
    },
    {
      field: 'statusCounts.approved',
      title: 'Approved',
      formatter: (value) => `<span class="text-success">${value || 0}</span>`,
      html: true,
      align: 'center'
    },
    {
      field: 'avgCompletionDays',
      title: 'Avg Days',
      formatter: (value) => value?.toFixed(1) || 'N/A',
      align: 'center'
    },
    {
      field: 'componentsDocumented',
      title: 'Components',
      align: 'center'
    },
    {
      field: 'avgComponentsPerReport',
      title: 'Avg Comp/Report',
      formatter: (value) => value?.toFixed(1) || 'N/A',
      align: 'center'
    }
  ];
  
  // Create table
  return createDataTable(containerId, technicianArray, columns, {
    title: 'Technician Performance',
    pageSize: 5,
    exportable: true
  });
}