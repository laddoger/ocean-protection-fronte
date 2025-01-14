import request from '@/utils/request'
import type { ApiResponse } from '@/types/pollution'

// 更新动物实体接口以匹配新的数据库结构
export interface Animal {
  id: number
  name: string
  scientificName: string
  category: string
  description: string
  habitat: string
  conservationStatus: string
  createdTime: string
  updatedTime: string
}

// 简化后的 API 接口
export const animalApi = {
  // 获取所有动物列表
  getAllAnimals: () =>
    request.get<ApiResponse<Animal[]>>('/animals'),
    
  // 获取动物详情
  getAnimalDetail: (id: number) =>
    request.get<ApiResponse<Animal>>(`/animals${id}`),
    
  // 按类别获取动物
  getAnimalsByCategory: (category: string) =>
    request.get<ApiResponse<Animal[]>>(`/animals/category/${category}`)
}

// 导出单独的函数，兼容旧的导入方式
export const getFeaturedAnimals = () => animalApi.getAllAnimals() 