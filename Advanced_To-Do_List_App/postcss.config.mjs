// postcss.config.js
const isProd = process.env.NODE_ENV === 'production'

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: {
    // Tailwind v4 is handled by @tailwindcss/vite, so it is not listed here.

    // Lint-style guard: fail the build on duplicate/invalid declarations
    // (add with: npm i -D postcss-discard-duplicates)
    ...(isProd ? { 'postcss-discard-duplicates': {} } : {}),

    // Optional extra minification beyond Vite's default
    // (add with: npm i -D cssnano)
    ...(isProd
      ? { cssnano: { preset: ['default', { discardComments: { removeAll: true } }] } }
      : {}),
  },
}
