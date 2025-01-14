import request from '@/utils/request'
import type { UserProfile, UpdateProfileRequest } from '@/types/user'
import type { Post } from '@/types/forum'
import type { Organization, Activity } from '@/types/volunteer'

// 登录请求参数接口
interface LoginData {
  username: string  // 用户名
  password: string  // 密码
}

// 注册请求参数接口，继承登录接口并添加手机号
interface RegisterData extends LoginData {
  phone: string     // 手机号
}

// 用户资料更新请求参数接口
interface UserProfileData {
  username?: string  // 可选的用户名
  email?: string     // 可选的邮箱
  bio?: string       // 可选的个人简介
}

// 注册请求参数接口
export interface RegisterRequest {
  username: string
  password: string
}

// 用户实体接口，与后端 User 实体对应
export interface User {
  id: number         // 用户ID
  username: string   // 用户名
  password?: string  // 密码（可选，一般不返回）
  createdTime: string // 创建时间
  updatedTime: string // 更新时间
  deleted: boolean    // 是否删除
}

// API 统一响应格式
export interface RegisterResponse {
  code: number       // 响应状态码
  message: string    // 响应消息
  data: User         // 响应数据
}

// 登录方法
export function login(data: LoginData) {
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'post',
    data
  })
}

// 注册方法
export function register(data: RegisterRequest) {
  console.log('Registering with data:', data)
  return request({
    url: '/auth/register',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(data)  // 确保数据被正确序列化为 JSON 字符串
  })
}

// 获取用户信息方法
export function getUserInfo() {
  return request<UserInfo>({
    url: '/auth/user/info',
    method: 'get'
  })
}

// 更新用户资料方法
export function updateUserProfile(data: UserProfileData) {
  return request({
    url: '/auth/user/profile',
    method: 'put',
    data
  })
}

// 上传头像方法
export function uploadAvatar(data: FormData) {
  return request({
    url: '/auth/user/avatar',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

// 获取用户帖子方法
export function getUserPosts() {
  return request({
    url: '/auth/user/posts',
    method: 'get'
  })
}

// 用户相关 API 接口集合
export const userApi = {
  // 获取用户个人信息
  getProfile: () => 
    request.get<ApiResponse<UserProfile>>('/auth/user/info'),
  
  // 更新用户个人信息（使用 PUT 方法）
  updateProfile: (data: UpdateProfileRequest) =>
    request.put<ApiResponse<UserProfile>>('/auth/user/info', data),
  
  // 获取用户发表的帖子列表
  getUserPosts: () => 
    request.get<ApiResponse<Post[]>>('/auth/user/posts'),
  
  // 获取用户加入的组织列表
  getUserOrganizations: () =>
    request.get<ApiResponse<Organization[]>>('/auth/user/organizations'),
  
  // 获取用户参加的活动列表
  getUserActivities: () =>
    request.get<ApiResponse<Activity[]>>('/auth/user/activities')
} 