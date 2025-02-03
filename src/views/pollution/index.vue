<template>
  <div class="pollution-container" v-loading="loading">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="输入物品名称查询是否为海洋污染物..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 污染物展示 -->
    <div class="pollution-list">
      <h2>海洋污染物信息</h2>
      <el-row :gutter="20">
        <el-col 
          v-for="pollution in pollutionList" 
          :key="pollution.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <el-card class="pollution-card" @click="showDetail(pollution)">
            <div class="card-body">
              <div class="image-container">
                <el-image 
                  :src="getImageUrl(pollution.imageUrl)"
                  fit="cover"
                  class="pollution-image"
                />
              </div>
              <div class="pollution-info">
                <h3>{{ pollution.name }}</h3>
                <p class="category">{{ pollution.category }}</p>
                <p class="percentage" v-if="pollution.percentage">
                  占比：{{ Number(pollution.percentage).toFixed(2) }}%
                </p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="70%"
    >
      <div v-if="currentPollution" class="pollution-detail">
        <div class="detail-header">
          <el-image 
            :src="getImageUrl(currentPollution.imageUrl)"
            fit="cover"
            class="detail-image"
          />
          <div class="detail-title">
            <h2>{{ currentPollution.name }}</h2>
            <p class="category">{{ currentPollution.category }}</p>
            <p class="percentage" v-if="currentPollution.percentage">
              占比：{{ Number(currentPollution.percentage).toFixed(2) }}%
            </p>
          </div>
        </div>
        <el-divider />
        <div class="detail-content">
          <div class="detail-section">
            <h3>危害描述</h3>
            <p>{{ currentPollution.harmDescription }}</p>
          </div>
          <div class="detail-section">
            <h3>保护措施</h3>
            <p>{{ currentPollution.protectionMeasures }}</p>
          </div>
        </div>
      </div>
      <div v-else-if="searchResult === false" class="search-result">
        该物品不是海洋污染物
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { pollutionApi, type PollutionInfo } from '@/api/pollution'

const loading = ref(false)
const searchQuery = ref('')
const pollutionList = ref<PollutionInfo[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('污染物详情')
const currentPollution = ref<PollutionInfo | null>(null)
const searchResult = ref<boolean | null>(null)

// 加载污染物列表
const loadPollutionList = async () => {
  loading.value = true
  try {
    const response = await pollutionApi.getPollutionList()
    if (response && response.code === 200 && Array.isArray(response.data)) {
      pollutionList.value = response.data
    } else {
      pollutionList.value = []
      ElMessage.error('数据格式错误')
    }
  } catch (error) {
    console.error('Failed to load pollution list:', error)
    pollutionList.value = []
    ElMessage.error('加载污染物信息失败')
  } finally {
    loading.value = false
  }
}

// 搜索污染物
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }

  loading.value = true
  try {
    const response = await pollutionApi.searchPollution(searchQuery.value.trim())
    if (response && response.code === 200) {
      currentPollution.value = response.data
      searchResult.value = true
    } else {
      currentPollution.value = null
      searchResult.value = false
    }
    dialogVisible.value = true
  } catch (error) {
    console.error('Search failed:', error)
    currentPollution.value = null
    searchResult.value = false
    dialogVisible.value = true
  } finally {
    loading.value = false
  }
}

// 显示详情
const showDetail = (pollution: PollutionInfo) => {
  currentPollution.value = pollution
  searchResult.value = true
  dialogVisible.value = true
}

// 获取图片完整URL
const getImageUrl = (imageUrl: string | undefined) => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/300x300?text=海洋污染物'
  }
  // 如果imageUrl已经是完整的URL（以http或https开头），则直接返回
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  // 如果imageUrl已经包含了/images/pollutants/路径，则只需要添加基础URL
  if (imageUrl.startsWith('/images/pollutants/')) {
    return `http://localhost:8080${imageUrl}`
  }
  // 否则拼接完整路径
  return `http://localhost:8080/images/pollutants/${imageUrl}`
}

onMounted(() => {
  loadPollutionList()
})
</script>

<style scoped>
.pollution-container {
  padding: 20px;
  position: relative;
  min-height: 200px;
}

.search-section {
  max-width: 600px;
  margin: 0 auto 30px;
}

.search-input {
  width: 100%;
}

.pollution-list {
  margin-top: 20px;
}

.pollution-list h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.pollution-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
}

.card-body {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}

.image-container {
  width: 100%;
  height: 50%;
  overflow: hidden;
  position: relative;
}

.pollution-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pollution-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pollution-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2em;
}

.category {
  color: #909399;
  margin: 8px 0;
  font-size: 0.9em;
}

.percentage {
  color: #606266;
  margin: 5px 0;
  font-size: 0.9em;
}

.pollution-card:hover {
  transform: translateY(-5px);
}

/* 详情对话框样式 */
.pollution-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.detail-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.detail-title {
  flex: 1;
}

.detail-title h2 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.detail-section p {
  color: #606266;
  line-height: 1.6;
}

.search-result {
  text-align: center;
  font-size: 18px;
  color: #909399;
  padding: 20px;
}
</style> 