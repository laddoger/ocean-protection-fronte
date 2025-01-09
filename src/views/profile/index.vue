<template>
  <div class="profile-container">
    <!-- 个人信息卡片 -->
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" @click="editMode = !editMode">
            {{ editMode ? '保存' : '编辑' }}
          </el-button>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="profileForm"
        :disabled="!editMode"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        
        <el-form-item label="性别">
          <el-select v-model="profileForm.gender">
            <el-option label="男" value="MALE" />
            <el-option label="女" value="FEMALE" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="年龄">
          <el-input-number v-model="profileForm.age" :min="1" :max="120" />
        </el-form-item>
        
        <el-form-item label="家庭住址">
          <el-input v-model="profileForm.address" type="textarea" />
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
        <el-table-column prop="viewCount" label="浏览数" />
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
        <el-table-column prop="description" label="组织描述" />
        <el-table-column prop="memberCount" label="成员数量" />
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
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { userApi } from '@/api/user'
import type { UserProfile } from '@/types/user'
import type { Post } from '@/types/forum'
import type { Organization, Activity } from '@/types/volunteer'

const router = useRouter()
const loading = ref(false)
const editMode = ref(false)

const profileForm = ref<UserProfile>({
  id: 0,
  username: '',
  nickname: '',
  gender: 'OTHER',
  age: 0,
  address: '',
  createdTime: '',
  updatedTime: ''
})

const posts = ref<Post[]>([])
const organizations = ref<Organization[]>([])
const activities = ref<Activity[]>([])

// 加载用户信息
const loadProfile = async () => {
  try {
    loading.value = true
    const res = await userApi.getProfile()
    if (res.code === 200) {
      profileForm.value = res.data
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
    ElMessage.error('加载个人信息失败')
  } finally {
    loading.value = false
  }
}

// 更新用户信息
const updateProfile = async () => {
  try {
    loading.value = true
    const res = await userApi.updateProfile({
      gender: profileForm.value.gender,
      age: profileForm.value.age,
      address: profileForm.value.address
    })
    
    if (res.code === 200) {
      ElMessage.success('更新成功')
      editMode.value = false
    }
  } catch (error) {
    console.error('Failed to update profile:', error)
    ElMessage.error('更新个人信息失败')
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

// 加载用户组织
const loadOrganizations = async () => {
  try {
    const res = await userApi.getUserOrganizations()
    if (res.code === 200) {
      organizations.value = res.data
    }
  } catch (error) {
    console.error('Failed to load organizations:', error)
    ElMessage.error('加载组织失败')
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

// 监听编辑模式变化
watch(editMode, (newValue) => {
  if (!newValue) {
    // 如果退出编辑模式，则更新信息
    updateProfile()
  }
})

onMounted(async () => {
  await loadProfile()
  await Promise.all([
    loadPosts(),
    loadOrganizations(),
    loadActivities()
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