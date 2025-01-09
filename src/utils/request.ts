import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    console.log('Request URL:', config.url)
    console.log('Request Method:', config.method)
    console.log('Request Data:', config.data)

    // 从 store 获取 token
    const userStore = useUserStore()
    const token = userStore.token
    
    // 如果有 token 就添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('Response:', response.data)
    return response.data
  },
  error => {
    console.error('Request Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    })

    // 处理 401 未授权错误
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      ElMessage.error('请先登录')
      return Promise.reject(error)
    }

    // 处理 403 禁止访问错误
    if (error.response?.status === 403) {
      ElMessage.error('没有权限执行此操作')
      return Promise.reject(error)
    }

    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export default request 