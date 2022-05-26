
import Vue from 'vue'
import Router from 'vue-router'
let routes = [
    {
        path: '/',
        name: 'index',
        component: () => import('@/views/layout'),
        meta: { title: '主页' },
        redirect: '/map',
        children: [
            {
                path: '/map',
                name: 'map',
                meta: { title: '地图' },
                component: () => import('@/views/map')
            },
            {
                path: '/control',
                name: 'control',
                meta: { title: '控制条' },
                component: () => import('@/views/control')
            },
            {
                path: '/interactions',
                name: 'interactions',
                meta: { title: '内置交互方式' },
                component: () => import('@/views/interactions')
            },
            {
                path: '/layer',
                name: 'layer',
                meta: { title: '底图' },
                component: () => import('@/views/layer')
            },
            {
                path: '/wms',
                name: 'wms',
                meta: { title: 'wms' },
                component: () => import('@/views/wms')
            },
            {
                path: '/geojson',
                name: 'geojson',
                meta: { title: '矢量' },
                component: () => import('@/views/geojson')
            },
            {
                path: '/flash',
                name: 'flash',
                meta: { title: '闪光' },
                component: () => import('@/views/flash')
            },
            {
                path: '/flash2',
                name: 'flash2',
                meta: { title: '闪光' },
                component: () => import('@/views/flash2')
            },
            {
                path: '/track',
                name: 'track',
                meta: { title: '轨迹' },
                component: () => import('@/views/track')
            }
        ]
    }
];
Vue.use(Router)
const router = new Router({
    mode: 'history',
    base: '/',
    scrollBehavior: () => ({ y: 0 }),
    routes // (缩写) 相当于 routes: routes
})

export default router