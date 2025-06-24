export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "no-var": "error",
      "prefer-const": "warn",
      "comma-dangle": ["error", "never"],
      "object-shorthand": "warn",
      "arrow-body-style": ["warn", "as-needed"],
      "no-multiple-empty-lines": ["warn", { max: 1 }],
      "indent": ["error", 2],
      "space-before-blocks": ["error", "always"],
      "keyword-spacing": ["error", { "before": true, "after": true }]
    }
  }
];