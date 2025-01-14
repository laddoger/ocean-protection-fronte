<template>
  <div class="home-container">
    <!-- 欢迎标语 -->
    <div class="welcome-section">
      <h1>保护海洋生物，守护蔚蓝家园</h1>
      <p>让我们一起为海洋生态保护贡献力量</p>
    </div>

    <!-- 精选海洋生物展示 -->
    <div class="featured-animals">
      <h2>精选海洋生物</h2>
      <el-row :gutter="20">
        <el-col 
          v-for="animal in featuredAnimals" 
          :key="animal.id" 
          :xs="24" 
          :sm="12" 
          :md="8" 
          :lg="6"
        >
          <el-card class="animal-card" @click="showAnimalDetail(animal)">
            <div class="animal-info">
              <h3>{{ animal.name }}</h3>
              <p class="scientific-name">{{ animal.scientificName }}</p>
              <el-tag :type="getStatusType(animal.conservationStatus)">
                {{ animal.conservationStatus }}
              </el-tag>
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
import { getFeaturedAnimals } from '@/api/animal'
import type { Animal } from '@/api/animal'
import AnimalDetail from '@/components/AnimalDetail.vue'

const featuredAnimals = ref<Animal[]>([])
const selectedAnimal = ref<Animal | null>(null)
const dialogVisible = ref(false)

// 获取保护状态对应的标签类型
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

// 显示动物详情
const showAnimalDetail = (animal: Animal) => {
  selectedAnimal.value = animal
  dialogVisible.value = true
}

// 加载精选动物数据
const loadFeaturedAnimals = async () => {
  try {
    const response = await getFeaturedAnimals()
    if (response.code === 200) {
      featuredAnimals.value = response.data
    }
  } catch (error) {
    console.error('加载精选动物失败:', error)
    ElMessage.error('加载数据失败')
  }
}

onMounted(() => {
  loadFeaturedAnimals()
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
}

.animal-card:hover {
  transform: translateY(-5px);
}

.animal-info {
  text-align: center;
}

.animal-info h3 {
  margin: 0;
  color: #2c3e50;
}

.scientific-name {
  font-style: italic;
  color: #666;
  margin: 10px 0;
}

.el-tag {
  margin-top: 10px;
}
</style> 