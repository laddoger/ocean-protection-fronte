<template>
  <div class="profile-container">
    <!-- 个人信息卡片 -->
    <el-card class="profile-card">
      <template #header>
        <h3>个人信息</h3>
      </template>

      <el-form 
        ref="formRef"
        :model="profileForm"
        :rules="rules"
        label-width="80px"
      >
        <!-- 用户名（只读） -->
        <el-form-item label="用户名">
          <el-input 
            v-model="profileForm.username" 
            disabled 
            placeholder="加载中..."
          />
        </el-form-item>

        <!-- 性别 -->
        <el-form-item label="性别" prop="gender">
          <el-select v-model="profileForm.gender">
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>

        <!-- 年龄 -->
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="profileForm.age" :min="1" :max="120" />
        </el-form-item>

        <!-- 地址 -->
        <el-form-item label="地址" prop="address">
          <el-input v-model="profileForm.address" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 发表的帖子 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>我的帖子</span>
        </div>
      </template>
      
      <el-table :data="posts" style="width: 100%">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="createdTime" label="发布时间" />
        <el-table-column prop="likeCount" label="点赞数" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button text type="primary" @click="viewPost(scope.row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 加入的组织 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>我的组织</span>
        </div>
      </template>
      
      <el-table :data="organizations" style="width: 100%">
        <el-table-column prop="name" label="组织名称" />
        <el-table-column prop="description" label="组织简介" show-overflow-tooltip />
        <el-table-column prop="memberCount" label="成员数" width="100" />
        <el-table-column prop="joinTime" label="加入时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button text type="primary" @click="viewOrganization(scope.row)">
              查看
            </el-button>
            <el-button 
              text 
              type="danger" 
              @click="leaveOrganization(scope.row)"
              v-if="!scope.row.isLeader"
            >
              退出
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 参加的活动 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>我的活动</span>
        </div>
      </template>
      
      <el-table :data="activities" style="width: 100%">
        <el-table-column prop="title" label="活动名称" />
        <el-table-column prop="location" label="活动地点" />
        <el-table-column prop="startTime" label="开始时间" />
        <el-table-column prop="endTime" label="结束时间" />
        <el-table-column prop="status" label="状态" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { userApi } from '@/api/user'
import { volunteerApi } from '@/api/volunteer'
import type { UserProfile, UpdateProfileRequest } from '@/types/user'
import type { Post } from '@/types/forum'
import type { Activity, Organization } from '@/types/volunteer'

const router = useRouter()
const loading = ref(false)
const profileForm = ref<UserProfile>({
  id: 0,
  username: '',
  gender: 'OTHER',
  age: 0,
  address: '',
  createdTime: '',
  updatedTime: ''
})

const posts = ref<Post[]>([])
const activities = ref<Activity[]>([])
const organizations = ref<Organization[]>([])

// 表单验证规则
const rules = {
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }]
}

// 加载用户信息
const loadUserProfile = async () => {
  try {
    const response = await userApi.getProfile()
    console.log('User profile response:', response)
    if (response.code === 200 && response.data) {
      profileForm.value = {
        ...response.data,
        gender: response.data.gender || 'OTHER',
        age: response.data.age || 0,
        address: response.data.address || ''
      }
      console.log('Updated profile form:', profileForm.value)
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
    ElMessage.error('加载用户信息失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true
    
    // 只更新允许修改的字段
    const updateData: UpdateProfileRequest = {
      gender: profileForm.value.gender,
      age: profileForm.value.age,
      address: profileForm.value.address
    }

    const response = await userApi.updateProfile(updateData)
    if (response.code === 200) {
      ElMessage.success('更新成功')
      await loadUserProfile() // 重新加载最新数据
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    ElMessage.error('更新失败')
  } finally {
    loading.value = false
  }
}

// 加载用户帖子
const loadPosts = async () => {
  try {
    const res = await userApi.getUserPosts()
    if (res.code === 200) {
      posts.value = res.data
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
    ElMessage.error('加载帖子失败')
  }
}

// 加载用户活动
const loadActivities = async () => {
  try {
    const res = await userApi.getUserActivities()
    if (res.code === 200) {
      activities.value = res.data
    }
  } catch (error) {
    console.error('Failed to load activities:', error)
    ElMessage.error('加载活动失败')
  }
}

// 查看帖子详情
const viewPost = (post: Post) => {
  router.push(`/forum/post/${post.id}`)
}

// 加载用户加入的组织
const loadOrganizations = async () => {
  try {
    const res = await userApi.getUserOrganizations()
    if (res.code === 200) {
      organizations.value = res.data
    }
  } catch (error) {
    console.error('Failed to load organizations:', error)
    ElMessage.error('加载组织信息失败')
  }
}

// 查看组织详情
const viewOrganization = (org: Organization) => {
  router.push(`/volunteer/organization/${org.id}`)
}

// 退出组织
const leaveOrganization = async (org: Organization) => {
  try {
    await ElMessageBox.confirm(
      `确定要退出组织"${org.name}"吗？`,
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await volunteerApi.leaveOrganization(org.id)
    if (res.code === 200) {
      ElMessage.success('已退出组织')
      await loadOrganizations() // 重新加载组织列表
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to leave organization:', error)
      ElMessage.error('退出组织失败')
    }
  }
}

// 页面加载时获取所有数据
onMounted(async () => {
  await loadUserProfile()
  await Promise.all([
    loadPosts(),
    loadActivities(),
    loadOrganizations()
  ])
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  max-width: 500px;
}
</style>