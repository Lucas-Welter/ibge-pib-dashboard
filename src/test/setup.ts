import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];
  
  constructor(private readonly callback: IntersectionObserverCallback) {}
  
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn().mockReturnValue([]);

  // Helper method for tests to simulate intersection
  simulateIntersection(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this);
  }
}

window.IntersectionObserver = IntersectionObserverMock as any;

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock Element.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock Chart.js to avoid canvas rendering issues in tests
vi.mock('chart.js', async () => {
  const actual = await vi.importActual('chart.js');
  return {
    ...actual,
    Chart: {
      register: vi.fn(),
    },
  };
});

// Clean up mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});