/* ESLint config for Buzzer Climb (React + Vite, no TypeScript) */
module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: "18.3" } },
  plugins: ["react-refresh"],
  ignorePatterns: ["dist", "dist-check", "node_modules", "public", ".eslintrc.cjs"],
  rules: {
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "react/no-unknown-property": ["error", { ignore: ["css"] }],
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "no-empty": ["error", { allowEmptyCatch: true }],
  },
};
