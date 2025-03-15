import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Carregando dados...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-ibge-blue animate-spin mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default Loading;