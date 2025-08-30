import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {path: '/list', component: () => import('../pages/index/index.vue')},
    {path: '/settings', component: () => import('../pages/settings/index.vue')},
    {path: '/tags', component: () => import('../pages/tags/index.vue')},
    {path: '/about', component: () => import('../pages/about/About.vue')},
    {path: '/updater', component: () => import('../pages/updater/Updater.vue')},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;