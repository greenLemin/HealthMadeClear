import next from "eslint-config-next";

const config = [
  ...next,
  {
    files: ["scripts/**/*.{js,mjs,cjs,ts,mts,cts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["e2e/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
  {
    ignores: ["coverage/**", ".next/**", ".next-analyze/**"],
  },
];
export default config;
