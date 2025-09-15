import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default tseslint.config(
  
  {
    ignores: ['eslint.config.mjs','postcss.config.mjs', 'node_modules', '.next', 'dist', 'build', 'coverage', 'out', 'public'],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: "./tsconfig.json", // 指向你的 tsconfig 路径
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      // 注册 unused-imports 插件
      'unused-imports': eslintPluginUnusedImports,
    },
  },
  {
    
    rules: {
      // 采纳的优秀规则
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      // 优化的规则
      '@typescript-eslint/no-explicit-any': 'warn',

      // 强烈推荐的质量规则
      '@typescript-eslint/no-floating-promises': 'warn',

      'function-paren-newline': 'off',

      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // 新增 unused-imports 检查
      'unused-imports/no-unused-imports': 'error',
    
    },
  },
);
