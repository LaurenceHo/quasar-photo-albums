import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { quasar } from '@quasar/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      exclude:['**/**.js','**/**.d.ts','.quasar/**','.eslintrc.mjs','server/**']
    },
    globals: true,
    setupFiles: './vitest-setup.ts',
    environment: 'jsdom',
    include: [
      // Matches vitest tests in any subfolder of 'src' or into 'test/vitest', or subfolder of 'server'
      // Matches all files with extension 'ts' and 'tsx'
      'src/**/*.vitest.{test,spec}.{ts,tsx}',
      'test/vitest/**/*.{test,spec}.{ts,tsx}',
    ],
  },
  plugins: [
    vue() as any,
    quasar({
      sassVariables: 'src/quasar-variables.scss',
    }),
    tsconfigPaths(),
  ],
});
