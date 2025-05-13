import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    "extends": "airbnb",
    "parser": "@typescript-eslint/parser",
    "plugins": ["@typescript-eslint"],
    "rules": {
      "no-unused-vars": 2,
      "max-len": [1, 100],
      "max-params": [2, 3]
    }
  },
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
]);