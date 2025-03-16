import { ChartOptions } from 'chart.js';
import { PIBData } from '../../services/api/types';
import { formatCurrency, formatCompactCurrency, formatWholeNumberCurrency } from '../../utils/formatters';

interface CreateChartDataParams {
  pibData: PIBData[];
  isMobile: boolean;
  showFullChart: boolean;
}

export function createChartData({ 
  pibData, 
  isMobile, 
  showFullChart
}: CreateChartDataParams) {
  // Data simplification for mobile
  const filteredData = isMobile && pibData.length > 10 && !showFullChart
    ? pibData.filter((_, index) => index % 2 === 0) 
    : pibData;

  return {
    labels: filteredData.map(item => item.year.toString()),
    datasets: [
      {
        label: 'PIB Total (em dólares)',
        data: filteredData.map(item => item.pib),
        borderColor: '#6366F1', 
        backgroundColor: 'rgba(99, 102, 241, 0.1)', 
        borderWidth: isMobile ? 1.5 : 2,
        pointRadius: isMobile ? 2 : 3,
        pointBackgroundColor: '#6366F1',
        yAxisID: 'y',
      },
      {
        label: 'PIB Per Capita (em dólares)',
        data: filteredData.map(item => item.pibPerCapita),
        borderColor: '#A855F7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: isMobile ? 1.5 : 2,
        pointRadius: isMobile ? 2 : 3,
        pointBackgroundColor: '#A855F7',
        yAxisID: 'y1',
      },
    ],
  };
}

export function createChartOptions(isMobile: boolean): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: {
      duration: 1000, 
      easing: 'easeOutQuart', 
    },
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          boxWidth: isMobile ? 12 : 40,
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 12 : 14,
          },
          usePointStyle: true, 
        },
      },
      title: {
        display: true,
        text: 'Evolução do PIB Brasileiro',
        font: {
          size: isMobile ? 16 : 18,
          weight: 'bold',
        },
        padding: {
          top: isMobile ? 5 : 10,
          bottom: isMobile ? 10 : 20,
        },
        color: '#4B5563',
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827', 
        bodyColor: '#4B5563', 
        borderColor: '#E5E7EB', 
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        cornerRadius: 8,
        titleFont: {
          size: isMobile ? 12 : 14,
          weight: 'bold',
        },
        bodyFont: {
          size: isMobile ? 11 : 13,
        },
        callbacks: {
          title: function(tooltipItems) {
            return `Ano: ${tooltipItems[0].label}`;
          },
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        },
        displayColors: false, 
      }
    },
    scales: {
      x: {
        title: {
          display: !isMobile, // Ocultar títulos de eixo no mobile
          text: 'Ano',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#4B5563', 
        },
        grid: {
          display: true,
          color: 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          autoSkip: true,
          maxRotation: isMobile ? 45 : 0,
          padding: isMobile ? 5 : 10,
          font: {
            size: isMobile ? 10 : 12,
          },
          color: '#6B7280', 
          // Limiting ticks on mobile
          callback: function (tickValue, index, ticks) {

            const label = this.getLabelForValue(Number(tickValue));
            
            if (isMobile && ticks.length > 10) {
              // Showing only alternated labels on mobile when ther is too much data
              return index % 2 === 0 ? label : '';
            }
            return label;
          }
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: !isMobile, 
          text: 'PIB Total (US$)',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#4B5563', 
        },
        grid: {
          color: 'rgba(229, 231, 235, 0.5)', 
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
          color: '#6B7280',
          callback: function (value) {
            return formatCompactCurrency(Number(value));
          },
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: !isMobile, 
          text: 'PIB Per Capita (US$)',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#4B5563', 
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
          color: '#6B7280', 
          callback: function (value) {
            return formatWholeNumberCurrency(Number(value));
          },
        },
      },
    },
  };
}