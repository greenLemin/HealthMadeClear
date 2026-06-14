import next from "eslint-config-next";

const config = [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: ["e2e/**"],
  },
];
export default config;
