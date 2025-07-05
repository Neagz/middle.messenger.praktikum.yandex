import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginReact from "eslint-plugin-react";

export default [
  // Базовые правила ESLint
  js.configs.recommended,

  // Поддержка TypeScript
  ...tseslint.configs.recommended,

  // Поддержка React
  {
    plugins: {
      react: eslintPluginReact
    },
    rules: {
      ...eslintPluginReact.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/jsx-filename-extension": [1, { "extensions": [".tsx"] }]
    }
  },

  // Кастомные правила
  {
    rules: {
      "no-unused-vars": "error",
      "max-len": ["warn", 100],
      "max-params": ["error", 3],
      "import/prefer-default-export": "off"
    }
  },

  // Глобальные переменные
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  }
];