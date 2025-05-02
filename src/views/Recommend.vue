<template>
  <div class="recommend-page">
    <div v-if="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="recommendNotes.length === 0">
      <el-empty description="暂无推荐内容" />
    </div>
    <div v-else>
      <NoteList :notes="recommendNotes" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NoteList from '@/components/NoteList.vue'
import noteApi from '@/api/note'
import { ElMessage } from 'element-plus'

const recommendNotes = ref([])
const loading = ref(true)

// 获取推荐笔记
const fetchRecommendNotes = async () => {
  loading.value = true
  try {
    const res = await noteApi.getRecommendNotes()
    if (res && res.records) {
      recommendNotes.value = res.records
    } else {
      recommendNotes.value = []
    }
  } catch (error) {
    console.error('获取推荐笔记失败:', error)
    ElMessage.error('获取推荐笔记失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecommendNotes()
})
</script>

<style scoped>
.recommend-page {
  min-height: calc(100vh - 120px);
}
</style> 
