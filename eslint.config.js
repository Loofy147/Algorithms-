
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
      files: ["tests/**"],
      ...jest.configs['flat/recommended'],
      rules: {
          ...jest.configs['flat/recommended'].rules,
          "jest/no-identical-title": "off"
      }
  }
];
