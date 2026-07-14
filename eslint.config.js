import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // Injected by vite.config.js `define` at build time - real at
        // runtime, just unknown to eslint's static analysis.
        __APP_VERSION__: 'readonly',
        __APP_URL__: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // BUG-R: was '^[A-Z_]' - dead imports from drawing code would pass silently
      'no-unused-vars': ['error', { varsIgnorePattern: '^_' }],

      // eslint-plugin-react-hooks v6+ ships React-Compiler-derived rules that
      // statically simulate compiler analysis. They flag several patterns we
      // use *on purpose* and have already debugged around:
      //   - the `pendingWriteRef` debounce-vs-external-write tracking pattern
      //     in TextEditor (see project notes on the typing bug fix)
      //   - the `ref.current = latestValue` "useLatest" idiom in
      //     useDebounce/useSpeechToText
      //   - one-line setState-in-effect resets (Tooltip, modals) that are
      //     genuinely safe and don't cause extra render cycles in practice
      // Real hook-dependency bugs are still caught by the base
      // `recommended` rules above; these four are just noisy for us.
      'react-hooks/refs': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
]);
