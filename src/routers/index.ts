import {createRouter, createWebHistory} from 'vue-router';

const routes = [
    {path: '/list', component: () => import('../views/ClipboardList.vue')},
    {path: '/settings', component: () => import('../views/Settings.vue')},
    {path: '/tags', component: () => import('../views/TagsManager.vue')},
    {path: '/about', component: () => import('../views/About.vue')},
    {path: '/updater', component: () => import('../views/Updater.vue')},
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;