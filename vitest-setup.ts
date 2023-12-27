import { vi } from 'vitest';

const noop = () => {};

Object.defineProperty(window, 'scrollTo', { value: noop, writable: true });

const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));

vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
