import next from "eslint-config-next";

const config = [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: ["e2e/**", "coverage/**"],
  },
];
export default config;
