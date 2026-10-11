import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// Vitest does not read tsconfig `paths`, so the `@/` alias is mirrored here.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      // Only modules that are unit-testable in node: content.ts needs the
      // generated Velite bundle and utils.ts is out of scope here.
      include: [
        'src/lib/visitors/**/*.ts',
        'src/lib/status.ts',
        'src/lib/metadata.ts',
        'src/app/api/**/*.ts',
        'src/components/visitors/*.ts',
        'src/components/layout/status-bar/*.ts',
        'src/components/home/contributions/*.ts',
        'src/components/projects/*.ts',
        'src/components/blog/*.ts',
        'src/components/research/*.ts',
      ],
      exclude: ['**/*.test.ts', '**/testing/**'],
    },
  },
})
