<template>
  <div class="following">
    <div v-if="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="notes.length === 0">
      <el-empty description="暂无关注用户的笔记" />
    </div>
    <div v-else>
      <NoteList :notes="notes" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NoteList from '@/components/NoteList.vue'
import noteApi from '@/api/note'
import { ElMessage } from 'element-plus'

// 笔记数据
const notes = ref([])
const loading = ref(true)

// 获取关注用户的笔记列表
const fetchFollowingNotes = async () => {
  loading.value = true
  try {
    const res = await noteApi.getFollowingNotes()
    if (res && res.records) {
      notes.value = res.records
    } else {
      notes.value = []
    }
  } catch (error) {
    console.error('获取关注用户笔记失败:', error)
    ElMessage.error('获取关注用户笔记失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchFollowingNotes()
})
</script>

<style scoped>
.following {
  min-height: calc(100vh - 120px);
}
</style> 