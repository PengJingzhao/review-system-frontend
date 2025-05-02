<template>
  <div class="notes-container">
    <div 
      v-for="note in notes" 
      :key="note.id" 
      class="note-card"
      @click="goToDetail(note.id)"
    >
      <img :src="getCoverImage(note)" class="note-cover" />
      <div class="note-info">
        <div class="tags-container" v-if="getTags(note).length > 0">
          <el-tag v-for="tag in getTags(note)" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
        </div>
        <p class="note-desc">{{ note.textContent }}</p>
        <div class="note-location" v-if="note.location">
          <el-icon><Location /></el-icon>
          <span>{{ note.location }}</span>
        </div>
        <div class="note-meta">
          <div class="author-info">
            <el-avatar :size="24" class="avatar"></el-avatar>
            <span class="note-author">{{ note.user ? note.user.name : '未知用户' }}</span>
          </div>
          <div class="note-time">
            {{ formatTime(note.createdAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Star, ChatDotRound, Location } from '@element-plus/icons-vue'

const router = useRouter()

defineProps({
  notes: {
    type: Array,
    required: true
  }
})

// 获取封面图片
const getCoverImage = (note) => {
  if (note.mediaUrls) {
    if (typeof note.mediaUrls === 'string') {
      return note.mediaUrls
    } else if (Array.isArray(note.mediaUrls)) {
      return note.mediaUrls[0]
    }
  }
  return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
}

// 获取标签列表
const getTags = (note) => {
  if (!note.tags) return []
  
  try {
    if (typeof note.tags === 'string') {
      if (note.tags.startsWith('[')) {
        return JSON.parse(note.tags)
      } else {
        return note.tags.split(',')
      }
    } else if (Array.isArray(note.tags)) {
      return note.tags
    }
  } catch (e) {
    return [note.tags]
  }
  
  return []
}

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前'
  }
  
  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前'
  }
  
  // 小于1个月
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前'
  }
  
  // 格式化日期
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 跳转到笔记详情页
const goToDetail = (id) => {
  router.push(`/note/${id}`)
}
</script>

<style scoped>
.notes-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 100%;
}

.note-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  cursor: pointer;
}

.note-card:hover {
  transform: translateY(-5px);
}

.note-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.note-info {
  padding: 15px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.tag-item {
  margin-right: 4px;
  margin-bottom: 4px;
}

.note-desc {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.note-location {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.note-location .el-icon {
  margin-right: 4px;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.note-time {
  font-size: 12px;
  color: #999;
}

.interaction {
  display: flex;
  gap: 16px;
}

.note-likes,
.note-comments {
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-likes {
  color: #ff2442;
}

.note-comments {
  color: #666;
}
</style> 