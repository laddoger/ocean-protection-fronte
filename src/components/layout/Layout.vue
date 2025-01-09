<template>
  <el-container class="layout-container">
    <el-header>
      <div class="header-left">
        <h2>海洋动物保护</h2>
      </div>
      <el-menu
        mode="horizontal"
        :router="true"
        :default-active="route.path"
      >
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/pollution">海洋污染</el-menu-item>
        <el-menu-item index="/forum">论坛</el-menu-item>
        <el-menu-item index="/volunteer">志愿活动</el-menu-item>
      </el-menu>
      <div class="header-right">
        <template v-if="userStore.token">
          <el-dropdown>
            <span class="user-info">
              {{ userStore.userInfo?.username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button @click="router.push('/login')">登录</el-button>
          <el-button type="primary" @click="router.push('/register')">
            注册
          </el-button>
        </template>
      </div>
    </el-header>
    
    <el-main>
      <router-view></router-view>
    </el-main>
    
    <el-footer>
      <p>© 2024 海洋动物保护项目</p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.el-footer {
  text-align: center;
  color: #666;
  padding: 20px 0;
}
</style> 