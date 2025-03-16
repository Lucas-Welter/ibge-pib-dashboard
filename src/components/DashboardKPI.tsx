import React, { useState } from 'react';
import { PIBData } from '../services/api/types';
import { useResponsive } from '../hooks/useResponsive';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';

interface DashboardKPIProps {
    data: PIBData[];
}

const DashboardKPI: React.FC<DashboardKPIProps> = ({ data }) => {
    //Responsive hook
    const { isMobile } = useResponsive({
        breakpoint: 768,
    });

    const [isExpanded, setIsExpanded] = useState(!isMobile);

    if (!data || data.length === 0) return null;

    // Sort year to obtain the oldest and newest data
    const sortedData = [...data].sort((a, b) => a.year - b.year);
    const oldestData = sortedData[0];
    const latestData = sortedData[sortedData.length - 1];

    // Obtain percentual variation
    const pibVariation = ((latestData.pib - oldestData.pib) / oldestData.pib) * 100;
    const pibPerCapitaVariation = ((latestData.pibPerCapita - oldestData.pibPerCapita) / oldestData.pibPerCapita) * 100;

    // Obtain annual growth average
    const yearDiff = latestData.year - oldestData.year;
    const avgYearlyGrowth = yearDiff > 0 ? (Math.pow((latestData.pib / oldestData.pib), 1 / yearDiff) - 1) * 100 : 0;

    return (
        <div className="mb-6">
            {/* KPI main pannel */}
            <div className={`bg-white rounded-lg shadow-md border-l-4 border-primary transition-all duration-300 ${isExpanded ? 'pb-4' : 'pb-0'}`}>
                {/* Pannel header */}
                <div
                    className="flex justify-between items-center p-4 cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center">
                        <svg
                            className="h-5 w-5 mr-2 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        <h2 className="text-lg font-semibold text-gray-800">Indicadores do PIB</h2>
                    </div>

                    {/* Dropdown chevron icon */}
                    <div className="text-gray-500 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                <div className={`border-t border-gray-200 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}></div>

                {/* Dropdown pannel content */}
                <div
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 pt-0 transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
                        }`}
                    aria-expanded={isExpanded}
                >
                    {/* Last PIB */}
                    <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">PIB Atual ({latestData.year})</h3>
                        <p className="text-2xl font-bold text-gray-800">{formatCompactCurrency(latestData.pib)}</p>
                        <div className={`flex items-center mt-2 text-sm ${pibVariation >= 0 ? 'text-success' : 'text-danger'}`}>
                            <span className="flex items-center">
                                {pibVariation >= 0 ? (
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                    </svg>
                                )}
                                {pibVariation.toFixed(1)}% desde {oldestData.year}
                            </span>
                        </div>
                    </div>

                    {/* PIB per Capita */}
                    <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">PIB per Capita ({latestData.year})</h3>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(latestData.pibPerCapita)}</p>
                        <div className={`flex items-center mt-2 text-sm ${pibPerCapitaVariation >= 0 ? 'text-success' : 'text-danger'}`}>
                            <span className="flex items-center">
                                {pibPerCapitaVariation >= 0 ? (
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                    </svg>
                                )}
                                {pibPerCapitaVariation.toFixed(1)}% desde {oldestData.year}
                            </span>
                        </div>
                    </div>

                    {/* Annual growth average */}
                    <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Crescimento Médio Anual</h3>
                        <p className="text-2xl font-bold text-gray-800">{avgYearlyGrowth.toFixed(2)}%</p>
                        <div className="text-sm text-gray-500 mt-2">
                            Calculado de {oldestData.year} a {latestData.year}
                        </div>
                    </div>

                    {/* Analysis year range */}
                    <div className="bg-white rounded border border-gray-200 p-4 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Período Analisado</h3>
                        <p className="text-2xl font-bold text-gray-800">{yearDiff} anos</p>
                        <div className="text-sm text-gray-500 mt-2">
                            De {oldestData.year} até {latestData.year}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardKPI;