const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const { builtinRules } = require("eslint/use-at-your-own-risk");

const eslintRecommendedRules = Object.fromEntries(
  builtinRules
    .entries()
    .filter(([, rule]) => rule.meta?.docs?.recommended)
    .map(([ruleId]) => [ruleId, "error"]),
);

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "main.js",
      "coverage/**",
      "eslint.config.cjs",
      "rollup.config.js",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      globals: {
        console: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    rules: eslintRecommendedRules,
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["PascalCase"],
        },
      ],
    },
  },
];
