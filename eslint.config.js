
import globals from "globals";
import pluginJs from "@eslint/js";
import jest from "eslint-plugin-jest";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  pluginJs.configs.recommended,
  {
      rules: {
          "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
      }
  },
  {
    files: ["docs/api/scripts/**"],
    languageOptions: {
      globals: {
        ...globals.browser,
        PR: "readonly",
        hideAllButCurrent: "readonly",
        scrollToNavItem: "readonly",
      },
    },
    rules: {
        "no-undef": "off",
        "no-unused-vars": "off",
        "no-useless-escape": "off",
        "no-cond-assign": "off",
        "no-redeclare": "off",
        "no-prototype-builtins": "off"
    }
  },
  {
      files: ["tests/**"],
      ...jest.configs['flat/recommended'],
      rules: {
          ...jest.configs['flat/recommended'].rules,
          "jest/no-identical-title": "off"
      }
  }
];
