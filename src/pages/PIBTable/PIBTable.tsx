import { useQuery } from '@tanstack/react-query';
import { fetchPIBData } from '../../services/api/ibgeApi';
import { useState } from 'react';
import Loading from '../../components/Loading';
import Error from '../../components/Error';

const ITEMS_PER_PAGE = 10;

const PIBTablePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Buscar dados do PIB utilizando o Tanstack Query
  const { 
    data: pibData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['pibData'],
    queryFn: fetchPIBData,
  });
  
  // Renderizar o componente de loading durante a busca dos dados
  if (isLoading) {
    return <Loading />;
  }
  
  // Renderizar o componente de erro caso ocorra algum problema
  if (error) {
    return <Error onRetry={() => refetch()} />;
  }
  
  // Verificar se temos dados para mostrar
  if (!pibData || pibData.length === 0) {
    return <Error message="Não há dados disponíveis para exibição." />;
  }

  // Calcular o número total de páginas
  const totalPages = Math.ceil(pibData.length / ITEMS_PER_PAGE);
  
  // Obter os dados para a página atual
  const paginatedData = pibData
    .sort((a, b) => a.year - b.year) // Ordenar por ano (ascendente)
    .slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  
  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  // Função para ir para a página anterior
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // Função para ir para a próxima página
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Tabela de PIB por Ano</h1>
      
      <div className="mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
        <h2 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Sobre esta tabela</h2>
        <p className="text-gray-700">
          Esta tabela apresenta os valores do PIB brasileiro e do PIB per capita por ano, em dólares. 
          Os dados estão ordenados do ano mais antigo para o mais recente.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
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
      
      {/* Paginação */}
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, pibData.length)} de {pibData.length} registros
        </div>
        <div className="flex space-x-2">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-600 
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <div className="px-4 py-2 text-gray-600 flex items-center">
            Página {currentPage} de {totalPages}
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-600 
                     hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

export default PIBTablePage;