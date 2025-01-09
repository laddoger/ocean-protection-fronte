<template>
  <div class="home">
    <div v-loading="loading" element-loading-fullscreen>
      <el-row :gutter="20">
        <!-- 搜索区域 -->
        <el-col :span="24" class="search-section">
          <h2 class="section-title">探索海洋生物</h2>
          <p class="section-desc">搜索并了解海洋生物的奥秘</p>
          <el-input
            v-model="searchQuery"
            placeholder="搜索海洋动物..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
          <div class="search-tags">
            <el-tag
              v-for="tag in hotSearchTags"
              :key="tag"
              class="hot-tag"
              @click="quickSearch(tag)"
            >
              {{ tag }}
            </el-tag>
          </div>
        </el-col>
        
        <!-- 精选动物展示 -->
        <el-col :span="24" class="featured-section">
          <h2>海洋生物图鉴</h2>
          <el-empty v-if="featuredAnimals.length === 0" description="暂无数据" />
          <el-row v-else :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" 
                    v-for="animal in featuredAnimals" 
                    :key="animal.id">
              <el-card class="animal-card" shadow="hover">
                <el-image :src="animal.image_url" class="animal-image" />
                <div class="animal-info">
                  <h3>{{ animal.name }}</h3>
                  <div class="animal-tags">
                    <el-tag size="small" type="info">{{ animal.category?.name }}</el-tag>
                    <el-tag 
                      size="small" 
                      :type="getConservationTagType(animal.conservation)"
                    >
                      {{ animal.conservation }}
                    </el-tag>
                  </div>
                  <p class="description">{{ animal.description }}</p>
                  <el-button 
                    type="primary" 
                    link 
                    @click="showAnimalDetail(animal)"
                  >
                    了解更多
                  </el-button>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </el-col>
      </el-row>

      <!-- 动物详情对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="selectedAnimal?.name"
        width="70%"
        destroy-on-close
      >
        <animal-detail
          v-if="selectedAnimal"
          :animal="selectedAnimal"
          @close="dialogVisible = false"
        />
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAnimalCategories, getFeaturedAnimals } from '@/api/animal'
import type { AnimalCategory, Animal } from '@/types/animal'
import AnimalDetail from '@/components/AnimalDetail.vue'

const searchQuery = ref('')
const dialogVisible = ref(false)
const selectedAnimal = ref<Animal | null>(null)
const categories = ref<AnimalCategory[]>([])
const featuredAnimals = ref<Animal[]>([])
const loading = ref(false)

// 热门搜索标签 - 使用实际的类别名称
const hotSearchTags = ref([
  '哺乳类', '鱼类', '爬行类', '软体动物', '甲壳类'
])

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    console.log('开始加载数据...')
    const [categoriesRes, animalsRes] = await Promise.all([
      getAnimalCategories(),
      getFeaturedAnimals()
    ])
    
    console.log('分类数据:', categoriesRes)
    console.log('动物数据:', animalsRes)

    categories.value = Array.isArray(categoriesRes) ? categoriesRes : []
    
    featuredAnimals.value = Array.isArray(animalsRes) ? animalsRes : []
    
    if (featuredAnimals.value.length === 0) {
      featuredAnimals.value = [
        // {
        //   id: 1,
        //   name: '蓝鲸',
        //   image_url: 'https://via.placeholder.com/300x200',
        //   description: '蓝鲸是地球上最大的动物，主要以浮游生物为食。',
        //   category_id: 1,
        //   category: categories.value[0],
        //   habitat: '深海水域',
        //   conservation: '濒危',
        //   diet: '浮游生物'
        // },
        // {
        //   id: 2,
        //   name: '绿海龟',
        //   image_url: 'https://via.placeholder.com/300x200',
        //   description: '绿海龟是一种大型海龟，主要以海草为食。',
        //   category_id: 3,
        //   category: categories.value[2],
        //   habitat: '热带海域',
        //   conservation: '易危',
        //   diet: '海草'
        // }
      ]
    }
    
    console.log('处理后的动物数据:', featuredAnimals.value)
  } catch (error) {
    console.error('Failed to load data:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  const keyword = searchQuery.value.toLowerCase().trim()
  const matchingCategory = categories.value.find(
    category => category.name.includes(keyword)
  )
  
  if (matchingCategory) {
    // 按类别搜索
    const filtered = featuredAnimals.value.filter(
      animal => animal.category?.id === matchingCategory.id
    )
    if (filtered.length > 0) {
      featuredAnimals.value = filtered
    } else {
      ElMessage.info(`暂无${matchingCategory.name}类动物数据`)
    }
  } else {
    // 按名称或描述搜索
    const filtered = featuredAnimals.value.filter(animal =>
      animal.name.toLowerCase().includes(keyword) ||
      animal.description.toLowerCase().includes(keyword)
    )
    if (filtered.length > 0) {
      featuredAnimals.value = filtered
    } else {
      ElMessage.info('未找到相关动物')
    }
  }
}

// 快速搜索
const quickSearch = (tag: string) => {
  searchQuery.value = tag
  handleSearch()
}

// 显示动物详情
const showAnimalDetail = (animal: Animal) => {
  selectedAnimal.value = animal
  dialogVisible.value = true
}

// 获取保护状态标签类型
const getConservationTagType = (status: string) => {
  const types: { [key: string]: string } = {
    '极危': 'danger',
    '濒危': 'warning',
    '易危': 'warning',
    '近危': 'info',
    '无危': 'success'
  }
  return types[status] || 'info'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.home {
  padding: 20px;
}

.search-section {
  margin: 30px 0;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
  display: block;
}

.featured-section {
  margin: 40px 0;
}

.featured-section h2 {
  margin-bottom: 20px;
  color: #303133;
}

.animal-card {
  margin-bottom: 20px;
}

.animal-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.animal-info {
  padding: 15px;
}

.animal-info h3 {
  margin: 0;
  color: #303133;
}

.scientific-name {
  color: #909399;
  font-style: italic;
  margin: 5px 0;
}

.description {
  color: #606266;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.section-title {
  text-align: center;
  font-size: 2em;
  margin-bottom: 10px;
}

.section-desc {
  text-align: center;
  color: #606266;
  margin-bottom: 20px;
}

.search-tags {
  margin-top: 15px;
  text-align: center;
}

.hot-tag {
  margin: 0 5px;
  cursor: pointer;
}

.animal-tags {
  margin: 5px 0 10px;
  display: flex;
  gap: 5px;
}
</style> 