import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { quasar } from '@quasar/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: 'test/vitest/coverage',
      exclude:['**/**.js','**/**.d.ts','.quasar/**', '**/test/**']
    },
    globals: true,
    setupFiles: './vitest-setup.ts',
    environment: 'jsdom',
    include: [
      // Matches vitest tests in any subfolder of 'src' or into 'test/vitest/__tests__'
      // Matches all files with extension 'js', 'jsx', 'ts' and 'tsx'
      'src/**/*.vitest.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'test/vitest/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
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
