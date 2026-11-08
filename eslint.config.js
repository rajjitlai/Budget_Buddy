// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const tsEslint = require('@typescript-eslint/eslint-plugin');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    plugins: {
      "@typescript-eslint": tsEslint,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);
