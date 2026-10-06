import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Full document navigation avoids segment-prefetch paths that are not portable
  // in the Windows static export. All destination pages are prerendered.
  { rules: { "@next/next/no-html-link-for-pages": "off" } },
  globalIgnores([".next/**", "out/**", ".tools/**", ".reference/**", ".sites-runtime/**", "test-results/**", "playwright-report/**", "next-env.d.ts"]),
]);
