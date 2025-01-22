<template>
  <div class="volunteer-container">
    <!-- 组织列表 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>志愿者组织</span>
          <el-button type="primary" @click="dialogVisible = true">
            创建组织
          </el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8" v-for="org in organizations" :key="org.id">
          <el-card class="org-card">
            <h3>{{ org.name }}</h3>
            <p>{{ org.description }}</p>
            <div class="card-footer">
              <el-button 
                :type="org.isMember ? 'danger' : 'primary'"
                @click="handleOrgMembership(org)"
              >
                {{ org.isMember ? '退出组织' : '加入组织' }}
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 活动列表 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <span>志愿活动</span>
          <el-switch
            v-model="showOngoing"
            @change="loadActivities"
            :active-text="'进行中'"
            :inactive-text="'已结束'"
          />
        </div>
      </template>
      <el-table :data="activities" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="活动名称" />
        <el-table-column prop="description" label="活动描述" />
        <el-table-column prop="location" label="活动地点" />
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column label="参与人数">
          <template #default="scope">
            {{ scope.row.participantCount }}/{{ scope.row.maxParticipants }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              text 
              :type="scope.row.isParticipant ? 'danger' : 'primary'"
              @click="handleActivityParticipation(scope.row)"
            >
              {{ scope.row.isParticipant ? '取消报名' : '报名参加' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建组织对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="创建志愿者组织"
      width="50%"
    >
      <el-form :model="newOrg">
        <el-form-item label="组织名称" required>
          <el-input v-model="newOrg.name" />
        </el-form-item>
        <el-form-item label="组织描述" required>
          <el-input
            v-model="newOrg.description"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="createOrganization">
            创建
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { volunteerApi } from '@/api/volunteer'
import { useUserStore } from '@/stores/user'
import type { Organization, Activity } from '@/types/volunteer'

const userStore = useUserStore()
const loading = ref(false)
const organizations = ref<Organization[]>([])
const activities = ref<Activity[]>([])
const showOngoing = ref(true)
const dialogVisible = ref(false)
const newOrg = ref({
  name: '',
  description: ''
})

// 检查是否是组织创建者
const isFounder = (organization: Organization) => {
  console.log('Checking founder:', {
    organizationFounderId: organization.founderId,
    currentUserId: userStore.userInfo?.id,
    isMatch: organization.founderId === userStore.userInfo?.id
  })
  return organization.founderId === userStore.userInfo?.id
}

// 解散组织
const disbandOrganization = async (organization: Organization) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!isFounder(organization)) {
    ElMessage.error('只有创建者可以解散组织')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要解散组织"${organization.name}"吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    const response = await volunteerApi.disbandOrganization(organization.id)
    
    if (response && response.code === 200) {
      ElMessage.success('组织已解散')
      // await loadOrganizations()
    } else {
      ElMessage.error(response?.message || '解散组织失败')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to disband organization:', error)
      ElMessage.error(error.response?.data?.message || '解散组织失败')
    }
  } finally {
    loading.value = false
  }
}

// 扩展组织类型，添加成员状态
interface OrganizationWithStatus extends Organization {
  isMember?: boolean
}

// 检查组织成员状态
const checkMembership = async (orgId: number) => {
  // 首先检查用户是否已登录
  if (!userStore.isLoggedIn || !userStore.userInfo?.id) {
    console.warn('用户未登录或无法获取用户信息')
    return false
  }

  try {
    const response = await volunteerApi.checkMembership(orgId)
    return response.code === 200 && response.data
  } catch (error: any) {
    console.error('检查成员状态失败:', error)
    return false
  }
}

// 处理组织成员关系（加入/退出）
const handleOrgMembership = async (org: OrganizationWithStatus) => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (org.isMember) {
      const response = await volunteerApi.quitOrganization(org.id)
      if (response.code === 200) {
        org.isMember = false
        ElMessage.success('已退出组织')
        await loadOrganizations()
      } else {
        ElMessage.error(response?.message || '退出组织失败')
      }
    } else {
      const response = await volunteerApi.joinOrganization(org.id)
      if (response.code === 200) {
        org.isMember = true
        ElMessage.success('成功加入组织')
      //   // await loadOrganizations()
      // } else {
      //   if (response?.message?.includes('Duplicate entry')) {
      //     // await loadOrganizations()
      //     ElMessage.warning('您已经是该组织的成员了')
      //   } else {
      //     ElMessage.error(response?.message || '加入组织失败')
      //   }
      }
    }
  } catch (error: any) {
    console.error('组织操作失败:', error)
    if (error.response?.data?.message?.includes('Duplicate entry')) {
      await loadOrganizations()
      ElMessage.warning('您已经是该组织的成员了')
    } else {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 加载组织列表
const loadOrganizations = async () => {
  try {
    // 确保用户信息已加载
    if (userStore.isLoggedIn && !userStore.userInfo) {
      await userStore.loadUserInfo()
    }

    loading.value = true
    const response = await volunteerApi.getOrganizations()
    if (response.code === 200) {
      const orgs = response.data
      const orgsWithStatus = await Promise.all(
        orgs.map(async (org) => ({
          ...org,
          isMember: await checkMembership(org.id)
        }))
      )
      organizations.value = orgsWithStatus
    }
  } catch (error) {
    console.error('加载组织列表失败:', error)
    ElMessage.error('加载组织列表失败')
  } finally {
    loading.value = false
  }
}

// 处理活动参与（报名/取消报名）
const handleActivityParticipation = async (activity: Activity) => {
  // 检查用户是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    loading.value = true
    if (activity.isParticipant) {
      // 取消报名
      const response = await volunteerApi.leaveActivity(activity.id)
      if (response && response.code === 200) {
        activity.isParticipant = false
        ElMessage.success('已取消报名')
        await loadActivities() // 重新加载活动列表
      } else {
        ElMessage.error(response?.message || '取消报名失败')
      }
    } else {
      // 报名参加
      const response = await volunteerApi.joinActivity(activity.id)
      if (response && response.code === 200) {
        activity.isParticipant = true
        ElMessage.success('报名成功')
        await loadActivities() // 重新加载活动列表
      } else {
        ElMessage.error(response?.message || '报名失败')
      }
    }
  } catch (error: any) {
    console.error('活动操作失败:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 检查活动参与状态
const checkActivityParticipation = async (activityId: number) => {
  if (!userStore.isLoggedIn || !userStore.userInfo?.id) {
    return false
  }

  try {
    const response = await volunteerApi.isParticipant(activityId)
    return response.code === 200 && response.data
  } catch (error) {
    console.error('检查活动参与状态失败:', error)
    return false
  }
}

// 修改加载活动列表函数
const loadActivities = async () => {
  try {
    loading.value = true
    const response = showOngoing.value 
      ? await volunteerApi.getOngoingActivities()
      : await volunteerApi.getFinishedActivities()
    if (response && response.code === 200 && Array.isArray(response.data)) {
      // 获取每个活动的参与状态
      const activitiesWithStatus = await Promise.all(
        response.data.map(async (activity) => ({
          ...activity,
          isParticipant: await checkActivityParticipation(activity.id)
        }))
      )
      activities.value = activitiesWithStatus
    } else {
      console.error('Invalid activities response:', response)
      activities.value = []
      ElMessage.error('加载活动列表失败')
    }
  } catch (error) {
    console.error('Failed to load activities:', error)
    activities.value = []
    ElMessage.error('加载活动列表失败')
  } finally {
    loading.value = false
  }
}

// 创建组织
const createOrganization = async () => {
  try {
    loading.value = true
    const response = await volunteerApi.createOrganization(newOrg.value)
    if (response && response.code === 200) {
      ElMessage.success('创建组织成功')
      dialogVisible.value = false
      newOrg.value = { name: '', description: '' }
      await loadOrganizations()
    } else {
      ElMessage.error('创建组织失败')
    }
  } catch (error) {
    console.error('Failed to create organization:', error)
    ElMessage.error('创建组织失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 确保先加载用户信息
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.loadUserInfo()
  }
  // 并行加载组织和活动列表
  await Promise.all([
    loadOrganizations(),
    loadActivities()
  ])
})
</script>

<style scoped>
.volunteer-container {
  padding: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.org-card {
  margin-bottom: 20px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
}
</style> 