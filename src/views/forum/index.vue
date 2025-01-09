<template>
  <div class="forum-container">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="dialogVisible = true">
        <el-icon><Plus /></el-icon>发布帖子
      </el-button>
    </div>

    <!-- 帖子列表 -->
    <div class="post-list">
      <el-card v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <div class="post-meta">
            <h3 class="post-title">{{ post.title }}</h3>
            <span class="time">发布于: {{ post.createdTime }}</span>
          </div>
          <div v-if="userStore.userInfo">
            <p>当前用户ID: {{ userStore.userInfo.id }}</p>
            <p>帖子用户ID: {{ post.userId }}</p>
          </div>
          <div class="post-actions" v-if="canEditPost(post)">
            <el-button text type="primary" @click="editPost(post)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button text type="danger" @click="deletePost(post)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        
        <p class="post-content">{{ post.content }}</p>
        
        <div class="post-actions">
          <el-button text @click="toggleLike(post)">
            <el-icon><Star :class="{ 'liked': post.isLiked }" /></el-icon>
            <span :class="{ 'liked': post.isLiked }">
              点赞 {{ post.likeCount || 0 }}
            </span>
          </el-button>
          <el-button text @click="showComments(post)">
            <el-icon><ChatDotRound /></el-icon>
            评论 {{ post.commentCount }}
          </el-button>
        </div>

        <!-- 评论区 -->
        <div v-if="post.showComments" class="comments-section">
          <el-divider>评论</el-divider>
          <div class="comment-list">
            <div v-if="!post.comments?.length" class="no-comments">
              暂无评论
            </div>
            <div v-else v-for="comment in post.comments" :key="comment.id" class="comment-item">
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-info">{{ comment.user?.username || `用户${comment.userId}` }}</span>
                  <span class="time">{{ comment.createdTime }}</span>
                </div>
                <p>{{ comment.content }}</p>
              </div>
            </div>
          </div>
          
          <!-- 评论输入框 -->
          <div class="comment-input">
            <el-input
              v-model="newComment"
              placeholder="发表评论..."
              :rows="2"
              type="textarea"
              :disabled="loading"
            />
            <el-button 
              type="primary" 
              @click="addComment(post)"
              :loading="loading"
            >
              发表评论
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 发帖/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑帖子' : '发布帖子'"
      width="50%"
    >
      <el-form :model="newPost" :rules="rules" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="newPost.title" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="newPost.content"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPost">
            {{ isEditing ? '保存' : '发布' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Star,
  ChatDotRound,
  Delete,
  Edit
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { forumApi, type Post, type ForumComment } from '@/api/forum'

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const editingPostId = ref<number | null>(null)
const newComment = ref('')

// 标签选项
const tags = [
  { label: '保护行动', value: 'action' },
  { label: '科普知识', value: 'knowledge' },
  { label: '经验分享', value: 'experience' },
  { label: '求助讨论', value: 'help' }
]

// 搜索和筛选
const searchQuery = ref('')
const selectedTag = ref('')

// 发帖表单
const newPost = ref({
  title: '',
  content: '',
  tag: '',
  images: []
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  tag: [
    { required: true, message: '请选择标签', trigger: 'change' }
  ]
}

const posts = ref<Post[]>([])

const loadPosts = async () => {
  loading.value = true
  try {
    const response = await forumApi.getPosts()
    console.log('Loaded posts:', response)
    
    if (response && response.code === 200 && Array.isArray(response.data)) {
      posts.value = response.data.map(post => ({
        ...post,
        showComments: false,
        comments: [],
        isLiked: false
      }))
    } else {
      console.error('Invalid response format:', response)
      posts.value = []
      ElMessage.error('数据格式错误')
    }
  } catch (error) {
    console.error('Failed to load posts:', error)
    posts.value = []
    ElMessage.error('加载帖子失败')
  } finally {
    loading.value = false
  }
}

// 检查是否可以编辑帖子
const canEditPost = (post: Post) => {
  const currentUserId = userStore.userInfo?.id
  const postUserId = post.userId
  const isMatch = currentUserId === postUserId
  
  console.log('Checking edit permission:', {
    postUserId,
    currentUserId,
    isMatch
  })
  
  return isMatch
}

// 提交帖子
const submitPost = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        const postData = {
          title: newPost.value.title,
          content: newPost.value.content,
        }
        
        console.log('Submitting post data:', postData)
        if (isEditing.value && editingPostId.value) {
          console.log('Updating post:', editingPostId.value)
          await forumApi.updatePost(editingPostId.value, postData)
          ElMessage.success('更新成功')
        } else {
          await forumApi.createPost(postData)
          ElMessage.success('发布成功')
        }
        
        dialogVisible.value = false
        isEditing.value = false
        editingPostId.value = null
        newPost.value = {
          title: '',
          content: '',
        }
        await loadPosts()
      } catch (error) {
        console.error('Submit post error:', error)
        ElMessage.error(isEditing.value ? '更新失败' : '发布失败')
      } finally {
        loading.value = false
      }
    }
  })
}

// 编辑帖子
const editPost = async (post: Post) => {
  if (!canEditPost(post)) {
    ElMessage.warning('只能编辑自己的帖子')
    return
  }
  
  isEditing.value = true
  editingPostId.value = post.id
  newPost.value = {
    title: post.title,
    content: post.content
  }
  dialogVisible.value = true
}

// 删除帖子
const deletePost = async (post: Post) => {
  if (!canEditPost(post)) {
    ElMessage.warning('只能删除自己的帖子')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      '确定要删除这篇帖子吗？删除后将无法恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await forumApi.deletePost(post.id)
    ElMessage.success('删除成功')
    await loadPosts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete error:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 显示评论
const showComments = async (post: Post) => {
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    loading.value = true
    if (!post.showComments) {
      const response = await forumApi.getComments(post.id)
      console.log('Loaded comments:', response)
      
      if (response && response.code === 200) {
        // 确保 comments 是数组
        post.comments = Array.isArray(response.data) ? response.data : []
        post.showComments = true
      } else {
        console.error('Invalid comments response:', response)
        post.comments = []
        ElMessage.error('加载评论失败')
      }
    } else {
      post.showComments = false
    }
  } catch (error) {
    console.error('Failed to load comments:', error)
    post.comments = []
    ElMessage.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

// 添加评论
const addComment = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }

  try {
    loading.value = true
    const response = await forumApi.addComment(post.id, newComment.value.trim())
    
    if (response && response.code === 200) {
      // 重新加载评论
      await showComments(post)
      newComment.value = ''
      ElMessage.success('评论成功')
    } else {
      ElMessage.error('评论失败')
    }
  } catch (error) {
    console.error('Failed to add comment:', error)
    ElMessage.error('评论失败')
  } finally {
    loading.value = false
  }
}

// 点赞/取消点赞
const toggleLike = async (post: Post) => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const response = await forumApi.toggleLike(post.id)
    if (response && response.code === 200) {
      post.isLiked = !post.isLiked
      post.likeCount = post.isLiked ? post.likeCount + 1 : post.likeCount - 1
      ElMessage.success(post.isLiked ? '点赞成功' : '取消点赞成功')
    } else {
      ElMessage.error('操作失败')
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
    ElMessage.error('操作失败')
  }
}

// 处理图片上传
const handleImageChange = async (file: File) => {
  try {
    const res = await forumApi.uploadImage(file)
    newPost.value.images.push(res.url)
  } catch (error) {
    ElMessage.error('图片上传失败')
  }
}

// 在组件挂载时加载帖子列表
onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.forum-container {
  padding: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-area {
  display: flex;
  gap: 20px;
}

.search-input {
  width: 300px;
}

.post-card {
  margin-bottom: 20px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-meta {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: bold;
  color: #303133;
}

.time {
  font-size: 12px;
  color: #909399;
}

.post-title {
  margin: 10px 0;
  color: #303133;
}

.post-content {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 15px;
}

.post-images {
  display: flex;
  gap: 10px;
  margin: 15px 0;
  flex-wrap: wrap;
}

.post-image {
  width: 200px;
  height: 150px;
  border-radius: 4px;
}

.post-actions {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.liked {
  color: #409EFF;
}

.comments-section {
  margin-top: 20px;
}

.comment-list {
  margin: 15px 0;
}

.comment-item {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.comment-content {
  flex: 1;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-info {
  font-weight: bold;
  color: #606266;
}

.no-comments {
  text-align: center;
  color: #909399;
  padding: 20px 0;
}

.comment-input {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.comment-input .el-button {
  align-self: flex-start;
}

.post-actions .el-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

.post-actions .el-icon {
  margin-right: 2px;
}
</style> 