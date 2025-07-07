import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    assetsInclude: ['**/*.hbs'], // Явно указываем, что .hbs - это ассеты
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly'
        }
    },
    server: {
        port: 3000,
        open: true
    },
    preview: {
        port: 3000,
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    }
})
