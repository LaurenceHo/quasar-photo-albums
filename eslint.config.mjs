import pluginVue from 'eslint-plugin-vue';
import vueTsEslintConfig from '@vue/eslint-config-typescript';
import pluginVitest from '@vitest/eslint-plugin';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),

  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true
        }
      ],
      'no-undef': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'vue/multi-word-component-names': 'off'
    }
  },

  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', 'server', '*.config.*', '*.d.ts']
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*']
  },
  skipFormatting
];
