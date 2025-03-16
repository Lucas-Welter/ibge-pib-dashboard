import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect, useState } from 'react';
import { fetchPIBData } from '../../services/api/ibgeApi';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../../components/Loading';
import Error from '../../components/Error';
import DashboardKPI from '../../components/DashboardKPI';
import YearRangeFilter from '../../components/YearRangeFilter';
import { useResponsive } from '../../hooks/useResponsive';
import { usePagination } from '../../hooks/usePagination';

const ITEMS_PER_PAGE = 10;

const PIBTablePage = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  
  const { isMobile, showFullView, setShowFullView } = useResponsive({
    breakpoint: 640
  });
  
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
  
  const [yearRange, setYearRange] = useState({ start: 0, end: 9999 });
  
  // Order and filter data when available
  const processedData = (() => {
    if (!pibData || pibData.length === 0) return [];
    // Asc order
    const sortedData = [...pibData].sort((a, b) => a.year - b.year);
    // Apply year interval filter
    return sortedData.filter(item => 
      item.year >= yearRange.start && item.year <= yearRange.end
    );
  })();
  
  // Use Pagination hook
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage
  } = usePagination({
    data: processedData,
    itemsPerPage: ITEMS_PER_PAGE,
    sortFn: (a, b) => a.year - b.year
  });
  
  // Scroll to top when view changes
  useEffect(() => {
    if (tableRef.current) {
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 10);
    }
  }, [currentPage, showFullView]);
  
  // Obtain max and min year for filter
  const yearBounds = (() => {
    if (!pibData || pibData.length === 0) return { minYear: 0, maxYear: 0 };
    
    const sortedData = [...pibData].sort((a, b) => a.year - b.year);
    return {
      minYear: sortedData[0].year,
      maxYear: sortedData[sortedData.length - 1].year
    };
  })();
  
  const handleFilterChange = (start: number, end: number) => {
    setYearRange({ start, end });
    goToPage(1);
  };
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (error) {
    return <Error onRetry={() => refetch()} />;
  }
  
  if (!pibData || pibData.length === 0) {
    return <Error message="Não há dados disponíveis para exibição." />;
  }

  // Sorting data for KPI
  const sortedData = [...pibData].sort((a, b) => a.year - b.year);
  
  // Render card list for mobile
  const renderCardView = () => (
    <div className="space-y-4">
      {paginatedData.map((item) => (
        <div key={item.year} 
             className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-3">
            <div className="text-lg font-semibold py-1 px-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
              {item.year}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-gray-600">PIB Total:</div>
            <div className="text-right font-medium">{formatCurrency(item.pib)}</div>
            
            <div className="text-gray-600">PIB Per Capita:</div>
            <div className="text-right font-medium">{formatCurrency(item.pibPerCapita)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render table for desktop 
  const renderTableView = () => (
    <div className={`${isMobile ? 'overflow-x-auto' : ''}`}>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden" 
             style={{ minWidth: isMobile ? '640px' : '100%' }}>
        <thead>
          <tr className="bg-gradient-to-r from-primary/10 to-secondary/10 text-gray-700">
            <th className="py-3 px-6 text-left font-medium uppercase tracking-wider border-b">
              Ano
            </th>
            <th className="py-3 px-6 text-right font-medium uppercase tracking-wider border-b">
              PIB Total (US$)
            </th>
            <th className="py-3 px-6 text-right font-medium uppercase tracking-wider border-b">
              PIB Per Capita (US$)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedData.map((item) => (
            <tr key={item.year} 
                className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-6 border-b border-gray-200 whitespace-nowrap font-medium">
                {item.year}
              </td>
              <td className="py-4 px-6 text-right border-b border-gray-200 whitespace-nowrap">
                {formatCurrency(item.pib)}
              </td>
              <td className="py-4 px-6 text-right border-b border-gray-200 whitespace-nowrap">
                {formatCurrency(item.pibPerCapita)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render pagination controls
  const renderPagination = (isSimplified = false) => {
    const itemStart = processedData.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const itemEnd = Math.min(currentPage * ITEMS_PER_PAGE, processedData.length);
    
    // Mobile simplified view pagination
    if (isSimplified) {
      return (
        <div className="mt-4 mb-6 pb-4 flex flex-col items-center">
          <div className="text-sm text-gray-600 mb-3">
            {itemStart}-{itemEnd} de {processedData.length}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-600 text-lg
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              ←
            </button>
            <div className="px-3 py-2 text-gray-600 text-sm flex items-center">
              {currentPage}/{totalPages}
            </div>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-600 text-lg
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      );
    }
    
    // Complete table pagination for mobile or desktop
    return (
      <div className={`mt-6 mb-6 pb-4 flex ${isMobile ? 'flex-col space-y-2' : 'justify-between'} items-center`}>
        <div className={`text-sm text-gray-600 ${isMobile ? 'mb-3 text-center' : ''}`}>
          {isMobile ? (
            <>
              {itemStart}-{itemEnd} de {processedData.length}
            </>
          ) : (
            <>
              Mostrando {itemStart} a {itemEnd} de {processedData.length} registros
            </>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className={`${isMobile ? 'px-4 py-2 text-lg' : 'px-4 py-2'} border border-gray-300 rounded-md bg-white text-gray-600 
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
          >
            {isMobile ? '←' : 'Anterior'}
          </button>
          <div className={`${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} text-gray-600 flex items-center`}>
            {isMobile ? `${currentPage}/${totalPages}` : `Página ${currentPage} de ${totalPages}`}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`${isMobile ? 'px-4 py-2 text-lg' : 'px-4 py-2'} border border-gray-300 rounded-md bg-white text-gray-600 
                       hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
          >
            {isMobile ? '→' : 'Próxima'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <DashboardKPI data={sortedData} />
        
      {/* Table Content */}
      <div ref={tableRef} className="bg-white sm:rounded-lg shadow-md p-0 sm:p-4 md:p-6 full-width-mobile">
        <div className="px-4 sm:px-0">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 pt-4 sm:pt-0">Tabela de PIB por Ano</h1>
          
          <div className="mb-4 p-3 md:p-4 rounded-lg bg-gray-50 border border-gray-200">
            <h2 className="text-xs md:text-sm uppercase tracking-wider text-gray-500 mb-1 md:mb-2">Sobre esta tabela</h2>
            <p className="text-sm md:text-base text-gray-700">
              Esta tabela apresenta os valores do PIB brasileiro e do PIB per capita por ano, em dólares. 
              Os dados estão ordenados do ano mais antigo para o mais recente.
            </p>
          </div>
          
          <YearRangeFilter 
            startYear={yearBounds.minYear} 
            endYear={yearBounds.maxYear} 
            onFilterChange={handleFilterChange}
          />
          
          {/* Mobile view option toggle */}
          {isMobile && (
            <div className="mb-4">
              <button 
                onClick={() => setShowFullView(!showFullView)}
                className="w-full py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-md text-sm font-medium"
              >
                {showFullView ? "Mostrar visualização em cards" : "Mostrar tabela completa"}
              </button>
            </div>
          )}
        </div>
        
        {/* Main content - Cards or Table */}
        {isMobile && !showFullView ? (
          <div className="px-4 animate-fade-in">
            {renderCardView()}
            {renderPagination(true)}
          </div>
        ) : (
          <>
            <div className={`${isMobile ? 'overflow-x-auto animate-fade-in' : 'animate-fade-in'}`} style={{ minHeight: isMobile ? '300px' : 'auto' }}>
              {renderTableView()}
            </div>
            <div className="px-4 sm:px-0">
              {renderPagination()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PIBTablePage;