import React, { useState } from 'react';

interface YearRangeFilterProps {
  startYear: number;
  endYear: number;
  onFilterChange: (start: number, end: number) => void;
}

const YearRangeFilter: React.FC<YearRangeFilterProps> = ({ 
  startYear, 
  endYear, 
  onFilterChange 
}) => {
  const [selectedStartYear, setSelectedStartYear] = useState(startYear);
  const [selectedEndYear, setSelectedEndYear] = useState(endYear);
  
  const yearOptions = Array.from(
    { length: (endYear - startYear) + 1 },
    (_, index) => startYear + index
  );
  
  const handleStartYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStart = parseInt(e.target.value);
    setSelectedStartYear(newStart);
    
    // Ensure that the the start year isn't higher than end year
    if (newStart > selectedEndYear) {
      setSelectedEndYear(newStart);
      onFilterChange(newStart, newStart);
    } else {
      onFilterChange(newStart, selectedEndYear);
    }
  };
  
  const handleEndYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnd = parseInt(e.target.value);
    setSelectedEndYear(newEnd);
    
    // Ensure that the final year isn't lower than start year
    if (newEnd < selectedStartYear) {
      setSelectedStartYear(newEnd);
      onFilterChange(newEnd, newEnd);
    } else {
      onFilterChange(selectedStartYear, newEnd);
    }
  };
  
  const handleReset = () => {
    setSelectedStartYear(startYear);
    setSelectedEndYear(endYear);
    onFilterChange(startYear, endYear);
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="font-medium text-gray-600">Filtrar por período:</div>
      
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center">
          <label htmlFor="startYear" className="text-sm text-gray-600 mr-2">
            De:
          </label>
          <select
            id="startYear"
            value={selectedStartYear}
            onChange={handleStartYearChange}
            className="p-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm focus:border-primary"
          >
            {yearOptions.map(year => (
              <option key={`start-${year}`} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center">
          <label htmlFor="endYear" className="text-sm text-gray-600 mr-2">
            Até:
          </label>
          <select
            id="endYear"
            value={selectedEndYear}
            onChange={handleEndYearChange}
            className="p-2 border border-gray-300 rounded bg-white text-gray-800 shadow-sm focus:border-primary"
          >
            {yearOptions.map(year => (
              <option key={`end-${year}`} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={handleReset}
          className="ml-auto sm:ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors"
        >
          Limpar filtro
        </button>
      </div>
    </div>
  );
};

export default YearRangeFilter;