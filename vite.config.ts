import { defineConfig } from 'vite'
import { createVuePlugin as Vue } from 'vite-plugin-vue2'
import Components from 'unplugin-vue-components/vite'
import ScriptSetup from 'unplugin-vue2-script-setup/vite'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    ScriptSetup(),
    Components({
      dts: 'src/components.d.ts',
    }),
    AutoImport({
      imports: [
        'vue-demi'
      ],
      dts: 'src/auto-imports.d.ts'
    })
  ],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ['vue-demi']
  }
})
