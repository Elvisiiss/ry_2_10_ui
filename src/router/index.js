import {createRouter, createWebHistory} from 'vue-router'

// 页面组件（懒加载）
const SignalAcquisition = () => import('@/views/SignalAcquisition.vue')
const NotFound = () => import('@/views/NotFoundPage.vue')
// const ApplyPage = () => import('@/views/ApplyPage.vue')

const routes = [
    {
        path: '/',
        name: 'SignalAcquisition',
        component: SignalAcquisition,
        meta: {
            title: '03号观测站 · 信号接收终端',
            description: '正在从造父四接收信号...'
        }
    },
    // {
    //     path: '/apply',
    //     name: 'Apply',
    //     component: ApplyPage,
    //     meta: {title: '上载观测日志'}
    // },
    // 404 信号丢失（继承原项目风格）
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
        meta: {title: '信号丢失 · 坐标未收录'}
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return {top: 0, behavior: 'smooth'}
        }
    }
})

// 全局路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
    const title = to.meta.title
    if (title) {
        document.title = `Halcyon · ${title}`
    } else {
        document.title = 'Halcyon · 03号观测站'
    }
    next()
})

export default router
