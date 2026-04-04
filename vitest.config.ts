import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'api',
          root: 'src/apis',
          environment: 'node',
          setupFiles: ['./test-setup.ts']
        }
      },
      {
        resolve: {
          alias: [
            { find: '@renderer', replacement: resolve(__dirname, 'src/renderer/src') },
            { find: /^src\//, replacement: resolve(__dirname, 'src') + '/' }
          ]
        },
        test: {
          name: 'frontend',
          root: 'src/renderer',
          environment: 'happy-dom',
          setupFiles: ['./test-setup.ts']
        }
      }
    ]
  }
})
