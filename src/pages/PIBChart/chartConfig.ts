import { ChartOptions } from 'chart.js';
import { PIBData } from '../../services/api/types';
import { formatCurrency, formatCompactCurrency, formatWholeNumberCurrency } from '../../utils/formatters';

interface CreateChartDataParams {
  pibData: PIBData[];
  isMobile: boolean;
  showFullChart: boolean;
}

export function createChartData({ pibData, isMobile, showFullChart }: CreateChartDataParams) {
  // For mobile view, reduce the number of data points if there are too many
  const filteredData = isMobile && pibData.length > 10 && !showFullChart
    ? pibData.filter((_, index) => index % 2 === 0) // Show every other data point on mobile
    : pibData;

  return {
    labels: filteredData.map(item => item.year.toString()),
    datasets: [
      {
        label: 'PIB Total (em dólares)',
        data: filteredData.map(item => item.pib),
        borderColor: '#0066CC',
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        borderWidth: isMobile ? 1.5 : 2,
        pointRadius: isMobile ? 2 : 3,
        pointBackgroundColor: '#0066CC',
        yAxisID: 'y',
      },
      {
        label: 'PIB Per Capita (em dólares)',
        data: filteredData.map(item => item.pibPerCapita),
        borderColor: '#00AB84',
        backgroundColor: 'rgba(0, 171, 132, 0.1)',
        borderWidth: isMobile ? 1.5 : 2,
        pointRadius: isMobile ? 2 : 3,
        pointBackgroundColor: '#00AB84',
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
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          boxWidth: isMobile ? 12 : 40,
          padding: isMobile ? 10 : 20,
          font: {
            size: isMobile ? 12 : 14,
          },
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
      },
      tooltip: {
        titleFont: {
          size: isMobile ? 12 : 14,
        },
        bodyFont: {
          size: isMobile ? 11 : 13,
        },
        callbacks: {
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
        }
      }
    },
    scales: {
      x: {
        title: {
          display: !isMobile, // Hide axis titles on mobile
          text: 'Ano',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          autoSkip: true,
          maxRotation: isMobile ? 45 : 0,
          padding: isMobile ? 5 : 10,
          font: {
            size: isMobile ? 10 : 12,
          },
          // For mobile, limit the number of ticks shown
          callback: function (tickValue, index, ticks) {
            // Get the label for this tick value
            const label = this.getLabelForValue(Number(tickValue));
            
            if (isMobile && ticks.length > 10) {
              // On mobile, only show every other label when we have many data points
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
          display: !isMobile, // Hide axis titles on mobile
          text: 'PIB Total (US$)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
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
          display: !isMobile, // Hide axis titles on mobile
          text: 'PIB Per Capita (US$)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12,
          },
          callback: function (value) {
            return formatWholeNumberCurrency(Number(value));
          },
        },
      },
    },
  };
}