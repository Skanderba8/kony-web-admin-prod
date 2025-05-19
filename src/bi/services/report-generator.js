import { getBusinessAnalytics, getFilteredAnalytics } from '../services/analytics.js';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Generate Excel report with analytics data
 * @param {Array} reports - Raw report data
 * @param {Object} analytics - Processed analytics data
 * @returns {Blob} - Excel file as blob
 */
export async function generateExcelReport(reports, analytics) {
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Add KPI summary sheet
  const kpiData = [
    ['Key Performance Indicators', ''],
    ['Total Reports', analytics.kpis.totalReports || 0],
    ['Submitted Reports', analytics.kpis.totalSubmitted || 0],
    ['Reviewed Reports', analytics.kpis.totalReviewed || 0],
    ['Approved Reports', analytics.kpis.totalApproved || 0],
    ['Average Completion Time (days)', analytics.kpis.avgCompletionTime || 0],
    ['Average Components Per Report', analytics.kpis.avgComponentsPerReport || 0],
    ['Total Components', analytics.kpis.totalComponents || 0],
    ['Total Technicians', analytics.kpis.totalTechnicians || 0],
    ['Most Active Client', analytics.kpis.mostActiveClient || 'N/A'],
    ['Most Active Technician', analytics.kpis.mostActiveTechnician || 'N/A']
  ];
  
  const kpiWs = XLSX.utils.aoa_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(wb, kpiWs, 'KPI Summary');
  
  // Add reports by status sheet
  const statusData = [['Status', 'Count']];
  Object.entries(analytics.reportsByStatus || {}).forEach(([status, count]) => {
    statusData.push([status, count]);
  });
  
  const statusWs = XLSX.utils.aoa_to_sheet(statusData);
  XLSX.utils.book_append_sheet(wb, statusWs, 'Reports by Status');
  
  // Add reports by technician sheet
  const techData = [['Technician', 'Report Count']];
  Object.entries(analytics.technicianPerformance || {}).forEach(([tech, data]) => {
    techData.push([tech, data.totalReports || 0]);
  });
  
  const techWs = XLSX.utils.aoa_to_sheet(techData);
  XLSX.utils.book_append_sheet(wb, techWs, 'Technician Performance');
  
  // Add component statistics sheet
  const componentData = [['Component Type', 'Count', 'Percentage']];
  const { types, total } = analytics.components || { types: {}, total: 0 };
  
  Object.entries(types).forEach(([type, data]) => {
    const percentage = total > 0 ? Math.round((data.count / total) * 100) : 0;
    componentData.push([data.name, data.count, `${percentage}%`]);
  });
  
  const componentWs = XLSX.utils.aoa_to_sheet(componentData);
  XLSX.utils.book_append_sheet(wb, componentWs, 'Component Analysis');
  
  // Add reports list sheet
  const reportData = [
    ['Report ID', 'Client', 'Location', 'Technician', 'Status', 'Created Date', 'Submitted Date', 'Components']
  ];
  
  reports.forEach(report => {
    // Count components
    let components = 0;
    if (report.floors) {
      report.floors.forEach(floor => {
        const componentTypes = [
          'networkCabinets', 'perforations', 'accessTraps', 'cablePaths',
          'cableTrunkings', 'conduits', 'copperCablings', 'fiberOpticCablings'
        ];
        
        componentTypes.forEach(type => {
          if (floor[type] && Array.isArray(floor[type])) {
            components += floor[type].length;
          }
        });
      });
    }
    
    reportData.push([
      report.id,
      report.clientName || 'Unknown',
      report.location || 'N/A',
      report.technicianName || 'N/A',
      report.status || 'Unknown',
      report.createdAt ? report.createdAt.toLocaleString() : 'N/A',
      report.submittedAt ? report.submittedAt.toLocaleString() : 'N/A',
      components
    ]);
  });
  
  const reportWs = XLSX.utils.aoa_to_sheet(reportData);
  XLSX.utils.book_append_sheet(wb, reportWs, 'Reports List');
  
  // Generate Excel file as blob
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Generate PDF report with dashboard data
 * @param {HTMLElement} dashboardElement - The dashboard element to capture
 * @param {string} title - Report title
 * @returns {jsPDF} - PDF document
 */
export async function generatePdfReport(dashboardElement, title = 'Business Intelligence Report') {
  // Create PDF document
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add title and header
  doc.setFontSize(18);
  doc.setTextColor(13, 110, 253); // Primary blue
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(33, 37, 41); // Dark text
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
  
  doc.line(15, 32, pageWidth - 15, 32);
  
  // Add KPI summary section
  doc.setFontSize(14);
  doc.setTextColor(13, 110, 253); // Primary blue
  doc.text('Key Performance Indicators', 15, 40);
  
  // Get KPI data from dashboard
  const kpiCards = dashboardElement.querySelectorAll('.kpi-value');
  const kpiLabels = dashboardElement.querySelectorAll('.kpi-label');
  
  let yPos = 48;
  
  // Add KPI data
  doc.setFontSize(10);
  doc.setTextColor(33, 37, 41); // Dark text
  
  for (let i = 0; i < kpiCards.length; i++) {
    if (kpiCards[i] && kpiLabels[i]) {
      const value = kpiCards[i].textContent.trim();
      const label = kpiLabels[i].textContent.trim();
      
      doc.text(`${label}: ${value}`, 20, yPos);
      yPos += 7;
    }
  }
  
  // Add page break if needed
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = 20;
  }
  
  // Add charts section with note
  yPos += 10;
  doc.setFontSize(14);
  doc.setTextColor(13, 110, 253); // Primary blue
  doc.text('Charts and Visualizations', 15, yPos);
  yPos += 8;
  
  doc.setFontSize(9);
  doc.setTextColor(108, 117, 125); // Text muted
  doc.text('Note: To view the full interactive dashboard with charts, please access the web application.', 15, yPos);
  
  // Add reports summary section
  yPos += 15;
  doc.setFontSize(14);
  doc.setTextColor(13, 110, 253); // Primary blue
  doc.text('Reports Summary', 15, yPos);
  yPos += 8;
  
  // Get report data from dashboard
  const reportContainer = dashboardElement.querySelector('#recentReportsTable');
  if (reportContainer) {
    const reportRows = reportContainer.querySelectorAll('tbody tr');
    
    // Column headers
    doc.setFontSize(9);
    doc.setTextColor(33, 37, 41); // Dark text
    doc.setFont(undefined, 'bold');
    doc.text('Client', 15, yPos);
    doc.text('Location', 60, yPos);
    doc.text('Technician', 105, yPos);
    doc.text('Status', 150, yPos);
    doc.text('Created', 180, yPos);
    yPos += 5;
    
    doc.line(15, yPos, pageWidth - 15, yPos);
    yPos += 5;
    
    // Reset font
    doc.setFont(undefined, 'normal');
    
    // Add report rows
    reportRows.forEach((row, index) => {
      // Add page break if needed
      if (yPos > pageHeight - 15) {
        doc.addPage();
        yPos = 20;
      }
      
      const cells = row.querySelectorAll('td');
      if (cells.length >= 5) {
        doc.text(cells[0].textContent.trim(), 15, yPos);
        doc.text(cells[1].textContent.trim(), 60, yPos);
        doc.text(cells[2].textContent.trim(), 105, yPos);
        doc.text(cells[3].textContent.trim(), 150, yPos);
        doc.text(cells[4].textContent.trim(), 180, yPos);
      }
      
      yPos += 6;
      
      // Add a light divider between rows
      if (index < reportRows.length - 1) {
        doc.setDrawColor(240, 240, 240);
        doc.line(15, yPos - 3, pageWidth - 15, yPos - 3);
      }
    });
  }
  
  // Add footer to each page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(108, 117, 125); // Text muted
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10);
    doc.text('Kony - Technical Visit Reports BI Dashboard', 15, pageHeight - 10);
  }
  
  return doc;
}