import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import router from './router'

// 全局样式入口
import './styles/main.scss'

const app = createApp(App)

// Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// Vue Router
app.use(router)

app.mount('#app')

// 开发模式标识
if (import.meta.env.DEV) {
    console.log('📡 Halcyon · 03号观测站 信号接收终端 (开发模式)')
    console.log('🔍 正在搜索 0KB 的龙骨...')
}
