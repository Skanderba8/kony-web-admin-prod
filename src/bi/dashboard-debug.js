// dashboard-debug.js - Add this to your src/bi directory
// Utility for debugging dashboard issues

/**
 * Enhanced console logging with timestamps and categories
 * @param {string} category - Log category (e.g., 'DATA', 'RENDER', 'ERROR')
 * @param {string} message - Log message
 * @param {any} data - Optional data to log
 */
export function debugLog(category, message, data = null) {
  const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
  const categoryFormatted = `[${category.toUpperCase().padEnd(7)}]`;
  
  if (data !== null) {
    console.log(`${timestamp} ${categoryFormatted} ${message}`, data);
  } else {
    console.log(`${timestamp} ${categoryFormatted} ${message}`);
  }
}

/**
 * Monitor Firestore query execution
 * @param {Promise} queryPromise - The Firestore query promise
 * @param {string} queryName - Name of the query for logging
 * @returns {Promise} - The original promise result
 */
export async function monitorQuery(queryPromise, queryName) {
  debugLog('QUERY', `Starting: ${queryName}`);
  try {
    const startTime = performance.now();
    const result = await queryPromise;
    const duration = (performance.now() - startTime).toFixed(2);
    
    debugLog('QUERY', `Completed: ${queryName} in ${duration}ms`, {
      resultCount: Array.isArray(result) ? result.length : 
                   (result.docs ? result.docs.length : 'N/A')
    });
    return result;
  } catch (error) {
    debugLog('ERROR', `Query failed: ${queryName}`, error);
    throw error;
  }
}

/**
 * Monitor chart rendering time
 * @param {string} chartId - Chart element ID
 * @param {Function} renderFunc - The rendering function
 */
export function monitorChartRender(chartId, renderFunc) {
  debugLog('RENDER', `Starting chart: ${chartId}`);
  const startTime = performance.now();
  
  try {
    renderFunc();
    const duration = (performance.now() - startTime).toFixed(2);
    debugLog('RENDER', `Rendered chart: ${chartId} in ${duration}ms`);
  } catch (error) {
    debugLog('ERROR', `Chart render failed: ${chartId}`, error);
    throw error;
  }
}

/**
 * Add debugging UI to the dashboard
 * @param {HTMLElement} container - Dashboard container element
 */
export function addDebugUI(container) {
  // Create debug panel
  const debugPanel = document.createElement('div');
  debugPanel.className = 'card shadow-sm mb-4 debug-panel';
  debugPanel.style.display = 'none'; // Initially hidden
  
  debugPanel.innerHTML = `
    <div class="card-header bg-warning bg-opacity-10 d-flex align-items-center">
      <h5 class="mb-0"><i class="bi bi-bug me-2"></i> Debug Console</h5>
      <button class="btn btn-sm btn-outline-warning ms-auto" id="clearLogsBtn">Clear</button>
    </div>
    <div class="card-body p-0">
      <div id="debugLogs" class="debug-logs p-2" style="height: 200px; overflow-y: auto; font-family: monospace; font-size: 12px;"></div>
    </div>
  `;
  
  // Create debug toggle button
  const debugToggle = document.createElement('button');
  debugToggle.className = 'btn btn-sm btn-warning position-fixed';
  debugToggle.style.bottom = '20px';
  debugToggle.style.right = '20px';
  debugToggle.style.zIndex = '1050';
  debugToggle.innerHTML = '<i class="bi bi-bug"></i>';
  debugToggle.title = 'Toggle Debug Panel';
  
  // Add to container
  container.appendChild(debugPanel);
  document.body.appendChild(debugToggle);
  
  // Add event listeners
  debugToggle.addEventListener('click', () => {
    debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
  });
  
  document.getElementById('clearLogsBtn').addEventListener('click', () => {
    document.getElementById('debugLogs').innerHTML = '';
  });
  
  // Intercept console.log
  const originalConsoleLog = console.log;
  console.log = function() {
    // Call original console.log
    originalConsoleLog.apply(console, arguments);
    
    // Add to debug panel
    const debugLogs = document.getElementById('debugLogs');
    if (debugLogs) {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      
      // Convert arguments to string
      let logText = Array.from(arguments).map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      // Add timestamp
      const timestamp = new Date().toISOString().slice(11, 19);
      logText = `[${timestamp}] ${logText}`;
      
      logEntry.textContent = logText;
      debugLogs.appendChild(logEntry);
      
      // Auto-scroll to bottom
      debugLogs.scrollTop = debugLogs.scrollHeight;
    }
  };
  
  // Intercept console.error
  const originalConsoleError = console.error;
  console.error = function() {
    // Call original console.error
    originalConsoleError.apply(console, arguments);
    
    // Add to debug panel
    const debugLogs = document.getElementById('debugLogs');
    if (debugLogs) {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry text-danger';
      
      // Convert arguments to string
      let logText = Array.from(arguments).map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      
      // Add timestamp and error prefix
      const timestamp = new Date().toISOString().slice(11, 19);
      logText = `[${timestamp}] [ERROR] ${logText}`;
      
      logEntry.textContent = logText;
      debugLogs.appendChild(logEntry);
      
      // Auto-scroll to bottom
      debugLogs.scrollTop = debugLogs.scrollHeight;
    }
  };
  
  debugLog('INIT', 'Debug UI initialized');
  
  // Return cleanup function
  return function cleanup() {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    
    if (container.contains(debugPanel)) {
      container.removeChild(debugPanel);
    }
    
    if (document.body.contains(debugToggle)) {
      document.body.removeChild(debugToggle);
    }
  };
}

/**
 * Check and validate dashboard data
 * @param {Object} dashboardData - The dashboard data object
 * @returns {boolean} - Whether the data is valid
 */
export function validateDashboardData(dashboardData) {
  // Check for null or undefined data
  if (!dashboardData) {
    debugLog('ERROR', 'Dashboard data is null or undefined');
    return false;
  }
  
  // Check for reports array
  if (!Array.isArray(dashboardData.reports)) {
    debugLog('ERROR', 'Reports data is missing or not an array', dashboardData);
    return false;
  }
  
  // Check for analytics object
  if (!dashboardData.analytics) {
    debugLog('ERROR', 'Analytics data is missing', dashboardData);
    return false;
  }
  
  // Check for necessary analytics properties
  const requiredProps = ['kpis', 'reportsByStatus', 'componentStats', 'technicianPerformance', 'timeSeries'];
  const missingProps = requiredProps.filter(prop => !dashboardData.analytics[prop]);
  
  if (missingProps.length > 0) {
    debugLog('ERROR', 'Missing required analytics properties', missingProps);
    return false;
  }
  
  debugLog('DATA', 'Dashboard data validation passed', {
    reportsCount: dashboardData.reports.length,
    analyticsProps: Object.keys(dashboardData.analytics)
  });
  
  return true;
}

// Style additions for debug UI
const style = document.createElement('style');
style.textContent = `
  .debug-panel {
    margin-top: 20px;
    border: 1px solid #ffc107;
  }
  
  .log-entry {
    border-bottom: 1px solid rgba(0,0,0,0.05);
    padding: 2px 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
  
  .log-entry:last-child {
    border-bottom: none;
  }
`;
document.head.appendChild(style);