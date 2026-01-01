import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '@/context/ToastContext';
import { OrgProvider } from '@/context/OrgContext';
import { ToolbarProvider } from '@/context/ToolbarContext';
import { ResonantChatMenuProvider } from '@/context/ResonantChatMenuContext';

/**
 * Custom render function that includes all necessary providers
 * Use this instead of the default render from @testing-library/react
 * 
 * @example
 * ```tsx
 * import { render, screen } from '@/test/utils';
 * 
 * test('renders component', () => {
 *   render(<MyComponent />);
 *   expect(screen.getByText('Hello')).toBeInTheDocument();
 * });
 * ```
 */
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <OrgProvider>
          <ToolbarProvider>
            <ResonantChatMenuProvider>
              {children}
            </ResonantChatMenuProvider>
          </ToolbarProvider>
        </OrgProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add custom options here if needed
  route?: string;
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions,
) => {
  // If route is provided, we could use MemoryRouter with initialEntries
  // For now, we'll use BrowserRouter for simplicity
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { customRender as render };

/**
 * Helper to create a mock user session
 */
export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'viewer',
  org: 'org-123',
  ...overrides,
});

/**
 * Helper to wait for async operations
 */
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

/**
 * Helper to create mock API response
 */
export const createMockResponse = <T,>(data: T, status = 200) => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {},
  config: {} as any,
});

