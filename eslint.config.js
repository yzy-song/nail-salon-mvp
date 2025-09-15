import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import tsParser from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    // 全局忽略文件夹
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  // 基础 JS 规则
  pluginJs.configs.recommended,

  // --- API 项目 (apps/api) 的专属配置 ---
  {
    files: ["apps/api/**/*.ts"],
    languageOptions: {
      globals: { ...globals.node },
      parser: tsParser,
      parserOptions: {
        project: "apps/api/tsconfig.json", // 指向 API 项目的 tsconfig
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // --- WEB 项目 (apps/web) 的专属配置 ---
  {
    files: ["apps/web/**/*.{ts,vue}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }, // Web 项目可能需要 Node 环境（如 Vite 配置）
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        project: "apps/web/tsconfig.json", // 指向 Web 项目的 tsconfig
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      vue: pluginVue,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...pluginVue.configs.base.rules,
      ...pluginVue.configs["vue3-essential"].rules,
      ...tseslint.configs.recommended.rules,
      // 您在 web 项目中自定义的规则
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Prettier 配置，确保它在最后，以覆盖格式化相关的规则
  eslintConfigPrettier,
];