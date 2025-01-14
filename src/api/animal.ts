import request from '@/utils/request'
import type { ApiResponse } from '@/types/pollution'

// 简化后的动物实体接口
export interface Animal {
  id: number
  name: string
  scientificName: string
  description: string
  habitat: string
  conservationStatus: string
  featured: boolean
}

// 简化后的 API 接口
export const animalApi = {
  // 获取精选动物列表
  getFeaturedAnimals: () =>
    request.get<ApiResponse<Animal[]>>('/animals/featured'),
    
  // 获取动物分类列表
  getAnimalCategories: () =>
    request.get<ApiResponse<Animal[]>>('/animals/categories')
}

// 导出单独的函数，兼容旧的导入方式
export const getFeaturedAnimals = () => animalApi.getFeaturedAnimals()
export const getAnimalCategories = () => animalApi.getAnimalCategories() 