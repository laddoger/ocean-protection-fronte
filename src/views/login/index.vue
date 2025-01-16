<template>
  <!-- 登录页面容器 -->
  <div class="login-container">
    <!-- 登录卡片组件 -->
    <el-card class="login-card">
      <!-- 卡片头部 -->
      <template #header>
        <h2>登录</h2>
      </template>
      
      <!-- 登录表单 -->
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-width="80px"
      >
        <!-- 用户名输入框 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <!-- 密码输入框 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <!-- 按钮组容器 -->
        <el-form-item class="button-container">
          <div class="button-group">
            <!-- 登录按钮 -->
            <el-button 
              type="primary" 
              @click="handleLogin" 
              :loading="loading"
              class="action-button"
            >
              登录
            </el-button>
            <!-- 注册按钮 -->
            <el-button 
              @click="router.push('/register')"
              class="action-button"
            >
              注册账号
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 导入所需的组件和工具
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/user'

// 初始化路由和状态管理
const router = useRouter()
const userStore = useUserStore()
// 表单引用，用于表单验证
const formRef = ref<FormInstance>()
// 加载状态标志
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录逻辑
const handleLogin = async () => {
  if (!formRef.value) return
  
  // 验证表单
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        console.log('Login request:', loginForm)
        // 调用登录接口
        await userStore.login(loginForm.username, loginForm.password)
        console.log('Login successful')
        // 加载用户信息
        await userStore.loadUserInfo()
        ElMessage.success('登录成功')
        // 登录成功后跳转到首页
        router.push('/')
      } catch (error: any) {
        console.error('Login failed:', error)
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
/* 登录页面容器样式 */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

/* 登录卡片样式 */
.login-card {
  width: 400px;
}

/* 卡片标题样式 */
.login-card :deep(.el-card__header) {
  text-align: center;
  padding: 15px;
}

.login-card :deep(.el-card__header h2) {
  margin: 0;
  color: #303133;
}

/* 按钮容器样式 */
.button-container {
  margin-top: 30px;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  flex-direction: column;
  /* align-items: stretch; */
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 0;
  gap: 10px;
}

/* 按钮统一样式 */
.action-button {
  width: 100%;
  height: 40px;
  margin-bottom: 10px;
}

/* 表单项间距 */
.el-form-item {
  margin-bottom: 20px;
}

/* 最后一个表单项（按钮组）不需要底部边距 */
.el-form-item:last-child {
  margin-bottom: 0;
}
</style> 