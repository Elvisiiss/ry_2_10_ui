import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        // vueDevTools(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        host: '0.0.0.0', // 监听所有 IPv4 地址
        port: 31794,      // 指定端口（默认 5173）
        strictPort: true, // 如果端口被占用，直接退出
        proxy: {
            '/api': {
                // target: 'http://10.168.89.244:31451',
                target: 'http://110.42.193.119:31793',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})


// netstat -ano | findstr "31793"
// TCP    0.0.0.0:31793           0.0.0.0:0              LISTENING       12345
// taskkill /PID 12345 /F
