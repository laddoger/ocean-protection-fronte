import { Router, RouteLocationNormalized } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 不需要登录就可以访问的路由
const whiteList = ['/login', '/register']

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next) => {
    const userStore = useUserStore()
    
    // 如果已登录但没有用户信息，尝试加载用户信息
    if (userStore.isLoggedIn && !userStore.userInfo) {
      try {
        await userStore.loadUserInfo()
      } catch (error) {
        console.error('Failed to load user info:', error)
      }
    }
    
    // 暂时禁用登录验证
    next()
    return
  })
} 