export interface UserProfile {
  id: number
  username: string
  nickname: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  age: number
  address: string
  createdTime: string
  updatedTime: string
}

export interface UpdateProfileRequest {
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  age?: number
  address?: string
} 