import next from "eslint-config-next";

export default [
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
