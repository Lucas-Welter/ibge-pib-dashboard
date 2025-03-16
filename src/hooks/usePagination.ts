import { useState, useEffect, useRef } from 'react';

interface UsePaginationOptions<T> {
  data: T[] | undefined;
  itemsPerPage: number;
  initialPage?: number;
  sortFn?: (a: T, b: T) => number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  paginatedData: T[];
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export function usePagination<T>({
  data,
  itemsPerPage,
  initialPage = 1,
  sortFn
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  // Store state in refs to avoid re-renders triggering effects
  const dataRef = useRef<T[] | undefined>(data);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Safe data array
  const safeData = data || [];
  
  // Calculate total pages
  const totalPages = Math.max(Math.ceil(safeData.length / itemsPerPage), 1);
  
  // Only reset to page 1 if data reference changes (not on every render)
  useEffect(() => {
    // Compare by length and first item as a basic check if data changed
    if (data && (!dataRef.current || 
        data.length !== dataRef.current.length ||
        (data.length > 0 && dataRef.current.length > 0 && 
         JSON.stringify(data[0]) !== JSON.stringify(dataRef.current[0])))) {
      
      setCurrentPage(1);
      dataRef.current = data;
    }
  }, [data]);
  
  // Ensure current page is valid (runs only when totalPages changes)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  // Get sorted data if needed
  const processedData = sortFn ? [...safeData].sort(sortFn) : safeData;
  
  // Get data for current page
  const paginatedData = processedData.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  // Navigation functions - implement with direct state updates
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    if (validPage !== currentPage) {
      setCurrentPage(validPage);
    }
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
  
  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    goToNextPage,
    goToPreviousPage
  };
}