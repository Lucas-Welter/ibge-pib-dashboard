import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as ibgeApi from '../../services/api/ibgeApi';
import PIBChartPage from './PIBChart';
import { Line } from 'react-chartjs-2';
import type { ChartProps } from 'react-chartjs-2';
import { TooltipItem, TooltipModel } from 'chart.js';

vi.mock('../../services/api/ibgeApi', () => ({
    fetchPIBData: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
    Line: vi.fn(() => <div data-testid="line-chart">Chart Mock</div>),
}));

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
    });

    test('should display loading component when data is being fetched', async () => {
        // Return a pending promise to keep the loading state active
        vi.mocked(ibgeApi.fetchPIBData).mockReturnValue(new Promise(() => { }));
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBChartPage />
            </QueryClientProvider>
        );
        
        expect(screen.getByText('Carregando dados...')).toBeInTheDocument();
    });

    test('should render chart when data loads successfully', async () => {
        // Simulate successful API response
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBChartPage />
            </QueryClientProvider>
        );

        // Verify that the title and chart elements are rendered
        await waitFor(() => {
            expect(screen.getByText('Gráfico de Evolução do PIB')).toBeInTheDocument();
        });
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByText(/Este gráfico apresenta a evolução do PIB brasileiro/)).toBeInTheDocument();
    });

    test('should display error message when data fetching fails', async () => {
        // Simulate API error
        vi.mocked(ibgeApi.fetchPIBData).mockRejectedValue(new Error('API Error'));
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBChartPage />
            </QueryClientProvider>
        );

        // Verify error message and retry button are displayed
        await waitFor(() => {
            expect(screen.getByText('Ocorreu um erro ao carregar os dados.')).toBeInTheDocument();
        });
        expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
    });

    test('should display no data message when data array is empty', async () => {
        // Simulate API returning empty data
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue([]);
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBChartPage />
            </QueryClientProvider>
        );

        // Verify empty state message is displayed
        await waitFor(() => {
            expect(screen.getByText('Não há dados disponíveis para exibição.')).toBeInTheDocument();
        });
    });

    test('should properly configure chart options when data is available', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBChartPage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });

        // Access the props passed to the Line component
        const callArgs = vi.mocked(Line).mock.calls[0];
        expect(callArgs).toBeDefined();

        // Define the expected type structure to improve type checking
        type LineProps = {
            data: {
                labels: string[];
                datasets: Array<{
                    label: string;
                    data: number[];
                    borderColor: string;
                    yAxisID: string;
                }>;
            };
            options: any;
        };

        const [props] = callArgs as [LineProps];

        // Verify chart data structure
        expect(props.data.labels).toEqual(['2018', '2019', '2020']);
        expect(props.data.datasets[0].data).toEqual([1000000, 1100000, 1050000]);
        expect(props.data.datasets[1].data).toEqual([5000, 5500, 5200]);

        expect(props.options).toBeDefined();

        // Test the tooltip formatter callback
        const tooltipFormatter = props.options?.plugins?.tooltip?.callbacks?.label;
        expect(tooltipFormatter).toBeDefined();

        // Create a mock tooltip context to test the formatter
        const mockContext = {
            dataset: { label: 'Test Label' },
            parsed: { y: 1000 }
        };
        const formattedLabel = tooltipFormatter(mockContext);
        expect(formattedLabel).toContain('Test Label');
        expect(formattedLabel).toContain('US$');
        expect(formattedLabel).toContain('1.000,00');

        // Verify axis configurations
        expect(props.options?.scales?.y?.position).toBe('left');
        expect(props.options?.scales?.y1?.position).toBe('right');

        // Test axis tick formatters
        const yTickFormatter = props.options?.scales?.y?.ticks?.callback;
        const y1TickFormatter = props.options?.scales?.y1?.ticks?.callback;

        if (yTickFormatter && y1TickFormatter) {
            // Test PIB total formatter (should use compact notation)
            const formattedY = yTickFormatter(1000000);
            const formattedY1 = y1TickFormatter(5000);
            expect(typeof formattedY).toBe('string');
            expect(formattedY).toContain('US$');
            expect(formattedY).toContain('mi');
            
            // Test PIB per capita formatter (should not use compact notation)
            expect(typeof formattedY1).toBe('string');
            expect(formattedY1).toContain('US$');
            expect(formattedY1).toContain('5.000'); 
        }
    });

    test('should format decimal values correctly in tooltips', async () => {
        // Test with decimal values to verify formatting precision
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue([{
            year: 2021,
            pib: 1234567.89,
            pibPerCapita: 5432.10
        }]);

        render(
            <QueryClientProvider client={queryClient}>
                <PIBChartPage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });

        const callArgs = vi.mocked(Line).mock.calls[0];
        const props = callArgs[0] as unknown as ChartProps<'line'>;

        // Test decimal formatting in tooltips using regex to account for locale variations
        const mockTooltipContext = {
            chart: { data: { datasets: [] } },
            dataPoints: [],
        } as unknown as TooltipModel<'line'>;

        const tooltipFormatter = props.options?.plugins?.tooltip?.callbacks?.label?.bind(mockTooltipContext);
        const decimalContext = {
            dataset: { label: 'Decimal Test' },
            parsed: { y: 1234.56 },
        } as TooltipItem<'line'>;

        expect(tooltipFormatter?.(decimalContext)).toMatch(/US\$\s*1[\.,]234[\.,]56/);
    });

    test('should correctly handle chart interactivity settings', async () => {
        vi.mocked(ibgeApi.fetchPIBData).mockResolvedValue(mockData);
        
        render(
            <QueryClientProvider client={queryClient}>
                <PIBChartPage />
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        });

        type LineProps = { options: any };
        const [props] = vi.mocked(Line).mock.calls[0] as [LineProps];

        // Verify hover interaction and responsiveness settings
        expect(props.options?.interaction?.mode).toBe('index');
        expect(props.options?.responsive).toBe(true);
    });
});