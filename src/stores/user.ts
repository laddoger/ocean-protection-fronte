import { defineStore } from 'pinia'
import { login, register, getUserInfo } from '../api/user'
import router from '@/router'

interface UserInfo {
  id: number;
  username: string;
  [key: string]: any;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null as UserInfo | null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  
  actions: {
    async login(username: string, password: string) {
      try {
        const res = await login({ username, password })
        if (res && res.code === 200 && res.data?.token) {
          this.token = res.data.token
          localStorage.setItem('token', res.data.token)
          await this.loadUserInfo()
          return res.data
        }
        throw new Error(res?.message || '登录失败')
      } catch (error) {
        console.error('Login error:', error)
        this.logout()
        throw error
      }
    },

    async register(username: string, password: string) {
      try {
        const res = await register({ username, password })
        if (res && res.code === 200) {
          return res.data
        }
        throw new Error(res?.message || '注册失败')
      } catch (error) {
        console.error('Register error:', error)
        throw error
      }
    },
    
    async loadUserInfo() {
      try {
        console.log('Loading user info...')
        const res = await getUserInfo()
        console.log('User info response:', res)
        if (res && res.code === 200) {
          this.userInfo = res.data
          return res.data
        }
        throw new Error('获取用户信息失败')
      } catch (error) {
        console.error('Get user info error:', error)
        this.logout()
        throw error
      }
    },
    
    logout() {
      console.log('Logging out...')
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      router.push('/login')
    }
  }
}) 