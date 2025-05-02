<template>
  <div class="note-card" @click="goToNoteDetail">
    <!-- 笔记封面图片 -->
    <div class="note-cover">
      <img :src="coverImage" :alt="textContent" />
      <!-- 视频图标（如果有视频） -->
      <div v-if="hasVideo" class="video-icon">
        <el-icon><VideoPlay /></el-icon>
      </div>
    </div>
    
    <!-- 笔记内容 -->
    <div class="note-content">
      <div class="note-tags" v-if="tagList && tagList.length > 0">
        <el-tag v-for="tag in tagList" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
      </div>
      <p class="note-text">{{ textContent }}</p>
      <div class="note-location" v-if="note.location">
        <el-icon><Location /></el-icon>
        <span>{{ note.location }}</span>
      </div>
    </div>
    
    <!-- 笔记底部信息 -->
    <div class="note-footer">
      <!-- 作者信息 -->
      <div class="note-author" @click.stop="goToUserProfile">
        <el-avatar :size="20"></el-avatar>
        <span class="author-name">{{ authorName }}</span>
      </div>
      
      <!-- 创建时间 -->
      <div class="note-time">{{ formatDate(note.createdAt) }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '../store/noteStore'
import { StarFilled, Star, VideoPlay, Location } from '@element-plus/icons-vue'

// 定义组件属性
const props = defineProps({
  note: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const noteStore = useNoteStore()

// 计算属性，获取封面图片
const coverImage = computed(() => {
  if (props.note.mediaUrls) {
    // 假设mediaUrls可能是字符串或数组
    if (typeof props.note.mediaUrls === 'string') {
      return props.note.mediaUrls;
    } else if (Array.isArray(props.note.mediaUrls)) {
      return props.note.mediaUrls[0];
    }
  }
  return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'; // 默认图片
});

// 计算属性，获取文本内容
const textContent = computed(() => props.note.textContent || '');

// 计算属性，检查是否有视频
const hasVideo = computed(() => {
  // 这里可以根据实际需求判断是否有视频
  return false;
});

// 计算属性，获取作者名称
const authorName = computed(() => {
  if (props.note.user && props.note.user.name) {
    return props.note.user.name;
  }
  return '未知用户';
});

// 计算属性，获取标签列表
const tagList = computed(() => {
  if (!props.note.tags) return [];
  
  try {
    // 尝试解析JSON字符串
    if (typeof props.note.tags === 'string') {
      if (props.note.tags.startsWith('[')) {
        return JSON.parse(props.note.tags);
      } else {
        return [props.note.tags];
      }
    } else if (Array.isArray(props.note.tags)) {
      return props.note.tags;
    }
  } catch (e) {
    // 如果解析失败，则将tags作为单个标签返回
    return [props.note.tags];
  }
  
  return [];
});

// 跳转到笔记详情页
const goToNoteDetail = () => {
  router.push(`/note/${props.note.id}`)
}

// 跳转到用户主页
const goToUserProfile = () => {
  if (props.note.user && props.note.user.id) {
    router.push(`/user/${props.note.user.id}`)
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 1000)) + '分钟前';
  }
  
  // 小于1天
  if (diff < 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
  }
  
  // 小于1个月
  if (diff < 30 * 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
  }
  
  // 日期格式化
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
</script>

<style scoped>
.note-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.note-cover {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 75%;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 8px 8px 0 0;
}

.note-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.note-card:hover .note-cover img {
  transform: scale(1.05);
}

.video-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
}

.note-content {
  padding: 16px;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
}

.tag-item {
  margin-right: 4px;
  margin-bottom: 4px;
}

.note-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-location {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.note-location .el-icon {
  margin-right: 4px;
}

.note-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.note-author {
  display: flex;
  align-items: center;
  gap: 6px;
}

.author-name {
  font-size: 12px;
  color: #666;
}

.note-time {
  font-size: 12px;
  color: #999;
}

@media screen and (max-width: 768px) {
  .note-content {
    padding: 8px 10px 6px;
  }
  
  .note-footer {
    padding: 8px 10px;
  }
  
  .note-text {
    font-size: 12px;
  }
}
</style> 