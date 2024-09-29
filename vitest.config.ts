import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      setupFiles: './vitest-setup.ts',
      coverage: {
        provider: 'v8',
        reportsDirectory: 'coverage',
        exclude: ['**/**.js', '**/**.d.ts', '*.config.*', '**/**/__tests__/**', 'src/mocks/**'],
      },
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
);
