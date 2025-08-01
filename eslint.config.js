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
      "no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_"
        }
      ],
    }
  },

  // Кастомные правила
  {
    rules: {
      "no-unused-vars": "error",
      "max-len": ["warn", 150],
      "max-params": ["error", 4],
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
