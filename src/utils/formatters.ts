/**
 * Formats a number as a currency value in USD with the Brazilian locale
 */
export const formatCurrency = (value: number, options?: Intl.NumberFormatOptions): string => {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
  
    return new Intl.NumberFormat('pt-BR', { ...defaultOptions, ...options }).format(value);
  };
  
  /**
   * Formats a number as a compact currency value (e.g., "US$ 1 mi")
   */
  export const formatCompactCurrency = (value: number): string => {
    return formatCurrency(value, {
      notation: 'compact',
      compactDisplay: 'short',
    });
  };
  
  /**
   * Formats a number as a whole number currency (no decimal places)
   */
  export const formatWholeNumberCurrency = (value: number): string => {
    return formatCurrency(value, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };