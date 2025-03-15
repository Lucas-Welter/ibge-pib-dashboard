export interface PIBData {
    year: number;
    pib: number;           
    pibPerCapita: number;   
  }
  
  export interface IBGEApiResponse {
    id: string;
    variavel: string;
    unidade: string;
    resultados: Array<{
      series: Array<{
        localidade: {
          id: string;
          nivel: {
            id: string;
            nome: string;
          };
          nome: string;
        };
        serie: Record<string, string | number>;
      }>;
    }>;
  }