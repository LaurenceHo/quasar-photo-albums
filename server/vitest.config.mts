import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      exclude: ['**/**.js', '**/**.d.ts', '*.config.*', '.serverless/**', 'test/**/*.{test,spec}.ts'],
    },
    globals: true,
    include: [
      // Matches vitest tests in any subfolder of 'src' or into 'test/vitest', or subfolder of 'server'
      // Matches all files with extension 'ts' and 'tsx'
      'src/**/*.vitest.{test,spec}.{ts,tsx}',
      'test/**/*.{test,spec}.{ts,tsx}',
    ],
  },
});
