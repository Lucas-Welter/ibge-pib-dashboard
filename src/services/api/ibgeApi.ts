import axios from 'axios';
import { PIBData, IBGEApiResponse } from './types';

// Axios config
const api = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v3',
});

// Relevant information id's
const PIB_AGGREGATE_ID = '6784'; 
const PIB_TOTAL_VARIABLE_ID = '9808'; 
const PIB_PER_CAPITA_VARIABLE_ID = '9810'; 

export const fetchPIBTotal = async (): Promise<Record<string, number>> => {
  try {
    const response = await api.get<IBGEApiResponse[]>(
      `/agregados/${PIB_AGGREGATE_ID}/periodos/all/variaveis/${PIB_TOTAL_VARIABLE_ID}?localidades=BR`
    );
    
    if (!response.data[0]?.resultados[0]?.series[0]?.serie) {
      throw new Error('Formato de resposta inválido');
    }
    
    return response.data[0].resultados[0].series[0].serie as Record<string, number>;
  } catch (error) {
    console.error('Erro ao buscar dados do PIB total:', error);
    throw error;
  }
};

export const fetchPIBPerCapita = async (): Promise<Record<string, number>> => {
  try {
    const response = await api.get<IBGEApiResponse[]>(
      `/agregados/${PIB_AGGREGATE_ID}/periodos/all/variaveis/${PIB_PER_CAPITA_VARIABLE_ID}?localidades=BR`
    );
    
    if (!response.data[0]?.resultados[0]?.series[0]?.serie) {
      throw new Error('Formato de resposta inválido');
    }
    
    return response.data[0].resultados[0].series[0].serie as Record<string, number>;
  } catch (error) {
    console.error('Erro ao buscar dados do PIB per capita:', error);
    throw error;
  }
};

// Combine all PIB data
export const fetchPIBData = async (): Promise<PIBData[]> => {
  try {
    const [pibTotal, pibPerCapita] = await Promise.all([
      fetchPIBTotal(),
      fetchPIBPerCapita(),
    ]);
    
    const years = Object.keys(pibTotal);
    
    return years
      .map(year => ({
        year: parseInt(year),
        pib: parseFloat(String(pibTotal[year])),
        pibPerCapita: parseFloat(String(pibPerCapita[year] || 0)),
      }))
      .sort((a, b) => a.year - b.year); 
  } catch (error) {
    console.error('Erro ao buscar dados combinados do PIB:', error);
    throw error;
  }
}