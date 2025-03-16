import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as ibgeApi from '../../services/api/ibgeApi';
import PIBTablePage from './PIBTable';
import { BrowserRouter } from 'react-router-dom';
import * as useResponsiveModule from '../../hooks/useResponsive';

vi.mock('../../services/api/ibgeApi', () => ({
    fetchPIBData: vi.fn(),
}));

// Mock the useResponsive hook
vi.mock('../../hooks/useResponsive', () => ({
    useResponsive: vi.fn(() => ({
        isMobile: false,
        showFullView: false,
        setShowFullView: vi.fn(),
        toggleFullView: vi.fn(),
    })),
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

    // Helper function to render the component with necessary providers
    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <PIBTablePage />
                </QueryClientProvider>
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });

        vi.resetAllMocks();
        
        // Reset the useResponsive mock to default values
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: false,
            showFullView: false,
            setShowFullView: vi.fn(),
            toggleFullView: vi.fn(),
        });
    });

    test('should display loading component when data is being fetched', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockReturnValue(new Promise(() => { }));
        renderComponent();
        expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
    });

    test('should render table when data loads successfully', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        renderComponent();

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
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Ocorreu um erro ao carregar os dados.')).toBeInTheDocument();
        });
        expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    });

    test('should display no data message when data array is empty', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue([]);
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Não há dados disponíveis para exibição.')).toBeInTheDocument();
        });
    });

    test('should display dashboard KPI component with data', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
        });

        // Check if KPI component elements are in the document
        expect(screen.getByText('Indicadores do PIB')).toBeInTheDocument();
    });

    test('should format currency values correctly', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue([
            { year: 2020, pib: 1234567.89, pibPerCapita: 6543.21 }
        ]);
        
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
        });

        // Check currency formatting in the table
        const tableRows = screen.getAllByRole('row');
        expect(tableRows.length).toBeGreaterThan(1);
        
        // Get the first data row (second row in the table)
        const firstDataRow = tableRows[1];
        const cells = within(firstDataRow).getAllByRole('cell');
        
        // Check PIB Total cell
        expect(cells[1]).toHaveTextContent('US$ 1.234.567,89');
        
        // Check PIB Per Capita cell  
        expect(cells[2]).toHaveTextContent('US$ 6.543,21');
    });

    test('should implement pagination correctly', async () => {
        // Create enough mock data to trigger pagination (more than ITEMS_PER_PAGE)
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        renderComponent();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Tabela de PIB por Ano' })).toBeInTheDocument();
        });

        // Check if pagination info is displayed correctly using more specific queries
        // Use regex to be more flexible with the exact text which might have whitespace issues
        const paginationInfo = screen.getByText(/Mostrando 1 a 10 de 12 registros/);
        expect(paginationInfo).toBeInTheDocument();
        
        const pageInfo = screen.getByText(/Página 1 de 2/);
        expect(pageInfo).toBeInTheDocument();
        
        // Find buttons by their roles and content
        const buttons = screen.getAllByRole('button');
        const prevButton = buttons.find(btn => btn.textContent === 'Anterior');
        const nextButton = buttons.find(btn => btn.textContent === 'Próxima');
        
        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
        
        // Check if initial "Anterior" button is disabled
        expect(prevButton).toBeDisabled();
        expect(nextButton).not.toBeDisabled();
        
        // Navigate to next page
        if (nextButton) {
            fireEvent.click(nextButton);
        }
        
        // Wait for the page number to update
        await waitFor(() => {
            const updatedPageInfo = screen.getByText(/Página 2 de 2/);
            expect(updatedPageInfo).toBeInTheDocument();
        });
        
        // Check updated pagination information
        expect(screen.getByText(/Mostrando 11 a 12 de 12 registros/)).toBeInTheDocument();
        
        // Get the updated buttons after state change
        const updatedButtons = screen.getAllByRole('button');
        const updatedPrevButton = updatedButtons.find(btn => btn.textContent === 'Anterior');
        const updatedNextButton = updatedButtons.find(btn => btn.textContent === 'Próxima');
        
        // Check button states
        expect(updatedNextButton).toBeDisabled();
        expect(updatedPrevButton).not.toBeDisabled();
        
        // Go back to page 1
        if (updatedPrevButton) {
            fireEvent.click(updatedPrevButton);
        }
        
        // Verify we're back on page 1
        await waitFor(() => {
            const finalPageInfo = screen.getByText(/Página 1 de 2/);
            expect(finalPageInfo).toBeInTheDocument();
        });
    });

    test('should retry fetch data when retry button is clicked', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockRejectedValueOnce(new Error('API Error'));
        
        renderComponent();

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

    test('should apply year range filter correctly', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        renderComponent();
        
        await waitFor(() => {
            expect(screen.getByText('Tabela de PIB por Ano')).toBeInTheDocument();
        });
        
        // Check filter section exists
        expect(screen.getByText('Filtrar por período:')).toBeInTheDocument();
        
        // Find the year selectors and change them
        const startYearSelect = screen.getByLabelText('De:');
        const endYearSelect = screen.getByLabelText('Até:');
        
        // Simulate changing the start year to 2015
        fireEvent.change(startYearSelect, { target: { value: '2015' } });
        
        // Simulate changing the end year to 2020
        fireEvent.change(endYearSelect, { target: { value: '2020' } });
        
        // Check if the table contains only years within that range
        const rows = screen.getAllByRole('row');
        
        // Check if we only have years between 2015-2020 in the table
        // First row is the header, so we start from index 1
        for (let i = 1; i < rows.length; i++) {
            const yearText = rows[i].children[0].textContent;
            const year = yearText ? parseInt(yearText) : 0;
            expect(year).toBeGreaterThanOrEqual(2015);
            expect(year).toBeLessThanOrEqual(2020);
        }
        
        // Test filter reset button
        const resetButton = screen.getByText('Limpar filtro');
        fireEvent.click(resetButton);
        
        // After reset, we should see years including 2010 again
        await waitFor(() => {
            const firstDataRow = screen.getAllByRole('row')[1];
            expect(firstDataRow).toHaveTextContent('2010');
        });
    });

    test('should display mobile card view when on mobile', async () => {
        // Mock useResponsive to simulate mobile environment
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: true,
            showFullView: false,
            setShowFullView: vi.fn(),
            toggleFullView: vi.fn(),
        });
        
        // Use a smaller, more specific dataset
        const mobileTestData = [
            { year: 2022, pib: 1300000, pibPerCapita: 6000 },
            { year: 2023, pib: 1350000, pibPerCapita: 6200 },
        ];
        
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mobileTestData);
        
        renderComponent();
        
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Tabela de PIB por Ano' })).toBeInTheDocument();
        });
        
        // Find the toggle button for mobile view
        const toggleButton = screen.getByText('Mostrar tabela completa');
        expect(toggleButton).toBeInTheDocument();
        
        // Check that we're seeing cards, not a table
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        
        // Check that we have card elements (bg-white + rounded classes)
        const cards = screen.getAllByText(/PIB Total:/);
        expect(cards.length).toBeGreaterThan(0);
        
        // Verify we see our specific test data year in a card
        const yearElements = screen.getAllByText('2022');
        const cardYearElement = yearElements.find(element => 
            element.className?.includes('rounded-full')
        );
        expect(cardYearElement).toBeInTheDocument();
    });

    test('should call setShowFullView when toggle button is clicked', async () => {
        // Set up responsive mock for mobile device
        const setShowFullView = vi.fn();
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: true,
            showFullView: false,
            setShowFullView,
            toggleFullView: vi.fn(),
        });
        
        // Use a simplified dataset
        const simpleData = [
            { year: 2022, pib: 1300000, pibPerCapita: 6000 },
            { year: 2023, pib: 1350000, pibPerCapita: 6200 },
        ];
        
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(simpleData);
        
        renderComponent();
        
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Tabela de PIB por Ano' })).toBeInTheDocument();
        });
        
        // Find the toggle button with specific text content
        const toggleButtons = screen.getAllByRole('button');
        const toggleButton = toggleButtons.find(btn => 
            btn.textContent === 'Mostrar tabela completa'
        );
        
        expect(toggleButton).toBeInTheDocument();
        
        // Click the toggle button
        if (toggleButton) {
            fireEvent.click(toggleButton);
        }
        
        // Verify setShowFullView was called with true
        expect(setShowFullView).toHaveBeenCalledWith(true);
    });
    
    test('should show table view button when in full view mode', async () => {
        // Set up responsive mock for mobile device in full view mode
        const setShowFullView = vi.fn();
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: true,
            showFullView: true, // Start with full view enabled
            setShowFullView,
            toggleFullView: vi.fn(),
        });
        
        // Use a simplified dataset
        const simpleData = [
            { year: 2022, pib: 1300000, pibPerCapita: 6000 },
        ];
        
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(simpleData);
        
        renderComponent();
        
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Tabela de PIB por Ano' })).toBeInTheDocument();
        });
        
        // Find the toggle button with specific text content
        const toggleButtons = screen.getAllByRole('button');
        const toggleButton = toggleButtons.find(btn => 
            btn.textContent === 'Mostrar visualização em cards'
        );
        
        expect(toggleButton).toBeInTheDocument();
    });
});