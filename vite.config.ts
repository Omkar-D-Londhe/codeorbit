import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: process.env.VITEST
      ? [
          {
            find: /.*\/core\/ui\/lazyRoute$/,
            replacement: path.resolve(import.meta.dirname, 'src/core/ui/lazyRoute.mock.ts'),
          },
        ]
      : [],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    exclude: [...configDefaults.exclude, 'e2e/**', 'docs/**'],
  },
})
