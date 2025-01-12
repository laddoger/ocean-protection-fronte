import request from '@/utils/request'
import type { UserProfile, UpdateProfileRequest } from '@/types/user'
import type { Post } from '@/types/forum'
import type { Organization, Activity } from '@/types/volunteer'

interface LoginData {
  username: string
  password: string
}

interface RegisterData extends LoginData {
  phone: string
}

interface UserProfileData {
  username?: string
  email?: string
  bio?: string
}

export interface RegisterRequest {
  username: string
  password: string
}

// 匹配后端 User 实体
export interface User {
  id: number
  username: string
  password?: string
  createdTime: string
  updatedTime: string
  deleted: boolean
}

// 匹配后端统一返回格式
export interface RegisterResponse {
  code: number
  message: string
  data: User
}

export function login(data: LoginData) {
  return request<LoginResponse>({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function register(data: RegisterRequest) {
  console.log('Registering with data:', data)
  return request<RegisterResponse>({
    url: '/auth/register',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request<UserInfo>({
    url: '/auth/user/info',
    method: 'get'
  })
}

export function updateUserProfile(data: UserProfileData) {
  return request({
    url: '/auth/user/profile',
    method: 'put',
    data
  })
}

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

export function getUserPosts() {
  return request({
    url: '/auth/user/posts',
    method: 'get'
  })
}

export const userApi = {
  // 获取用户个人信息
  getProfile: () => 
    request.get<ApiResponse<UserProfile>>('/auth/user/info'),
  
  // 更新用户个人信息
  updateProfile: (data: UpdateProfileRequest) =>
    request.put<ApiResponse<UserProfile>>('/auth/user/info', data),
  
  // 获取用户发表的帖子
  getUserPosts: () =>
    request.get<ApiResponse<Post[]>>('/auth/user/posts'),
  
  // 获取用户加入的组织
  getUserOrganizations: () =>
    request.get<ApiResponse<Organization[]>>('/auth/user/organizations'),
  
  // 获取用户参加的活动
  getUserActivities: () =>
    request.get<ApiResponse<Activity[]>>('/auth/user/activities')
} 