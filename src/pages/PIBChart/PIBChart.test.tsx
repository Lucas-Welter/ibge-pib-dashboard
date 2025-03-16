import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as ibgeApi from '../../services/api/ibgeApi';
import PIBChartPage from './PIBChart';
import { BrowserRouter } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import * as useResponsiveModule from '../../hooks/useResponsive';
import * as chartConfigModule from './chartConfig';

vi.mock('../../services/api/ibgeApi', () => ({
    fetchPIBData: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
    Line: vi.fn(() => <div data-testid="line-chart">Chart Mock</div>),
}));

vi.mock('../../hooks/useResponsive', () => ({
    useResponsive: vi.fn(() => ({
        isMobile: false,
        showFullView: false,
        setShowFullView: vi.fn(),
        toggleFullView: vi.fn(),
    })),
}));

// Spy on chartConfig functions instead of mocking them completely
vi.spyOn(chartConfigModule, 'createChartData');
vi.spyOn(chartConfigModule, 'createChartOptions');

describe('PIBChartPage', () => {
    let queryClient: QueryClient;
    const mockData = [
        { year: 2018, pib: 1000000, pibPerCapita: 5000 },
        { year: 2019, pib: 1100000, pibPerCapita: 5500 },
        { year: 2020, pib: 1050000, pibPerCapita: 5200 }
    ];

    beforeEach(() => {
        // Setup a fresh QueryClient for each test to avoid state sharing
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });

        vi.resetAllMocks();
        vi.mocked(Line).mockClear();

        // Reset responsive hook to default values
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: false,
            showFullView: false,
            setShowFullView: vi.fn(),
            toggleFullView: vi.fn(),
        });
    });

    // Helper function to render the component with necessary providers
    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <PIBChartPage />
                </QueryClientProvider>
            </BrowserRouter>
        );
    };

    test('should display loading component when data is being fetched', async () => {
        // Return a pending promise to keep the loading state active
        vi.mocked(ibgeApi.fetchPIBData).mockReturnValue(new Promise(() => { }));
        
        renderComponent();
        
        expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
    });

    test('should render chart when data loads successfully', async () => {
        // Simulate successful API response
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        renderComponent();

        // Verify that the title and chart elements are rendered
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gráfico de Evolução do PIB' })).toBeInTheDocument();
        });
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByText(/Este gráfico apresenta a evolução do PIB brasileiro/)).toBeInTheDocument();
        
        // Verify chartConfig functions were called with correct parameters
        expect(chartConfigModule.createChartData).toHaveBeenCalledWith({
            pibData: expect.any(Array),
            isMobile: false,
            showFullChart: false
        });
        expect(chartConfigModule.createChartOptions).toHaveBeenCalledWith(false);
    });

    test('should display error message when data fetching fails', async () => {
        // Simulate API error
        vi.mocked(ibgeApi.fetchPIBData).mockRejectedValue(new Error('API Error'));
        
        renderComponent();

        // Verify error message and retry button are displayed
        await waitFor(() => {
            expect(screen.getByText('Ocorreu um erro ao carregar os dados.')).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
    });

    test('should display no data message when data array is empty', async () => {
        // Simulate API returning empty data
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue([]);
        
        renderComponent();

        // Verify empty state message is displayed
        await waitFor(() => {
            expect(screen.getByText('Não há dados disponíveis para exibição.')).toBeInTheDocument();
        });
    });

    test('should handle retry action when fetch fails', async () => {
        // First, simulate a failed API call
        vi.mocked(ibgeApi.fetchPIBData).mockRejectedValueOnce(new Error('API Error'));
        
        renderComponent();
        
        await waitFor(() => {
            expect(screen.getByText('Ocorreu um erro ao carregar os dados.')).toBeInTheDocument();
        });
        
        // Then, simulate a successful retry
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValueOnce(mockData);
        
        // Click the retry button
        const retryButton = screen.getByRole('button', { name: 'Tentar novamente' });
        fireEvent.click(retryButton);
        
        // Check if the chart is now displayed
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gráfico de Evolução do PIB' })).toBeInTheDocument();
        });
        
        // Verify the API was called twice (original + retry)
        expect(ibgeApi.fetchPIBData).toHaveBeenCalledTimes(2);
    });

    test('should use mobile settings when on mobile device', async () => {
        // Mock useResponsive to return mobile view
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: true,
            showFullView: false,
            setShowFullView: vi.fn(),
            toggleFullView: vi.fn(),
        });
        
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        renderComponent();
        
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gráfico de Evolução do PIB' })).toBeInTheDocument();
        });
        
        // Verify mobile toggle button exists
        const toggleButton = screen.getByRole('button');
        expect(toggleButton).toHaveTextContent('Mostrar dados completos');
        
        // Verify chartConfig was called with mobile flag
        expect(chartConfigModule.createChartData).toHaveBeenCalledWith({
            pibData: expect.any(Array),
            isMobile: true,
            showFullChart: false
        });
        expect(chartConfigModule.createChartOptions).toHaveBeenCalledWith(true);
    });

    test('should toggle between simple and full view on mobile', async () => {
        // Setup mobile view with setShowFullView mock
        const setShowFullView = vi.fn();
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: true,
            showFullView: false,
            setShowFullView,
            toggleFullView: vi.fn(),
        });
        
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        renderComponent();
        
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gráfico de Evolução do PIB' })).toBeInTheDocument();
        });
        
        // Find and click toggle button
        const toggleButton = screen.getByRole('button', { name: 'Mostrar dados completos' });
        fireEvent.click(toggleButton);
        
        // Verify setShowFullView was called
        expect(setShowFullView).toHaveBeenCalledWith(true);
        
        // Update mock to simulate view change
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: true,
            showFullView: true,
            setShowFullView,
            toggleFullView: vi.fn(),
        });
        
        // Re-render with new view state
        renderComponent();
        
        await waitFor(() => {
            const newToggleButton = screen.getByRole('button', { name: 'Mostrar versão simplificada' });
            expect(newToggleButton).toBeInTheDocument();
        });
    });

    test('should provide correct chart container width for mobile full view', async () => {
        // Setup mobile view with full chart display
        vi.mocked(useResponsiveModule.useResponsive).mockReturnValue({
            isMobile: true,
            showFullView: true,
            setShowFullView: vi.fn(),
            toggleFullView: vi.fn(),
        });
        
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        const { container } = renderComponent();
        
        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gráfico de Evolução do PIB' })).toBeInTheDocument();
        });
        
        // Find chart container with overflow-x-auto class (when showing full view on mobile)
        const overflowContainer = container.querySelector('.overflow-x-auto');
        expect(overflowContainer).toBeInTheDocument();
        
        // Find wider chart container for horizontal scrolling
        const wideContainer = container.querySelector('.w-\\[800px\\]');
        expect(wideContainer).toBeInTheDocument();
    });

    test('should display dashboard KPI component with data', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        renderComponent();

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Gráfico de Evolução do PIB' })).toBeInTheDocument();
        });

        // Check if KPI component elements are in the document
        expect(screen.getByText('Indicadores do PIB')).toBeInTheDocument();
        
        // Check specific KPI data is displayed
        expect(screen.getByText('PIB Atual (2020)')).toBeInTheDocument();
        
        // Check if at least one percentage is shown
        const percentages = screen.getAllByText(/\d+(\.\d+)?%/);
        expect(percentages.length).toBeGreaterThan(0);
    });
});