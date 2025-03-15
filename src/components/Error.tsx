import React from 'react';

interface ErrorProps {
  message?: string;
  onRetry?: () => void;  
}

const Error: React.FC<ErrorProps> = ({ 
  message = 'Ocorreu um erro ao carregar os dados.',
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{message}</p>
      </div>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-ibge-blue hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
};

export default Error;