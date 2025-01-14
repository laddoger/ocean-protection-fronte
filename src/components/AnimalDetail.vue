<template>
  <div class="animal-detail">
    <div class="detail-content">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="名称">
          {{ animal.name }}
        </el-descriptions-item>
        <el-descriptions-item label="学名">
          {{ animal.scientificName }}
        </el-descriptions-item>
        <el-descriptions-item label="栖息地">
          {{ animal.habitat }}
        </el-descriptions-item>
        <el-descriptions-item label="保护状态">
          <el-tag :type="getStatusType(animal.conservationStatus)">
            {{ animal.conservationStatus }}
          </el-tag>
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
import type { Animal } from '@/api/animal'

defineProps<{
  animal: Animal
}>()

defineEmits<{
  (e: 'close'): void
}>()

const getStatusType = (status: string) => {
  switch (status) {
    case 'EN濒危':
      return 'danger'
    case 'VU易危':
      return 'warning'
    case 'NT近危':
      return 'info'
    default:
      return 'info'
  }
}
</script>

<style scoped>
.animal-detail {
  padding: 20px;
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