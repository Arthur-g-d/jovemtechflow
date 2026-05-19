import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["dist", "supabase/**/*", "coverage/**/*"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      prettierConfig, // sempre por último
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // DT-15 / M7
      "no-console": ["error", { allow: ["warn", "error"] }],

      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",

      // Acessibilidade — selecionamos as regras mais úteis sem ligar tudo
      // de uma vez (evita warning fatigue na primeira execução).
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/no-redundant-roles": "error",
      "jsx-a11y/label-has-associated-control": "warn",

      // M9 — proíbe <img> sem `loading` para forçar decisão consciente
      // (lazy ou eager). LazyImg já passa loading="lazy" por padrão; quem
      // usar <img> direto precisa especificar.
      //
      // Regra com no-restricted-syntax via AST do JSX:
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXOpeningElement[name.name='img']:not(:has(JSXAttribute[name.name='loading']))",
          message:
            "Use <LazyImg /> ou adicione loading=\"lazy\" | \"eager\" no <img>. M9 (perf).",
        },
      ],
    },
  },
  // Sobrescreve a regra de img em arquivos de teste — ali muitas vezes
  // mockamos elementos rapidamente.
  {
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**"],
    rules: {
      "no-restricted-syntax": "off",
      "no-console": "off",
    },
  },
);
