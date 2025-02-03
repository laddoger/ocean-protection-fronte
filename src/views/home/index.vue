<template>
  <div class="home-container">
    <!-- 欢迎标语 -->
    <div class="welcome-section">
      <h1>保护海洋生物，守护蔚蓝家园</h1>
      <p>让我们一起为海洋生态保护贡献力量</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索海洋生物..."
        class="search-input"
        clearable
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 海洋生物展示 -->
    <div class="featured-animals">
      <h2>{{ isSearching ? '搜索结果' : '海洋生物' }}</h2>
      <el-empty v-if="isSearching && animals.length === 0" description="未找到相关结果" />
      <el-row :gutter="20" v-else>
        <el-col 
          v-for="animal in animals" 
          :key="animal.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <el-card class="animal-card" @click="showAnimalDetail(animal)">
            <div class="card-body">
              <div class="image-container">
                <el-image 
                  :src="animal.imageUrl || 'https://via.placeholder.com/300x300?text=海洋生物'" 
                  fit="cover"
                  class="animal-image"
                />
              </div>
              <div class="animal-info">
                <h3>{{ animal.name }}</h3>
                <p class="scientific-name">{{ animal.scientificName }}</p>
                <p class="category">{{ animal.category }}</p>
                <el-tag :type="getStatusType(animal.conservationStatus)">
                  {{ animal.conservationStatus }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 动物详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedAnimal?.name"
      width="70%"
    >
      <animal-detail
        v-if="selectedAnimal"
        :animal="selectedAnimal"
        @close="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { animalApi, getFeaturedAnimals } from '@/api/animal'
import type { Animal } from '@/api/animal'
import AnimalDetail from '@/components/AnimalDetail.vue'

const animals = ref<Animal[]>([])
const selectedAnimal = ref<Animal | null>(null)
const dialogVisible = ref(false)
const searchKeyword = ref('')
const isSearching = ref(false)

// 获取保护状态对应的标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '濒危':
      return 'danger'
    case '易危':
      return 'warning'
    case '近危':
      return 'info'
    default:
      return ''
  }
}

// 显示动物详情
const showAnimalDetail = (animal: Animal) => {
  selectedAnimal.value = animal
  dialogVisible.value = true
}

// 加载所有动物数据
const loadAnimals = async () => {
  try {
    const response = await getFeaturedAnimals()
    if (response.code === 200) {
      animals.value = response.data
    }
  } catch (error) {
    console.error('加载动物数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 处理搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    isSearching.value = false
    await loadAnimals()
    return
  }

  isSearching.value = true
  try {
    const response = await animalApi.searchAnimals(searchKeyword.value.trim())
    if (response.code === 200) {
      animals.value = response.data
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败')
  }
}

onMounted(() => {
  loadAnimals()
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-section {
  text-align: center;
  margin: 40px 0;
}

.welcome-section h1 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.search-section {
  max-width: 600px;
  margin: 30px auto;
}

.search-input {
  width: 100%;
}

.featured-animals {
  margin-top: 40px;
}

.featured-animals h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.animal-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
  width: 100%;
  height: 0;
  padding-bottom: 100%; /* 使卡片保持1:1的宽高比 */
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

.animal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.animal-info {
  flex: 1;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.animal-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2em;
}

.scientific-name {
  font-style: italic;
  color: #666;
  margin: 8px 0;
  font-size: 0.9em;
}

.category {
  color: #909399;
  margin: 5px 0;
  font-size: 0.9em;
}

.el-tag {
  margin-top: 8px;
}

.animal-card:hover {
  transform: translateY(-5px);
}
</style> 