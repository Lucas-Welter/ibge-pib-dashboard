import { useQuery } from '@tanstack/react-query';
import { fetchPIBData } from '../../services/api/ibgeApi';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const PIBChartPage = () => {
    // Fetch PIB data using Tanstack Query
    const {
        data: pibData,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['pibData'],
        queryFn: fetchPIBData,
    });

    // Rendering loading component while fetching data
    if (isLoading) {
        return <Loading />;
    }

    // Render the error component if ther is an issue
    if (error) {
        return <Error onRetry={() => refetch()} />;
    }

    // Verificar se temos dados para mostrar
    if (!pibData || pibData.length === 0) {
        return <Error message="Não há dados disponíveis para exibição." />;
    }

    // Check if we have data to display
    const chartData = {
        labels: pibData.map(item => item.year.toString()),
        datasets: [
            {
                label: 'PIB Total (em dólares)',
                data: pibData.map(item => item.pib),
                borderColor: '#0066CC',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#0066CC',
                yAxisID: 'y',
            },
            {
                label: 'PIB Per Capita (em dólares)',
                data: pibData.map(item => item.pibPerCapita),
                borderColor: '#00AB84',
                backgroundColor: 'rgba(0, 171, 132, 0.1)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: '#00AB84',
                yAxisID: 'y1',
            },
        ],
    };

    // Prepare data for the chart
    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14,
                    },
                },
            },
            title: {
                display: true,
                text: 'Evolução do PIB Brasileiro',
                font: {
                    size: 18,
                    weight: 'bold',
                },
                padding: {
                    top: 10,
                    bottom: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Ano',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                },
                ticks: {
                    autoSkip: true,
                    maxRotation: 0,
                    padding: 10,
                },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'PIB Total (US$)',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                },
                ticks: {
                    callback: function (value) {
                        return new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                            compactDisplay: 'short',
                        }).format(Number(value));
                    },
                },
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
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
                    callback: function (value) {
                        return new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }).format(Number(value));
                    },
                },
            },
        },
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Gráfico de Evolução do PIB</h1>
            <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Sobre este gráfico</h2>
                <p className="text-gray-700">
                    Este gráfico apresenta a evolução do PIB brasileiro e do PIB per capita ao longo dos anos, em dólares.
                    O eixo esquerdo representa o PIB total, enquanto o eixo direito representa o PIB per capita.
                </p>
            </div>
            <div className="w-full h-[500px]">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default PIBChartPage;