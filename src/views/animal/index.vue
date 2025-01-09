<template>
  <div class="animal-container">
    <el-loading v-model="loading" />
    
    <!-- 海洋生物列表 -->
    <div class="animals-section">
      <h2>海洋生物图鉴</h2>
      <el-row :gutter="20">
        <el-col :span="8" v-for="animal in animals" :key="animal.id">
          <el-card class="animal-card">
            <template #header>
              <div class="card-header">
                <h3>{{ animal.name }}</h3>
                <p class="scientific-name">{{ animal.scientificName }}</p>
              </div>
            </template>
            <div class="card-content">
              <p class="description">{{ animal.description }}</p>
              <p class="habitat"><strong>栖息地：</strong>{{ animal.habitat }}</p>
              <div class="status">
                <strong>保护状态：</strong>
                <el-tag :type="getStatusType(animal.conservationStatus)">
                  {{ animal.conservationStatus }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getFeaturedAnimals } from '@/api/animal'
import type { Animal } from '@/api/animal'

const animals = ref<Animal[]>([])
const loading = ref(false)

const getStatusType = (status: string) => {
  switch (status) {
    case 'EN濒危':
      return 'danger'
    case 'VU易危':
      return 'warning'
    default:
      return 'info'
  }
}

const loadData = async () => {
  console.log('开始加载数据...')
  loading.value = true
  try {
    const response = await getFeaturedAnimals()
    console.log('返回数据:', response)
    
    if (response.code === 200 && Array.isArray(response.data)) {
      animals.value = response.data
      console.log('处理后的动物数据:', animals.value)
    } else {
      console.error('数据格式错误:', response)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.animal-container {
  padding: 20px;
}

.animals-section {
  margin-bottom: 30px;
}

h2 {
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.animal-card {
  margin-bottom: 20px;
  transition: transform 0.3s;
}

.animal-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
}

.scientific-name {
  font-style: italic;
  color: #666;
  margin: 5px 0;
}

.card-content {
  padding: 10px 0;
}

.description {
  margin-bottom: 15px;
  line-height: 1.5;
}

.habitat {
  margin-bottom: 10px;
  color: #606266;
}

.status {
  margin-top: 15px;
}

.status .el-tag {
  margin-left: 5px;
}
</style> 