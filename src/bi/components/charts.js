// src/bi/components/charts.js - Enhanced version
import Chart from 'chart.js/auto';
import * as echarts from 'echarts';

// Create and render a Chart.js chart
export function createChartJsChart(canvasId, config) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, config);
}

// Create and render an ECharts chart
export function createEChartInstance(elementId, options) {
  const chartElement = document.getElementById(elementId);
  const chart = echarts.init(chartElement);
  chart.setOption(options);
  
  // Handle resize
  window.addEventListener('resize', () => {
    chart.resize();
  });
  
  return chart;
}

// Render report status pie chart with improved visuals
export function renderStatusPieChart(elementId, data) {
  // Define appealing colors
  const colorPalette = {
    draft: 'rgba(108, 117, 125, 0.85)',     // gray for draft
    submitted: 'rgba(13, 110, 253, 0.85)',   // blue for submitted
    reviewed: 'rgba(111, 66, 193, 0.85)',    // purple for reviewed
    approved: 'rgba(25, 135, 84, 0.85)'      // green for approved
  };
  
  // Ensure all status types exist
  const statusLabels = {
    draft: 'Draft',
    submitted: 'Submitted',
    reviewed: 'Reviewed',
    approved: 'Approved'
  };
  
  // Prepare labels and data
  const labels = Object.keys(statusLabels);
  const values = labels.map(key => data[key] || 0);
  const backgroundColors = labels.map(key => colorPalette[key]);
  const borderColors = labels.map(key => colorPalette[key].replace('0.85', '1'));
  
  const chartConfig = {
    type: 'doughnut',
    data: {
      labels: labels.map(key => statusLabels[key]),
      datasets: [{
        data: values,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 15
          }
        },
        title: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  };
  
  return createChartJsChart(elementId, chartConfig);
}

// Render time series chart with improved visuals
export function renderTimeSeriesChart(elementId, timeSeriesData) {
  // Format month labels
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const formatMonthLabel = (dateString) => {
    const [year, month] = dateString.split('-');
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };
  
  // Prepare chart data
  const labels = timeSeriesData.created.map(item => formatMonthLabel(item.date));
  const createdData = timeSeriesData.created.map(item => item.count);
  const submittedData = timeSeriesData.submitted.map(item => {
    const matchingDate = timeSeriesData.created.find(c => c.date === item.date);
    return matchingDate ? item.count : 0;
  });
  
  const chartConfig = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Reports Created',
          data: createdData,
          borderColor: 'rgba(13, 110, 253, 1)', // Primary blue
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: 'rgba(13, 110, 253, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Reports Submitted',
          data: submittedData,
          borderColor: 'rgba(25, 135, 84, 1)', // Success green
          backgroundColor: 'rgba(25, 135, 84, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: 'rgba(25, 135, 84, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          padding: 10,
          caretPadding: 6,
          boxPadding: 6
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          suggestedMax: Math.max(...createdData, ...submittedData) + 2,
          ticks: {
            stepSize: 1,
            precision: 0
          },
          title: {
            display: true,
            text: 'Number of Reports'
          }
        }
      }
    }
  };
  
  return createChartJsChart(elementId, chartConfig);
}

// Render component distribution chart with a modern look
export function renderComponentDistributionChart(elementId, componentStats) {
  // Count components by type
  const componentCounts = {};
  Object.entries(componentStats).forEach(([type, components]) => {
    componentCounts[type] = components.length;
  });
  
  // Format type names for better readability
  const formattedTypes = {
    networkCabinets: 'Network Cabinets',
    perforations: 'Perforations',
    accessTraps: 'Access Traps',
    cablePaths: 'Cable Paths',
    cableTrunkings: 'Cable Trunkings',
    conduits: 'Conduits',
    copperCablings: 'Copper Cablings',
    fiberOpticCablings: 'Fiber Optic Cablings',
    customComponents: 'Custom Components'
  };
  
  // Sort by count (descending)
  const sortedComponents = Object.entries(componentCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      type: formattedTypes[type] || type,
      count
    }));
  
  const chartOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      confine: true,
      formatter: '{b}: {c}'
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '8%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: 'Count',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'category',
      data: sortedComponents.map(item => item.type),
      axisLabel: {
        interval: 0,
        width: 120,
        overflow: 'truncate',
        fontSize: 12
      },
      inverse: true
    },
    series: [
      {
        name: 'Count',
        type: 'bar',
        data: sortedComponents.map(item => item.count),
        itemStyle: {
          color: function(params) {
            const colors = [
              '#0d6efd', '#6610f2', '#6f42c1', '#d63384', 
              '#dc3545', '#fd7e14', '#ffc107', '#198754', 
              '#20c997', '#0dcaf0'
            ];
            return colors[params.dataIndex % colors.length];
          },
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
          fontSize: 12,
          fontWeight: 'bold'
        },
        barWidth: '60%'
      }
    ]
  };
  
  return createEChartInstance(elementId, chartOptions);
}

// NEW: Render technician performance comparison chart
export function renderTechnicianPerformanceChart(elementId, technicianData) {
  // Process data for the chart
  const techNames = Object.keys(technicianData).filter(name => name && name.trim());
  
  // Limit to top 5 technicians by total reports
  const topTechnicians = techNames
    .map(name => ({ name, reports: technicianData[name].totalReports }))
    .sort((a, b) => b.reports - a.reports)
    .slice(0, 5)
    .map(tech => tech.name);
  
  // Prepare data for each metric
  const datasets = [
    {
      label: 'Submitted Reports',
      data: topTechnicians.map(name => technicianData[name].statusCounts.submitted || 0),
      backgroundColor: 'rgba(13, 110, 253, 0.8)', // Primary blue
      borderColor: 'rgba(13, 110, 253, 1)',
      borderWidth: 1,
      borderRadius: 4
    },
    {
      label: 'Reviewed Reports',
      data: topTechnicians.map(name => technicianData[name].statusCounts.reviewed || 0),
      backgroundColor: 'rgba(111, 66, 193, 0.8)', // Purple
      borderColor: 'rgba(111, 66, 193, 1)',
      borderWidth: 1,
      borderRadius: 4
    },
    {
      label: 'Approved Reports',
      data: topTechnicians.map(name => technicianData[name].statusCounts.approved || 0),
      backgroundColor: 'rgba(25, 135, 84, 0.8)', // Success green
      borderColor: 'rgba(25, 135, 84, 1)',
      borderWidth: 1,
      borderRadius: 4
    }
  ];
  
  // Create chart configuration
  const chartConfig = {
    type: 'bar',
    data: {
      labels: topTechnicians,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        title: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            precision: 0
          },
          title: {
            display: true,
            text: 'Number of Reports'
          }
        }
      }
    }
  };
  
  return createChartJsChart(elementId, chartConfig);
}

// Render heatmap for component distribution by floor (removed if not needed)
export function renderComponentHeatmap(elementId, componentStats) {
  // Process data to get component counts by floor
  const floorComponentMap = new Map();
  const componentTypes = Object.keys(componentStats);
  
  componentTypes.forEach(type => {
    componentStats[type].forEach(component => {
      if (!component.floorName) return;
      
      const key = `${component.reportId}-${component.floorName}`;
      if (!floorComponentMap.has(key)) {
        floorComponentMap.set(key, {
          report: component.reportId,
          floor: component.floorName,
          client: component.clientName || 'Unknown',
          counts: Object.fromEntries(componentTypes.map(t => [t, 0]))
        });
      }
      
      floorComponentMap.get(key).counts[type]++;
    });
  });
  
  // Convert to array and sort by total components
  const floorData = Array.from(floorComponentMap.values());
  floorData.sort((a, b) => {
    const aTotal = Object.values(a.counts).reduce((sum, count) => sum + count, 0);
    const bTotal = Object.values(b.counts).reduce((sum, count) => sum + count, 0);
    return bTotal - aTotal;
  });
  
  // Take top 15 floors by component count
  const topFloors = floorData.slice(0, 15);
  
  // Format type names for better readability
  const formattedTypes = {
    networkCabinets: 'Network Cabinets',
    perforations: 'Perforations',
    accessTraps: 'Access Traps',
    cablePaths: 'Cable Paths',
    cableTrunkings: 'Cable Trunkings',
    conduits: 'Conduits',
    copperCablings: 'Copper Cablings',
    fiberOpticCablings: 'Fiber Optic',
    customComponents: 'Custom'
  };
  
  // Prepare heatmap data
  const yAxisData = topFloors.map(d => `${d.client} - ${d.floor}`);
  const xAxisData = componentTypes.map(type => formattedTypes[type] || type);
  
  const data = [];
  topFloors.forEach((floor, y) => {
    componentTypes.forEach((type, x) => {
      data.push([x, y, floor.counts[type]]);
    });
  });
  
  const chartOptions = {
    tooltip: {
      position: 'top',
      formatter: function (params) {
        return `${yAxisData[params.value[1]]}<br>${xAxisData[params.value[0]]}: ${params.value[2]}`;
      }
    },
    grid: {
      height: '70%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      axisLabel: {
        interval: 0,
        rotate: 45,
        fontSize: 10
      },
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: yAxisData,
      axisLabel: {
        fontSize: 10
      },
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      color: ['#198754', '#20c997', '#0dcaf0', '#E8F4F8']
    },
    series: [{
      name: 'Component Count',
      type: 'heatmap',
      data: data,
      label: {
        show: true,
        fontSize: 9
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  
  return createEChartInstance(elementId, chartOptions);
}