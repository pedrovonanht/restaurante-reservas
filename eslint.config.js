import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import js from "@eslint/js";
import jestPlugin from "eslint-plugin-jest";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  js.configs.recommended,
  {
    //configurações para o eslint conversar com o jest
    plugins: {
      jest: jestPlugin, //nomeia o plugin para funcionar
    },
    files: ["**/*.test.js"],
    ...jestPlugin.configs["flat/recommended"],
    languageOptions: {
      globals: jestPlugin.environments.globals.globals, //seta as variáveis globais
    },
  },
  eslintConfigPrettier,
]);
