export interface UserProfile {
  id: number
  username: string          // 用户名（不可修改）
  nickname?: string        // 昵称（可选）
  gender: 'MALE' | 'FEMALE' | 'OTHER'  // 性别（必填，有默认值）
  age: number              // 年龄（必填，有默认值）
  address: string          // 地址（必填，有默认值）
  createdTime: string
  updatedTime: string
}

// 更新个人信息的请求参数（不包含username）
export interface UpdateProfileRequest {
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  age?: number
  address?: string
} 