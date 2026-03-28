import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'api',
          root: 'src/apis',
          environment: 'node',
          setupFiles: []
        }
      },
      {
        test: {
          name: 'frontend',
          root: 'src/renderer',
          environment: 'happy-dom',
          setupFiles: []
        }
      }
    ]
  }
})
