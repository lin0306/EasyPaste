import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {path: '/list', component: () => import('../pages/ClipboardList.vue')},
    {path: '/settings', component: () => import('../pages/Settings.vue')},
    {path: '/tags', component: () => import('../pages/TagsManager.vue')},
    {path: '/about', component: () => import('../pages/About.vue')},
    {path: '/updater', component: () => import('../pages/Updater.vue')},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;