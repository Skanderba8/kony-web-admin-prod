// src/bi/components/kpis-enhanced.js - Professional KPI Components with French Translation
import { getReportStatistics } from '../../utils/api-enhanced.js';

/**
 * Render enhanced KPI cards with professional styling
 */
export function renderEnhancedKPICards(containerId, kpiData) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Conteneur KPI introuvable: ${containerId}`);
    return;
  }

  console.log('Rendu des cartes KPI améliorées');

  // Enhanced KPI data with French labels and better icons
  const enhancedKPIs = [
    {
      id: 'totalReports',
      value: kpiData.totalReports || 0,
      label: 'Total des Rapports',
      sublabel: 'Tous les rapports créés',
      icon: 'bi-file-text',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      trend: calculateTrend(kpiData.totalReports, kpiData.previousTotal),
      format: 'number'
    },
    {
      id: 'submittedReports',
      value: kpiData.submittedReports || 0,
      label: 'Rapports Soumis',
      sublabel: 'En attente de validation',
      icon: 'bi-clock-history',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      trend: calculateTrend(kpiData.submittedReports, kpiData.previousSubmitted),
      format: 'number'
    },
    {
      id: 'approvedReports',
      value: kpiData.approvedReports || 0,
      label: 'Rapports Approuvés',
      sublabel: 'Validés et finalisés',
      icon: 'bi-check-circle',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      trend: calculateTrend(kpiData.approvedReports, kpiData.previousApproved),
      format: 'number'
    },
    {
      id: 'approvalRate',
      value: kpiData.approvalRate || 0,
      label: 'Taux d\'Approbation',
      sublabel: 'Pourcentage de réussite',
      icon: 'bi-graph-up',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      trend: calculateTrend(kpiData.approvalRate, kpiData.previousApprovalRate),
      format: 'percentage'
    },
    {
      id: 'activeTechnicians',
      value: kpiData.activeTechnicians || 0,
      label: 'Techniciens Actifs',
      sublabel: 'Ce mois-ci',
      icon: 'bi-people',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      trend: calculateTrend(kpiData.activeTechnicians, kpiData.previousActiveTechnicians),
      format: 'number'
    },
    {
      id: 'avgProcessingTime',
      value: kpiData.avgProcessingTime || 0,
      label: 'Temps Moyen de Traitement',
      sublabel: 'Heures par rapport',
      icon: 'bi-stopwatch',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      trend: calculateTrend(kpiData.avgProcessingTime, kpiData.previousAvgProcessingTime, true),
      format: 'time'
    }
  ];

  // Render KPI cards
  container.innerHTML = enhancedKPIs.map(kpi => createEnhancedKPICard(kpi)).join('');

  // Add smooth animations
  animateKPICards();

  // Setup click handlers for detailed views
  setupKPIClickHandlers(enhancedKPIs);
}

/**
 * Create enhanced KPI card with professional styling
 */
function createEnhancedKPICard(kpi) {
  const formattedValue = formatKPIValue(kpi.value, kpi.format);
  const trendIcon = getTrendIcon(kpi.trend);
  const trendClass = getTrendClass(kpi.trend);
  const trendText = getTrendText(kpi.trend, kpi.format);

  return `
    <div class="kpi-card enhanced-kpi" data-kpi-id="${kpi.id}" style="--kpi-gradient: ${kpi.gradient}">
      <div class="kpi-background">
        <div class="kpi-pattern"></div>
      </div>
      
      <div class="kpi-content">
        <div class="kpi-header">
          <div class="kpi-icon">
            <i class="bi ${kpi.icon}"></i>
          </div>
          <div class="kpi-trend ${trendClass}">
            <i class="bi ${trendIcon}"></i>
            <span>${trendText}</span>
          </div>
        </div>
        
        <div class="kpi-main">
          <div class="kpi-value" data-value="${kpi.value}">
            ${formattedValue}
          </div>
          <div class="kpi-label">
            ${kpi.label}
          </div>
          <div class="kpi-sublabel">
            ${kpi.sublabel}
          </div>
        </div>
        
        <div class="kpi-footer">
          <div class="kpi-action">
            <span>Voir les détails</span>
            <i class="bi bi-arrow-right"></i>
          </div>
        </div>
      </div>
      
      <div class="kpi-hover-effect"></div>
    </div>
  `;
}

/**
 * Format KPI values based on type
 */
function formatKPIValue(value, format) {
  switch (format) {
    case 'percentage':
      return `${Math.round(value)}%`;
    case 'time':
      if (value < 1) {
        return `${Math.round(value * 60)}min`;
      }
      return `${Math.round(value * 10) / 10}h`;
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value);
    case 'number':
    default:
      return new Intl.NumberFormat('fr-FR').format(value);
  }
}

/**
 * Calculate trend between current and previous values
 */
function calculateTrend(current, previous, inverse = false) {
  if (!previous || previous === 0) return null;
  
  const change = current - previous;
  const percentChange = (change / previous) * 100;
  
  // For metrics where lower is better (like processing time)
  if (inverse) {
    return {
      direction: change > 0 ? 'down' : 'up',
      percentage: Math.abs(percentChange),
      value: Math.abs(change)
    };
  }
  
  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: Math.abs(percentChange),
    value: Math.abs(change)
  };
}

/**
 * Get trend icon based on direction
 */
function getTrendIcon(trend) {
  if (!trend) return 'bi-dash';
  return trend.direction === 'up' ? 'bi-trend-up' : 'bi-trend-down';
}

/**
 * Get trend CSS class
 */
function getTrendClass(trend) {
  if (!trend) return 'trend-neutral';
  return trend.direction === 'up' ? 'trend-positive' : 'trend-negative';
}

/**
 * Get trend text
 */
function getTrendText(trend, format) {
  if (!trend) return '--';
  
  let formattedValue;
  switch (format) {
    case 'percentage':
      formattedValue = `${Math.round(trend.percentage)}%`;
      break;
    case 'time':
      formattedValue = trend.value < 1 ? 
        `${Math.round(trend.value * 60)}min` : 
        `${Math.round(trend.value * 10) / 10}h`;
      break;
    default:
      formattedValue = `${Math.round(trend.percentage)}%`;
  }
  
  return formattedValue;
}

/**
 * Animate KPI cards on load
 */
function animateKPICards() {
  const cards = document.querySelectorAll('.enhanced-kpi');
  
  cards.forEach((card, index) => {
    // Stagger animation
    setTimeout(() => {
      card.style.animation = 'kpiSlideIn 0.6s ease forwards';
      
      // Animate the value counter
      const valueElement = card.querySelector('.kpi-value');
      const targetValue = parseInt(valueElement.dataset.value) || 0;
      animateCounter(valueElement, targetValue);
      
    }, index * 150);
  });
}

/**
 * Animate counter values
 */
function animateCounter(element, targetValue) {
  const startValue = 0;
  const duration = 1000;
  const startTime = performance.now();
  
  function updateCounter(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);
    
    // Easing function for smooth animation
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(startValue + (targetValue - startValue) * easedProgress);
    
    element.dataset.animatedValue = currentValue;
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  }
  
  requestAnimationFrame(updateCounter);
}

/**
 * Setup click handlers for KPI cards
 */
function setupKPIClickHandlers(kpiData) {
  document.querySelectorAll('.enhanced-kpi').forEach(card => {
    card.addEventListener('click', (e) => {
      const kpiId = e.currentTarget.dataset.kpiId;
      const kpi = kpiData.find(k => k.id === kpiId);
      
      if (kpi) {
        showKPIDetailModal(kpi);
      }
    });
    
    // Add hover effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });
}

/**
 * Show detailed KPI modal
 */
function showKPIDetailModal(kpi) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.innerHTML = `
    <div class="modal-content kpi-detail-modal">
      <div class="modal-header" style="background: ${kpi.gradient}; color: white;">
        <h3>
          <i class="bi ${kpi.icon}"></i>
          ${kpi.label}
        </h3>
        <button class="modal-close" style="color: white;">
          <i class="bi bi-x"></i>
        </button>
      </div>
      <div class="modal-body">
        <div class="kpi-detail-content">
          <div class="kpi-detail-value">
            <span class="value">${formatKPIValue(kpi.value, kpi.format)}</span>
            <span class="label">${kpi.sublabel}</span>
          </div>
          
          <div class="kpi-detail-info">
            <div class="info-item">
              <span class="info-label">Tendance</span>
              <span class="info-value ${getTrendClass(kpi.trend)}">
                <i class="bi ${getTrendIcon(kpi.trend)}"></i>
                ${getTrendText(kpi.trend, kpi.format)}
              </span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Dernière mise à jour</span>
              <span class="info-value">${new Date().toLocaleString('fr-FR')}</span>
            </div>
          </div>
          
          <div class="kpi-detail-actions">
            <button class="btn btn-primary" onclick="exportKPIData('${kpi.id}')">
              <i class="bi bi-download"></i>
              Exporter les Données
            </button>
            <button class="btn btn-outline" onclick="refreshKPIData('${kpi.id}')">
              <i class="bi bi-arrow-clockwise"></i>
              Actualiser
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close modal handlers
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/**
 * Apply enhanced KPI styles
 */
export function applyEnhancedKPIStyles() {
  const styles = `
    <style data-enhanced-kpi-styles>
      .enhanced-kpi {
        position: relative;
        background: white;
        border-radius: 20px;
        padding: 0;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        opacity: 0;
        transform: translateY(30px);
      }

      @keyframes kpiSlideIn {
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .kpi-background {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: var(--kpi-gradient);
        opacity: 0.9;
      }

      .kpi-pattern {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: 
          radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 2px, transparent 2px),
          radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 2px, transparent 2px);
        background-size: 30px 30px;
      }

      .kpi-content {
        position: relative;
        z-index: 2;
        padding: 1.5rem;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .kpi-icon {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        backdrop-filter: blur(10px);
      }

      .kpi-trend {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        backdrop-filter: blur(10px);
      }

      .trend-positive {
        background: rgba(16, 185, 129, 0.2) !important;
        color: #10b981 !important;
      }

      .trend-negative {
        background: rgba(239, 68, 68, 0.2) !important;
        color: #ef4444 !important;
      }

      .trend-neutral {
        background: rgba(107, 114, 128, 0.2) !important;
        color: #6b7280 !important;
      }

      .kpi-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        margin: 1rem 0;
      }

      .kpi-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: #1e293b;
        line-height: 1;
        margin-bottom: 0.5rem;
        position: relative;
      }

      .kpi-value::after {
        content: attr(data-animated-value);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        color: transparent;
        background: var(--kpi-gradient);
        background-clip: text;
        -webkit-background-clip: text;
      }

      .kpi-label {
        font-size: 1rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.25rem;
      }

      .kpi-sublabel {
        font-size: 0.875rem;
        color: #6b7280;
      }

      .kpi-footer {
        margin-top: auto;
      }

      .kpi-action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem;
        background: #f8fafc;
        border-radius: 12px;
        font-size: 0.875rem;
        font-weight: 500;
        color: #64748b;
        transition: all 0.2s ease;
      }

      .enhanced-kpi:hover .kpi-action {
        background: #e2e8f0;
        color: #3b82f6;
      }

      .kpi-hover-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .enhanced-kpi:hover .kpi-hover-effect {
        opacity: 1;
      }

      /* KPI Detail Modal Styles */
      .kpi-detail-modal {
        max-width: 500px;
        width: 90%;
      }

      .kpi-detail-content {
        padding: 1rem 0;
      }

      .kpi-detail-value {
        text-align: center;
        padding: 2rem 0;
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 1.5rem;
      }

      .kpi-detail-value .value {
        display: block;
        font-size: 3rem;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 0.5rem;
      }

      .kpi-detail-value .label {
        color: #64748b;
        font-size: 1rem;
      }

      .kpi-detail-info {
        margin-bottom: 2rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f1f5f9;
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .info-label {
        font-weight: 500;
        color: #374151;
      }

      .info-value {
        font-weight: 600;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }

      .kpi-detail-actions {
        display: flex;
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }

      .kpi-detail-actions .btn {
        flex: 1;
        justify-content: center;
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .enhanced-kpi {
          min-height: 200px;
        }

        .kpi-value {
          font-size: 2rem;
        }

        .kpi-content {
          padding: 1rem;
        }

        .kpi-detail-actions {
          flex-direction: column;
        }

        .kpi-detail-value .value {
          font-size: 2.5rem;
        }
      }

      /* Loading Animation */
      .kpi-loading {
        background: #f8fafc;
        border-radius: 20px;
        padding: 1.5rem;
        text-align: center;
        color: #64748b;
      }

      .kpi-loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e5e7eb;
        border-top: 3px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .enhanced-kpi {
          background: #1e293b;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .kpi-value,
        .kpi-label {
          color: #f8fafc;
        }

        .kpi-sublabel {
          color: #94a3b8;
        }

        .kpi-action {
          background: #334155;
          color: #94a3b8;
        }

        .enhanced-kpi:hover .kpi-action {
          background: #475569;
          color: #60a5fa;
        }
      }
    </style>
  `;
  
  // Only add styles if not already present
  if (!document.head.querySelector('[data-enhanced-kpi-styles]')) {
    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

/**
 * Show KPI loading state
 */
export function showKPILoading(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = Array(6).fill(0).map(() => `
    <div class="kpi-loading">
      <div class="kpi-loading-spinner"></div>
      <p>Chargement...</p>
    </div>
  `).join('');
}

/**
 * Handle KPI data refresh
 */
export async function refreshKPIData(kpiId = null) {
  try {
    console.log(`Actualisation des données KPI${kpiId ? ` pour ${kpiId}` : ''}`);
    
    // Show loading state
    if (kpiId) {
      const card = document.querySelector(`[data-kpi-id="${kpiId}"]`);
      if (card) {
        card.style.opacity = '0.6';
      }
    }
    
    // Fetch fresh data
    const stats = await getReportStatistics();
    
    // Re-render KPIs
    renderEnhancedKPICards('kpiContainer', stats);
    
    // Show success message
    showKPINotification('Données KPI actualisées avec succès', 'success');
    
  } catch (error) {
    console.error('Erreur lors de l\'actualisation des KPI:', error);
    showKPINotification('Erreur lors de l\'actualisation des données', 'error');
  }
}

/**
 * Export KPI data
 */
export function exportKPIData(kpiId) {
  try {
    console.log(`Export des données KPI pour: ${kpiId}`);
    
    // Simulate export process
    showKPINotification('Export des données en cours...', 'info');
    
    setTimeout(() => {
      showKPINotification('Données KPI exportées avec succès', 'success');
    }, 2000);
    
  } catch (error) {
    console.error('Erreur lors de l\'export KPI:', error);
    showKPINotification('Erreur lors de l\'export des données', 'error');
  }
}

/**
 * Show KPI notification
 */
function showKPINotification(message, type = 'info') {
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

  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: white;
    border-left: 4px solid ${colors[type]};
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 300px;
    z-index: 10000;
    animation: slideInRight 0.3s ease;
  `;

  notification.innerHTML = `
    <i class="bi ${icons[type]}" style="color: ${colors[type]}; font-size: 1.25rem;"></i>
    <span style="flex: 1; color: #374151;">${message}</span>
    <button style="background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1.25rem;">
      <i class="bi bi-x"></i>
    </button>
  `;

  // Add animation styles
  const animationStyle = document.createElement('style');
  animationStyle.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(animationStyle);

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => {
      notification.remove();
      animationStyle.remove();
    }, 300);
  }, 5000);

  // Remove on close button click
  notification.querySelector('button').addEventListener('click', () => {
    notification.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => {
      notification.remove();
      animationStyle.remove();
    }, 300);
  });
}

/**
 * Calculate KPI performance indicators
 */
export function calculateKPIPerformance(currentData, historicalData) {
  const performance = {};
  
  Object.keys(currentData).forEach(key => {
    const current = currentData[key];
    const previous = historicalData?.[key];
    
    if (previous !== undefined && previous !== null) {
      const change = current - previous;
      const percentChange = previous !== 0 ? (change / previous) * 100 : 0;
      
      performance[key] = {
        current,
        previous,
        change,
        percentChange: Math.round(percentChange * 100) / 100,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
      };
    } else {
      performance[key] = {
        current,
        previous: null,
        change: null,
        percentChange: null,
        trend: 'stable'
      };
    }
  });
  
  return performance;
}

/**
 * Generate KPI summary report
 */
export function generateKPISummaryReport(kpiData) {
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalMetrics: Object.keys(kpiData).length,
      positiveMetrics: 0,
      negativeMetrics: 0,
      stableMetrics: 0
    },
    metrics: [],
    recommendations: []
  };
  
  Object.entries(kpiData).forEach(([key, data]) => {
    const metric = {
      name: key,
      value: data.current,
      trend: data.trend,
      changePercent: data.percentChange
    };
    
    report.metrics.push(metric);
    
    // Count trends
    if (data.trend === 'up') report.summary.positiveMetrics++;
    else if (data.trend === 'down') report.summary.negativeMetrics++;
    else report.summary.stableMetrics++;
    
    // Generate recommendations based on performance
    if (key === 'approvalRate' && data.current < 80) {
      report.recommendations.push({
        type: 'improvement',
        metric: key,
        message: 'Le taux d\'approbation est faible. Considérez une formation supplémentaire pour les techniciens.'
      });
    }
    
    if (key === 'avgProcessingTime' && data.current > 48) {
      report.recommendations.push({
        type: 'efficiency',
        metric: key,
        message: 'Le temps de traitement est élevé. Optimisez le processus de validation.'
      });
    }
  });
  
  return report;
}

// Export utility functions for external use
export {
  refreshKPIData,
  exportKPIData,
  calculateKPIPerformance,
  generateKPISummaryReport
};

// Make functions globally available for modal actions
window.refreshKPIData = refreshKPIData;
window.exportKPIData = exportKPIData;