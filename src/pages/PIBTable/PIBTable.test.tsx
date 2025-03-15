import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as ibgeApi from '../../services/api/ibgeApi';
import PIBTablePage from './PIBTable';

vi.mock('../../services/api/ibgeApi', () => ({
    fetchPIBData: vi.fn(),
}));

describe('PIBTablePage', () => {
    let queryClient: QueryClient;
    const mockData = [
        { year: 2018, pib: 1000000, pibPerCapita: 5000 },
        { year: 2019, pib: 1100000, pibPerCapita: 5500 },
        { year: 2020, pib: 1050000, pibPerCapita: 5200 },
        { year: 2021, pib: 1200000, pibPerCapita: 5800 },
        { year: 2022, pib: 1300000, pibPerCapita: 6000 },
        { year: 2023, pib: 1350000, pibPerCapita: 6200 },
        { year: 2010, pib: 800000, pibPerCapita: 4000 },
        { year: 2011, pib: 850000, pibPerCapita: 4200 },
        { year: 2012, pib: 900000, pibPerCapita: 4500 },
        { year: 2013, pib: 950000, pibPerCapita: 4700 },
        { year: 2014, pib: 980000, pibPerCapita: 4800 },
        { year: 2015, pib: 950000, pibPerCapita: 4600 },
    ];

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });

        vi.resetAllMocks();
    });

    test('should display loading component when data is being fetched', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockReturnValue(new Promise(() => { }));
        render(
            <QueryClientProvider client={queryClient}>
                <PIBTablePage />
            </QueryClientProvider>
        );
        expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
    });

    test('should render table when data loads successfully', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        render(
            <QueryClientProvider client={queryClient}>
                <PIBTablePage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
        });
        
        expect(screen.getByText('Ano')).toBeInTheDocument();
        expect(screen.getByText('PIB Total (US$)')).toBeInTheDocument();
        expect(screen.getByText('PIB Per Capita (US$)')).toBeInTheDocument();
        
        // Check if data is ordered by year (ascending)
        const rows = screen.getAllByRole('row');
        // First row is header, second row should have the oldest year
        expect(rows[1]).toHaveTextContent('2010');
        expect(rows[1]).toHaveTextContent('US$ 800.000,00');
        expect(rows[1]).toHaveTextContent('US$ 4.000,00');
    });

    test('should display error message when data fetching fails', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockRejectedValue(new Error('API Error'));
        render(
            <QueryClientProvider client={queryClient}>
                <PIBTablePage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Ocorreu um erro ao carregar os dados.')).toBeInTheDocument();
        });
        expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    });

    test('should display no data message when data array is empty', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue([]);
        render(
            <QueryClientProvider client={queryClient}>
                <PIBTablePage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Não há dados disponíveis para exibição.')).toBeInTheDocument();
        });
    });

    test('should format currency values correctly', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue([
            { year: 2020, pib: 1234567.89, pibPerCapita: 6543.21 }
        ]);
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBTablePage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
        });

        // Check currency formatting with thousands separators and decimal places
        expect(screen.getByText('US$ 1.234.567,89')).toBeInTheDocument();
        expect(screen.getByText('US$ 6.543,21')).toBeInTheDocument();
    });

    test('should implement pagination correctly', async () => {
        // Create enough mock data to trigger pagination (more than ITEMS_PER_PAGE)
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBTablePage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
        });

        // Check if pagination info is displayed correctly
        expect(screen.getByText('Mostrando 1 a 10 de 12 registros')).toBeInTheDocument();
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
        
        // Check if initial "Anterior" button is disabled
        const prevButton = screen.getByText('Anterior');
        expect(prevButton).toBeDisabled();
        
        // Navigate to next page
        const nextButton = screen.getByText('Próxima');
        expect(nextButton).not.toBeDisabled();
        fireEvent.click(nextButton);
        
        // Check if page 2 is displayed
        expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
        expect(screen.getByText('Mostrando 11 a 12 de 12 registros')).toBeInTheDocument();
        
        // Check if "Próxima" button is now disabled on the last page
        expect(nextButton).toBeDisabled();
        
        // Check if "Anterior" button is enabled
        expect(prevButton).not.toBeDisabled();
        
        // Go back to page 1
        fireEvent.click(prevButton);
        expect(screen.getByText('Página 1 de 2')).toBeInTheDocument();
    });

    test('should retry fetch data when retry button is clicked', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockRejectedValueOnce(new Error('API Error'));
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBTablePage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Ocorreu um erro ao carregar os dados.')).toBeInTheDocument();
        });
        
        // Mock success response for retry
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValueOnce(mockData);
        
        // Click retry button
        const retryButton = screen.getByText('Tentar novamente');
        fireEvent.click(retryButton);
        
        // Check if retry was triggered
        expect(ibgeApi.fetchPIBData).toHaveBeenCalledTimes(2);
        
        // Check if table is now displayed
        await waitFor(() => {
            expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
        });
    });

    test('should display proper about information', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBTablePage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
        });
        
        // Check about section content
        expect(screen.getByText('Sobre esta tabela')).toBeInTheDocument();
        expect(screen.getByText(/Esta tabela apresenta os valores do PIB brasileiro e do PIB per capita por ano/)).toBeInTheDocument();
    });
});