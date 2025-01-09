import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { setupRouterGuard } from './guard'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../components/layout/Layout.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/home/index.vue')
      },
      {
        path: 'pollution',
        name: 'Pollution',
        component: () => import('../views/pollution/index.vue')
      },
      {
        path: 'forum',
        name: 'Forum',
        component: () => import('../views/forum/index.vue')
      },
      {
        path: 'volunteer',
        name: 'Volunteer',
        component: () => import('../views/volunteer/index.vue'),
        meta: {
          title: '志愿活动'
        }
      },
      {
        path: 'profile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          requiresAuth: true,
          title: '个人信息'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

setupRouterGuard(router)

export default router 