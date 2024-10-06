// @ts-check
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tsEslint from 'typescript-eslint';

export default tsEslint.config(
  eslint.configs.recommended,
  ...tsEslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    plugins: {
      'typescript-eslint': tsEslint.plugin
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        process: 'readonly',
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly'
      },
      parserOptions: {
        parser: tsEslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
        projectService: true
      }
    },
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
    files: ['**/*.js'],
    ...tsEslint.configs.disableTypeChecked
  },
  {
    files: ['**/*.ts', '**/*.vue']
  },
  {
    ignores: [
      '*.config.*',
      '*.d.ts',
      'coverage',
      'dist',
      'node_modules',
      'src/assets/**/*',
      'vitest-setup.ts',
      'server'
    ]
  }
);
