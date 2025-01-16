<template>
  <!-- 整体布局容器 -->
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header>
      <!-- 左侧标题区域 -->
      <div class="header-left">
        <h2>海洋动物保护</h2>
      </div>

      <!-- 中间导航菜单 -->
      <el-menu
        mode="horizontal"
        :router="true"
        :default-active="route.path"
      >
        <!-- 导航菜单项 -->
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/pollution">海洋污染</el-menu-item>
        <el-menu-item index="/forum">论坛</el-menu-item>
        <el-menu-item index="/volunteer">志愿活动</el-menu-item>
      </el-menu>

      <!-- 右侧用户操作区域 -->
      <div class="header-right">
        <!-- 已登录状态显示用户信息和下拉菜单 -->
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
        <!-- 未登录状态显示登录注册按钮 -->
        <template v-else>
          <el-button @click="router.push('/login')">登录</el-button>
          <el-button type="primary" @click="router.push('/register')">
            注册
          </el-button>
        </template>
      </div>
    </el-header>
    
    <!-- 主要内容区域 -->
    <el-main>
      <router-view></router-view>
    </el-main>
    
    <!-- 页脚区域 -->
    <el-footer>
      <p>© 2024 海洋动物保护项目</p>
    </el-footer>
  </el-container>
</template>

<script setup lang="ts">
// 导入所需的组件和工具
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown } from '@element-plus/icons-vue'

// 初始化路由和状态管理
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 处理退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* 布局容器样式 */
.layout-container {
  min-height: 100vh;
}

/* 顶部导航栏样式 */
.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: auto !important; /* 允许高度自适应 */
  min-height: 60px;      /* 保持最小高度 */
}

/* 左侧标题区域样式 */
.header-left {
  flex-shrink: 0;       /* 防止标题被压缩 */
  margin-right: 20px;   /* 与导航菜单保持间距 */
}

/* 导航菜单样式 */
.el-menu {
  flex: 1;             /* 让导航菜单占据剩余空间 */
  justify-content: center; /* 菜单项居中显示 */
  border-bottom: none !important; /* 移除底部边框 */
  min-width: 400px;    /* 确保菜单有足够的最小宽度 */
}

/* 右侧用户操作区域样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;      /* 防止按钮区域被压缩 */
  margin-left: 20px;   /* 与导航菜单保持间距 */
}

/* 用户信息样式 */
.user-info {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap; /* 防止用户名换行 */
}

/* 页脚样式 */
.el-footer {
  text-align: center;
  color: #666;
  padding: 20px 0;
}

/* 响应式布局调整 */
@media screen and (max-width: 768px) {
  .el-header {
    flex-wrap: wrap;    /* 在小屏幕上允许换行 */
    padding: 10px 20px;
  }

  .el-menu {
    order: 3;          /* 在小屏幕上将菜单放到第三行 */
    width: 100%;       /* 菜单占据整行 */
    min-width: auto;   /* 重置最小宽度 */
  }

  .header-left {
    margin-right: auto; /* 标题靠左 */
  }

  .header-right {
    margin-left: 0;    /* 重置左边距 */
  }
}
</style> 