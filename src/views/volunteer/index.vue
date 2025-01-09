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
      <el-table :data="organizations" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="组织名称" />
        <el-table-column prop="description" label="组织描述" />
        <el-table-column prop="memberCount" label="成员数量" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <template v-if="isFounder(scope.row)">
              <el-button 
                text 
                type="danger" 
                @click="disbandOrganization(scope.row)"
                :loading="loading"
              >
                解散组织
              </el-button>
            </template>
            <template v-else>
              <el-button 
                text 
                type="primary" 
                @click="joinOrganization(scope.row)"
                :loading="loading"
              >
                加入组织
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
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
              type="primary"
              @click="joinActivity(scope.row)"
            >
              报名参加
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
      await loadOrganizations()
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

// 加载组织列表
const loadOrganizations = async () => {
  try {
    loading.value = true
    const response = await volunteerApi.getOrganizations()
    if (response && response.code === 200 && Array.isArray(response.data)) {
      organizations.value = response.data
    } else {
      console.error('Invalid organizations response:', response)
      organizations.value = []
      ElMessage.error('加载组织列表失败')
    }
  } catch (error) {
    console.error('Failed to load organizations:', error)
    organizations.value = []
    ElMessage.error('加载组织列表失败')
  } finally {
    loading.value = false
  }
}

// 加载活动列表
const loadActivities = async () => {
  try {
    loading.value = true
    const response = showOngoing.value 
      ? await volunteerApi.getOngoingActivities()
      : await volunteerApi.getFinishedActivities()
    if (response && response.code === 200 && Array.isArray(response.data)) {
      activities.value = response.data
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

// 加入组织
const joinOrganization = async (organization: Organization) => {
  try {
    loading.value = true
    const response = await volunteerApi.joinOrganization(organization.id)
    if (response && response.code === 200) {
      ElMessage.success('加入组织成功')
      await loadOrganizations()
    } else {
      ElMessage.error('加入组织失败')
    }
  } catch (error) {
    console.error('Failed to join organization:', error)
    ElMessage.error('加入组织失败')
  } finally {
    loading.value = false
  }
}

// 报名参加活动
const joinActivity = async (activity: Activity) => {
  try {
    loading.value = true
    const response = await volunteerApi.joinActivity(activity.id)
    if (response && response.code === 200) {
      ElMessage.success('报名成功')
      await loadActivities()
    } else {
      ElMessage.error('报名失败')
    }
  } catch (error) {
    console.error('Failed to join activity:', error)
    ElMessage.error('报名失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    // 确保先加载用户信息
    if (userStore.isLoggedIn && !userStore.userInfo) {
      await userStore.loadUserInfo()
    }
    
    // 并行加载组织和活动列表
    await Promise.all([
      loadOrganizations(),
      loadActivities()
    ])
  } catch (error) {
    console.error('Failed to initialize volunteer page:', error)
    ElMessage.error('加载数据失败')
  }
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
</style> 