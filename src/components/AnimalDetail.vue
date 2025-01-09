<template>
  <div class="animal-detail">
    <el-image :src="animal.image_url" fit="cover" class="detail-image" />
    
    <div class="detail-content">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="分类">
          {{ animal.category?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="保护状态">
          <el-tag :type="getConservationTagType(animal.conservation)">
            {{ animal.conservation }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="栖息地">
          {{ animal.habitat }}
        </el-descriptions-item>
        <el-descriptions-item label="饮食习性">
          {{ animal.diet }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="detail-section">
        <h4>简介</h4>
        <p>{{ animal.description }}</p>
      </div>

      <div class="actions">
        <el-button @click="$emit('close')">关闭</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Animal } from '@/types/animal'

const router = useRouter()

defineProps<{
  animal: Animal
}>()

defineEmits<{
  (e: 'close'): void
}>()

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
</script>

<style scoped>
.animal-detail {
  padding: 20px;
}

.detail-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  margin-bottom: 20px;
  border-radius: 8px;
}

.detail-content {
  margin-top: 20px;
}

.detail-section {
  margin: 20px 0;
}

.detail-section h4 {
  color: #303133;
  margin-bottom: 10px;
}

.detail-section p {
  color: #606266;
  line-height: 1.6;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 