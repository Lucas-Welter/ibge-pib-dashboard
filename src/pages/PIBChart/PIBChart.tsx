import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
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
import { createChartData, createChartOptions } from './chartConfig';

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
    const chartRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showFullChart, setShowFullChart] = useState(false);
    
    // Update isMobile state on window resize
    useEffect(() => {
        const handleResize = () => {
            const newIsMobile = window.innerWidth < 768;
            // Only update if there's an actual change in mobile status
            if (newIsMobile !== isMobile) {
                setIsMobile(newIsMobile);
                
                // Reset to mobile view only when switching from desktop to mobile
                if (newIsMobile && !isMobile) {
                    setShowFullChart(false);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);
    
    // Scroll to top when view changes
    useEffect(() => {
        if (chartRef.current) {
            setTimeout(() => {
                chartRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 10);
        }
    }, [showFullChart]);

    // Fetch PIB data using React Query
    const {
        data: pibData,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['pibData'],
        queryFn: fetchPIBData,
    });
    
    if (isLoading) {
        return <Loading />;
    }

    if (error) {
        return <Error onRetry={() => refetch()} />;
    }

    if (!pibData || pibData.length === 0) {
        return <Error message="Não há dados disponíveis para exibição." />;
    }

    // Sort data and use chart config helper to prepare the data
    const sortedData = [...pibData].sort((a, b) => a.year - b.year);
    const chartData = createChartData({ 
        pibData: sortedData, 
        isMobile, 
        showFullChart 
    });
    const options = createChartOptions(isMobile);

    return (
        <div ref={chartRef} className="bg-white sm:rounded-lg shadow-md p-0 sm:p-4 md:p-6 full-width-mobile">
            <div className="px-4 sm:px-0">
                <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 pt-4 sm:pt-0">Gráfico de Evolução do PIB</h1>
                
                <div className="mb-4 p-3 md:p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h2 className="text-xs md:text-sm uppercase tracking-wider text-gray-500 mb-1 md:mb-2">Sobre este gráfico</h2>
                    <p className="text-sm md:text-base text-gray-700">
                        Este gráfico apresenta a evolução do PIB brasileiro e do PIB per capita ao longo dos anos, em dólares.
                        {!isMobile && " O eixo esquerdo representa o PIB total, enquanto o eixo direito representa o PIB per capita."}
                    </p>
                </div>
                
                {/* Mobile view option toggle */}
                {isMobile && (
                    <div className="mb-4">
                        <button 
                            onClick={() => setShowFullChart(!showFullChart)}
                            className="w-full py-2 bg-ibge-blue text-white rounded-md text-sm font-medium"
                        >
                            {showFullChart ? "Mostrar versão simplificada" : "Mostrar dados completos"}
                        </button>
                    </div>
                )}
            </div>
            
            {/* Chart container with horizontal scroll when needed */}
            <div className={`${showFullChart && isMobile ? 'overflow-x-auto' : ''}`} style={{ minHeight: isMobile ? '300px' : 'auto' }}>
                {/* Responsive height based on viewport */}
                <div className={`${showFullChart && isMobile ? 'w-[800px]' : 'w-full'} h-[300px] md:h-[400px] lg:h-[500px]`}>
                    <Line data={chartData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default PIBChartPage;