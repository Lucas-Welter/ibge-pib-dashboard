import { useQuery } from '@tanstack/react-query';
import { useRef, useEffect, useState } from 'react';
import { fetchPIBData } from '../../services/api/ibgeApi';
import { formatCurrency } from '../../utils/formatters';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const ITEMS_PER_PAGE = 10;

const PIBTablePage = () => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showFullTable, setShowFullTable] = useState(false);
  
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
  
  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 640;
      // Only update if there's an actual change in mobile status
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
        
        // Reset to mobile view only when switching from desktop to mobile
        if (newIsMobile && !isMobile) {
          setShowFullTable(false);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  
  // Scroll to top when page changes
  useEffect(() => {
    if (tableRef.current) {
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 10);
    }
  }, [currentPage]);
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (error) {
    return <Error onRetry={() => refetch()} />;
  }
  
  // Verifying if there is data to display
  if (!pibData || pibData.length === 0) {
    return <Error message="Não há dados disponíveis para exibição." />;
  }

  // Sort data by year (ascending)
  const sortedData = [...pibData].sort((a, b) => a.year - b.year);
  
  // Calculate pagination values
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  
  // Get data for current page
  const paginatedData = sortedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Render card view for mobile devices
  const renderCardView = () => (
    <div className="space-y-4">
      {paginatedData.map((item) => (
        <div key={item.year} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-lg font-semibold text-center mb-2 bg-gray-50 py-1 rounded">
            {item.year}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600">PIB Total:</div>
            <div className="text-right font-medium">{formatCurrency(item.pib)}</div>
            
            <div className="text-gray-600">PIB Per Capita:</div>
            <div className="text-right font-medium">{formatCurrency(item.pibPerCapita)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render table view for desktop devices
  const renderTableView = () => (
    <div className={`${isMobile ? 'overflow-x-auto' : ''}`}>
      <table className="min-w-full bg-white border border-gray-200" style={{ minWidth: isMobile ? '640px' : '100%' }}>
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-6 text-left font-medium text-gray-600 uppercase tracking-wider border-b">
              Ano
            </th>
            <th className="py-3 px-6 text-right font-medium text-gray-600 uppercase tracking-wider border-b">
              PIB Total (US$)
            </th>
            <th className="py-3 px-6 text-right font-medium text-gray-600 uppercase tracking-wider border-b">
              PIB Per Capita (US$)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {paginatedData.map((item) => (
            <tr key={item.year} className="hover:bg-gray-50">
              <td className="py-4 px-6 border-b border-gray-200 whitespace-nowrap">
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
    const itemStart = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const itemEnd = Math.min(currentPage * ITEMS_PER_PAGE, sortedData.length);
    
    // Simple mobile view
    if (isSimplified) {
      return (
        <div className="mt-4 mb-6 pb-4 flex flex-col items-center">
          <div className="text-sm text-gray-600 mb-3">
            {itemStart}-{itemEnd} de {sortedData.length}
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
    
    // Full desktop or mobile table view
    return (
      <div className={`mt-6 mb-6 pb-4 flex ${isMobile ? 'flex-col space-y-2' : 'justify-between'} items-center`}>
        <div className={`text-sm text-gray-600 ${isMobile ? 'mb-3 text-center' : ''}`}>
          {isMobile ? (
            <>
              {itemStart}-{itemEnd} de {sortedData.length}
            </>
          ) : (
            <>
              Mostrando {itemStart} a {itemEnd} de {sortedData.length} registros
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
        
        {/* Mobile view option toggle */}
        {isMobile && (
          <div className="mb-4">
            <button 
              onClick={() => setShowFullTable(!showFullTable)}
              className="w-full py-2 bg-ibge-blue text-white rounded-md text-sm font-medium"
            >
              {showFullTable ? "Mostrar visualização em cards" : "Mostrar tabela completa"}
            </button>
          </div>
        )}
      </div>
      
      {/* Conditional rendering based on screen size and user preference */}
      {isMobile && !showFullTable ? (
        <div className="px-4">
          {renderCardView()}
          {renderPagination(true)}
        </div>
      ) : (
        <>
          <div className={`${isMobile ? 'overflow-x-auto' : ''}`} style={{ minHeight: isMobile ? '300px' : 'auto' }}>
            {renderTableView()}
          </div>
          <div className="px-4 sm:px-0">
            {renderPagination()}
          </div>
        </>
      )}
    </div>
  );
};

export default PIBTablePage;