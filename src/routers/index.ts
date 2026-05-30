import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

// 扩展路由 meta 类型
declare module 'vue-router' {
  interface RouteMeta {
    showCloseBtn?: boolean
    showHideBtn?: boolean
    showFixedBtn?: boolean
    showMinimizeBtn?: boolean
    showUpdateIcon?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      {
        path: 'list',
        component: () => import('@/pages/list/main/index.vue'),
        meta: {
          showHideBtn: false,
          showFixedBtn: true,
          showUpdateIcon: false,
          showCloseBtn: false,
        },
      },
      {
        path: 'item-editor',
        component: () => import('@/pages/list/textEditor/index.vue'),
        meta: {},
      },
      {
        path: 'item-search',
        component: () => import('@/pages/list/advancedSearch/index.vue'),
        meta: {},
      },
      {
        path: 'settings',
        component: () => import('@/pages/settings/main/index.vue'),
        meta: {},
      },
      {
        path: 'theme-editor',
        component: () => import('@/pages/settings/themeEditor/index.vue'),
        meta: {},
      },
      {
        path: 'tags',
        component: () => import('@/pages/tags/index.vue'),
        meta: {},
      },
      {
        path: 'about',
        component: () => import('@/pages/about/index.vue'),
        meta: {},
      },
      {
        path: 'updater',
        component: () => import('@/pages/updater/index.vue'),
        meta: {
          showMinimizeBtn: true,
        },
      },
      {
        path: 'preview',
        component: () => import('@/pages/list/filePreview/index.vue'),
        meta: {},
      },
      {
        path: 'plugin-view',
        component: () => import('@/pages/plugins/view/index.vue'),
        meta: {},
      },
      {
        path: 'plugin-store',
        component: () => import('@/pages/plugins/store/index.vue'),
        meta: {},
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
