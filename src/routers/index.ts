import { createRouter, createWebHistory } from 'vue-router';

import About from '../views/About.vue';
import ClipboardList from '../views/ClipboardList.vue';
import Settings from '../views/Settings.vue';
import TagsManager from '../views/TagsManager.vue';
import Updater from '../views/Updater.vue';

const routes = [
    { path: '/list', component: ClipboardList },
    { path: '/settings', component: Settings },
    { path: '/tags', component: TagsManager },
    { path: '/about', component: About },
    { path: '/updater', component: Updater },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;