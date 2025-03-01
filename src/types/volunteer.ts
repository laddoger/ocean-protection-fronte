// 组织实体接口
export interface Organization {
  id: number
  name: string
  description: string
  memberCount: number
  leaderId: number
  createdTime: string
  updatedTime: string
}

// 活动实体接口
export interface Activity {
  id: number
  title: string
  description: string
  location: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'ONGOING' | 'FINISHED'
  organizationId: number
  createdTime: string
  updatedTime: string
}

// 创建组织的表单接口
export interface CreateOrgForm {
  name: string
  description: string
} 