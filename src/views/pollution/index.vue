<template>
  <div class="pollution-container" v-loading="loading">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="输入物品名称查询是否为海洋污染物..."
        class="search-input"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
        </template>
      </el-input>
    </div>
    
    <!-- 污染物列表 -->
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>海洋污染物信息</span>
        </div>
      </template>
      <el-table :data="pollutionList" stripe style="width: 100%">
        <el-table-column prop="name" label="污染物名称" />
        <el-table-column prop="category" label="类型" />
        <el-table-column prop="percentage" label="占比">
          <template #default="{ row }">
            {{ row.percentage ? `${Number(row.percentage).toFixed(2)}%` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="harmDescription" label="危害" show-overflow-tooltip />
        <el-table-column prop="protectionMeasures" label="保护措施" show-overflow-tooltip />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button text type="primary" @click="showDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
    >
      <div v-if="currentPollution">
        <h3>{{ currentPollution.name }}</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="类型">
            {{ currentPollution.category }}
          </el-descriptions-item>
          <el-descriptions-item label="占比">
            {{ currentPollution.percentage ? `${Number(currentPollution.percentage).toFixed(2)}%` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="危害">
            {{ currentPollution.harmDescription }}
          </el-descriptions-item>
          <el-descriptions-item label="保护措施">
            {{ currentPollution.protectionMeasures }}
          </el-descriptions-item>
        </el-descriptions>
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
const dialogTitle = ref('')
const currentPollution = ref<PollutionInfo | null>(null)
const searchResult = ref<boolean | null>(null)

// 加载污染物列表
const loadPollutionList = async () => {
  loading.value = true
  try {
    const response = await pollutionApi.getPollutionList()
    console.log('API Response:', response)
    
    // 确保 response 是正确的格式
    if (response && response.code === 200 && Array.isArray(response.data)) {
      pollutionList.value = response.data
      console.log('Processed data:', pollutionList.value)
    } else {
      console.error('Invalid response format:', response)
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
    dialogTitle.value = '污染物详情'
    dialogVisible.value = true
  } catch (error) {
    console.error('Search failed:', error)
    currentPollution.value = null
    searchResult.value = false
    dialogTitle.value = '搜索结果'
    dialogVisible.value = true
  } finally {
    loading.value = false
  }
}

// 显示详情
const showDetail = (pollution: PollutionInfo) => {
  currentPollution.value = pollution
  searchResult.value = true
  dialogTitle.value = '污染物详情'
  dialogVisible.value = true
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
  margin-bottom: 20px;
}

.search-input {
  max-width: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-result {
  text-align: center;
  font-size: 18px;
  color: #909399;
  padding: 20px;
}
</style> 