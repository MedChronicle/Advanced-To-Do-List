import { defineConfig, loadEnv } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Resolves `figma:asset/<file>` imports to src/assets/<file>
function figmaAssetResolver() {
  const assetsDir = path.resolve(__dirname, 'src/assets')
  return {
    name: 'figma-asset-resolver',
    enforce: 'pre',
    resolveId(id) {
      if (!id.startsWith('figma:asset/')) return null
      const filename = id.slice('figma:asset/'.length)
      const resolved = path.resolve(assetsDir, filename)
      // block path traversal like figma:asset/../../secret
      if (!resolved.startsWith(assetsDir + path.sep)) {
        this.error(`Invalid figma asset path: ${id}`)
      }
      return resolved
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'

  return {
    plugins: [figmaAssetResolver(), react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/app'),
        '@context': path.resolve(__dirname, './src/context'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },

    server: {
      port: 5173,
      strictPort: false,
      open: false,
      // proxy API + ML engine so you avoid CORS in dev
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
        '/ml': {
          target: env.VITE_ML_URL || 'http://localhost:8001',
          changeOrigin: true,
          rewrite: p => p.replace(/^\/ml/, ''),
        },
      },
    },

    build: {
      target: 'es2020',
      sourcemap: !isProd,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // split vendor code so app updates don't bust the cache
          manualChunks: {
            react: ['react', 'react-dom'],
          },
        },
      },
    },

    esbuild: {
      // strip console/debugger from production bundles
      drop: isProd ? ['console', 'debugger'] : [],
    },

    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  }
})
