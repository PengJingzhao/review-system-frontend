<template>
  <div class="note-detail-page">
    <TheHeader />
    
    <div class="content-container" v-loading="noteStore.isLoading">
      <template v-if="note">
        <div class="note-container">
          <!-- 笔记内容 -->
          <div class="note-content">
            <!-- 笔记标题和作者信息 -->
            <div class="note-header">
              <!-- <h1 class="note-title">{{ note.textContent }}</h1> -->
              <div class="author-info">
                <el-avatar :src="userAvatar" class="avatar" />
                <div class="author-meta">
                  <span class="author-name">{{ authorName }}</span>
                  <span class="publish-time">{{ formatPublishTime(note.createdAt) }}</span>
                </div>
                <el-button 
                  :type="isFollowing ? 'default' : 'primary'" 
                  :plain="!isFollowing"
                  :class="{ 'follow-btn': true, 'followed': isFollowing }"
                  @click="toggleFollow"
                >
                  {{ isFollowing ? '已关注' : '关注' }}
                </el-button>
              </div>
            </div>
            
            <!-- 笔记内容 -->
            <div class="note-body">
              <!-- 使用轮播图替换单张图片 -->
              <div class="cover-images" v-if="mediaImages.length > 0">
                <el-carousel :height="imageHeight" :interval="4000" arrow="always">
                  <el-carousel-item v-for="(img, index) in mediaImages" :key="index">
                    <img :src="img" alt="图片" class="carousel-image" />
                  </el-carousel-item>
                </el-carousel>
              </div>
              <div class="content-text" v-html="renderedContent"></div>
              
              <!-- 标签 -->
              <div class="note-tags" v-if="tags.length > 0">
                <el-tag v-for="tag in tags" :key="tag" size="small" class="tag-item">{{ tag }}</el-tag>
              </div>
              
              <!-- 位置 -->
              <div class="note-location" v-if="note.location">
                <el-icon><Location /></el-icon>
                <span>{{ note.location }}</span>
              </div>
            </div>
            
            <!-- 互动区域 -->
            <div class="interaction">
              <div class="action-buttons">
                <el-button :type="note.isLiked ? 'danger' : 'default'" @click="toggleLike">
                  <el-icon><Star /></el-icon>
                  {{ note.isLiked ? '已点赞' : '点赞' }} {{ note.likes }}
                </el-button>
                <el-button>
                  <el-icon><ChatDotRound /></el-icon>
                  评论 {{ note.comments }}
                </el-button>
                <el-button>
                  <el-icon><Share /></el-icon>
                  分享
                </el-button>
                <el-button>
                  <el-icon><Star /></el-icon>
                  收藏
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 评论区 -->
          <div class="comments-section">
            <div class="comments-header">
              <h3 class="section-title">评论 <span class="comment-count">{{ note.comments }}</span></h3>
              <div class="comments-sort">
                <span class="sort-item active">最热</span>
                <span class="sort-item">最新</span>
              </div>
            </div>
            
            <div class="comment-input-wrapper">
              <div class="comment-input">
                <el-avatar :src="userStore.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="user-avatar" />
                <el-input
                  v-model="commentText"
                  type="textarea"
                  :rows="2"
                  placeholder="啊啊，不错哦，发条评论吧"
                  resize="none"
                  class="comment-textarea"
                />
              </div>
              <div class="comment-input-actions">
                <div class="action-icons">
                  <el-icon class="action-icon"><Edit /></el-icon>
                  <el-icon class="action-icon"><ChatSquare /></el-icon>
                  <el-icon class="action-icon"><Picture /></el-icon>
                </div>
                <div class="action-buttons">
                  <el-checkbox v-model="notifyOnReply" label="同时转发到动态" size="small" />
                  <el-button type="primary" class="submit-btn" :disabled="!commentText.trim()">发布</el-button>
                </div>
              </div>
            </div>
            
            <div class="comments-list">
              <div v-for="comment in comments" :key="comment.id" class="comment-item">
                <el-avatar :src="comment.avatar" class="comment-avatar" />
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="comment-author">{{ comment.author }}</span>
                    <span class="comment-time">{{ comment.time }}</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <div class="comment-actions">
                    <div class="comment-action-item">
                      <el-icon><Star /></el-icon>
                      <span>{{ comment.likes || 0 }}</span>
                    </div>
                    <div class="comment-action-item">
                      <el-icon><ChatLineRound /></el-icon>
                      <span>回复</span>
                    </div>
                    <div class="comment-action-item">
                      <el-icon><MoreFilled /></el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 相关推荐 -->
        <div class="related-notes">
          <h3 class="section-title">相关推荐</h3>
          <NoteList :notes="relatedNotes" />
        </div>
      </template>
      
      <!-- 笔记不存在 -->
      <el-empty v-else description="笔记不存在或已被删除" v-if="!noteStore.isLoading">
        <el-button type="primary" @click="goToHome">返回首页</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNoteStore } from '../store/noteStore'
import { useUserStore } from '../store/userStore'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Star, ChatDotRound, Share, Location, ChatSquare, Picture, ChatLineRound, MoreFilled, Edit } from '@element-plus/icons-vue'
import TheHeader from '../components/TheHeader.vue'
import CommentItem from '../components/CommentItem.vue'
import userApi from '../api/user'
import noteApi from '../api/note'
import NoteList from '@/components/NoteList.vue'
import MarkdownIt from 'markdown-it'

const route = useRoute()
const router = useRouter()
const noteStore = useNoteStore()
const userStore = useUserStore()

// 评论内容
const commentText = ref('')

// 轮播图片高度
const imageHeight = ref('450px')

// 相关推荐笔记
const relatedNotes = ref([])

// 当前笔记ID
const noteId = computed(() => route.params.id)

// 当前笔记
const note = computed(() => noteStore.currentNote)

// 是否是作者
const isAuthor = computed(() => {
  if (!note.value || !userStore.userId) return false
  return note.value.user && note.value.user.id === userStore.userId
})

// 获取作者名称
const authorName = computed(() => {
  if (!note.value || !note.value.user) return '未知用户'
  return note.value.user.name
})

// 获取用户头像
const userAvatar = computed(() => {
  if (!note.value || !note.value.user) return 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  return note.value.user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
})

// 获取封面图片
const coverImage = computed(() => {
  if (!note.value) return null
  
  if (note.value.mediaUrls) {
    if (typeof note.value.mediaUrls === 'string') {
      return note.value.mediaUrls
    } else if (Array.isArray(note.value.mediaUrls)) {
      return note.value.mediaUrls[0]
    }
  }
  
  return null
})

// 获取所有媒体图片
const mediaImages = computed(() => {
  if (!note.value || !note.value.mediaUrls) return []
  
  if (typeof note.value.mediaUrls === 'string') {
    // 如果是字符串
    if (note.value.mediaUrls.includes(',')) {
      // 处理逗号分隔的URL列表
      return note.value.mediaUrls.split(',').map(url => url.trim()).filter(url => url)
    } else if (note.value.mediaUrls.startsWith('[')) {
      // 尝试解析JSON数组
      try {
        return JSON.parse(note.value.mediaUrls)
      } catch (e) {
        // 解析失败，当作单个URL处理
        return [note.value.mediaUrls]
      }
    } else {
      // 单个URL字符串
      return [note.value.mediaUrls]
    }
  } else if (Array.isArray(note.value.mediaUrls)) {
    // 如果已经是数组，直接返回
    return note.value.mediaUrls
  }
  
  return []
})

// 获取标签
const tags = computed(() => {
  if (!note.value || !note.value.tags) return []
  
  try {
    if (typeof note.value.tags === 'string') {
      if (note.value.tags.startsWith('[')) {
        return JSON.parse(note.value.tags)
      } else {
        return note.value.tags.split(',')
      }
    } else if (Array.isArray(note.value.tags)) {
      return note.value.tags
    }
  } catch (e) {
    return [note.value.tags]
  }
  
  return []
})

// 格式化发布时间
const formatPublishTime = (dateString) => {
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

// 初始化MarkdownIt
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

// 渲染Markdown内容
const renderedContent = computed(() => {
  if (!note.value || !note.value.textContent) return ''
  return md.render(note.value.textContent)
})

// 页面初始化
onMounted(async () => {
  // 获取笔记详情
  await noteStore.fetchNoteDetail(noteId.value)
  
  // 获取评论列表
  if (note.value) {
    await noteStore.fetchNoteComments(noteId.value)
    // 获取相关推荐
    fetchRelatedNotes()
  }
  
  // 调整图片高度
  adjustImageHeight()
  window.addEventListener('resize', adjustImageHeight)
})

// 组件销毁时
onUnmounted(() => {
  window.removeEventListener('resize', adjustImageHeight)
})

// 调整图片高度
const adjustImageHeight = () => {
  if (window.innerWidth <= 768) {
    imageHeight.value = '300px'
  } else {
    imageHeight.value = '450px'
  }
}

// 获取相关推荐
const fetchRelatedNotes = async () => {
  // 实际项目中应该调用API获取相关推荐
  // 这里模拟一些数据
  relatedNotes.value = [
    {
      id: '101',
      title: '秋日穿搭指南：温暖又时髦',
      coverImage: 'https://picsum.photos/id/237/300/300',
      author: {
        id: '201',
        username: '穿搭达人',
        avatar: 'https://picsum.photos/id/1005/300/300'
      }
    },
    {
      id: '102',
      title: '简约风家居装饰DIY',
      coverImage: 'https://picsum.photos/id/106/300/300',
      author: {
        id: '202',
        username: '家居控',
        avatar: 'https://picsum.photos/id/1012/300/300'
      }
    },
    {
      id: '103',
      title: '超实用旅行收纳技巧',
      coverImage: 'https://picsum.photos/id/250/300/300',
      author: {
        id: '203',
        username: '旅行家',
        avatar: 'https://picsum.photos/id/1025/300/300'
      }
    }
  ]
}

// 切换点赞状态
const toggleLike = async () => {
  try {
    // 调用点赞API
    const likesCount = await noteApi.likeNote(noteId.value)
    
    // 更新点赞状态
    note.value.isLiked = !note.value.isLiked
    
    // 使用API返回的点赞数更新
    note.value.likes = likesCount
  } catch (error) {
    ElMessage.error('点赞失败，请稍后再试')
    console.error('点赞操作失败:', error)
  }
}

// 前往首页
const goToHome = () => {
  router.push('/home/recommend')
}

// 获取关注状态
const isFollowing = computed(() => {
  if (!note.value || !note.value.user) return false
  return note.value.user.attention === true
})

// 切换关注状态
const toggleFollow = async () => {
  if (!note.value || !note.value.user) return
  
  try {
    const currentStatus = isFollowing.value
    
    if (currentStatus) {
      // 取消关注
      await userApi.unfollowUser(note.value.user.id)
    } else {
      // 关注
      await userApi.followUser(note.value.user.id)
    }
    
    // 更新状态
    note.value.user.attention = !currentStatus
    ElMessage.success(currentStatus ? '已取消关注' : '已成功关注')
  } catch (error) {
    ElMessage.error('操作失败，请稍后再试')
    console.error('关注操作失败:', error)
  }
}
</script>

<style scoped>
.note-detail-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.content-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: 20px;
}

.note-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.note-images {
  width: 100%;
}

.note-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.note-text {
  padding: 20px;
}

.note-title {
  font-size: 24px;
  color: #333;
  margin: 0 0 10px;
  line-height: 1.4;
}

.note-meta {
  font-size: 14px;
  color: #999;
  margin-bottom: 15px;
}

.note-body {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  margin-bottom: 20px;
  word-break: break-word;
  white-space: pre-wrap;
}

.cover-images {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #f5f5f5;
}

.note-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 20px;
  padding: 0 20px;
}

.tag-item {
  background-color: #f7f7f7;
  color: #666;
}

.note-location {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 14px;
  margin-top: 16px;
  padding: 0 20px 20px;
}

.note-location .el-icon {
  margin-right: 4px;
}

.content-text {
  font-size: 16px;
  line-height: 1.7;
  color: #333;
  padding: 15px 20px;
}

.content-text h1,
.content-text h2,
.content-text h3,
.content-text h4,
.content-text h5,
.content-text h6 {
  margin-top: 1.5em;
  margin-bottom: 1em;
  font-weight: 600;
  line-height: 1.25;
}

.content-text h1 {
  font-size: 2em;
}

.content-text h2 {
  font-size: 1.5em;
}

.content-text h3 {
  font-size: 1.25em;
}

.content-text p,
.content-text ul,
.content-text ol {
  margin-bottom: 1em;
}

.content-text ul,
.content-text ol {
  padding-left: 2em;
}

.content-text blockquote {
  padding: 0 1em;
  color: #666;
  border-left: 4px solid #ddd;
  margin: 0 0 1em;
}

.content-text pre {
  background-color: #f6f8fa;
  border-radius: 3px;
  padding: 16px;
  overflow: auto;
  line-height: 1.45;
  margin-bottom: 1em;
}

.content-text code {
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: monospace;
}

.content-text pre code {
  background-color: transparent;
  padding: 0;
}

.content-text img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
}

.content-text a {
  color: #0066cc;
  text-decoration: none;
}

.content-text a:hover {
  text-decoration: underline;
}

.content-text table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}

.content-text table th,
.content-text table td {
  border: 1px solid #ddd;
  padding: 6px 13px;
}

.content-text table tr {
  background-color: #fff;
  border-top: 1px solid #ddd;
}

.content-text table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.note-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #f0f0f0;
}

.action-left {
  display: flex;
  gap: 20px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.action-item:hover, .action-item.active {
  color: #ff2442;
}

.author-info {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
}

.author-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.publish-time {
  font-size: 14px;
  color: #999;
}

.el-button.follow-btn {
  padding: 8px 16px;
  border-radius: 4px;
}

.followed {
  color: #8a919f;
  background-color: #f4f5f7;
  border-color: #e4e7ed;
}

.comments-section {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.comment-count {
  font-size: 14px;
  color: #999;
  margin-left: 5px;
}

.comments-sort {
  display: flex;
  gap: 10px;
}

.sort-item {
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.sort-item.active {
  color: #ff2442;
}

.comment-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  background-color: #f9f9f9;
}

.comment-input {
  display: flex;
  gap: 10px;
  width: 100%;
}

.user-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.comment-textarea {
  flex: 1;
}

.comment-input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  margin-left: 50px;
  padding-right: 5px;
}

.action-icons {
  display: flex;
  gap: 15px;
}

.action-icon {
  font-size: 20px;
  color: #757575;
  cursor: pointer;
}

.action-icon:hover {
  color: #00aeec;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 15px;
}

.submit-btn {
  background-color: #00aeec;
  border-color: #00aeec;
  color: #fff;
  padding: 8px 24px;
}

.submit-btn:hover {
  background-color: #00a0d8;
  border-color: #00a0d8;
}

.submit-btn:disabled {
  background-color: #e5e5e5;
  border-color: #e5e5e5;
  color: #b3b3b3;
}

.comments-list {
  margin-top: 30px;
}

.comment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.comment-author {
  font-size: 14px;
  color: #333;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.comment-actions {
  display: flex;
  gap: 10px;
}

.comment-action-item {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.related-notes {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 20px;
  height: fit-content;
}

.related-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 20px;
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.related-item {
  display: flex;
  cursor: pointer;
  transition: transform 0.3s;
}

.related-item:hover {
  transform: translateY(-3px);
}

.related-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
  flex-shrink: 0;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.related-note-title {
  font-size: 14px;
  color: #333;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.related-author {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #999;
  margin: 0;
}

.interaction {
  padding: 0 20px 20px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media screen and (max-width: 768px) {
  .content-container {
    padding: 70px 10px 20px;
    grid-template-columns: 1fr;
  }
  
  .note-text {
    padding: 15px;
  }
  
  .note-title {
    font-size: 20px;
  }
  
  .note-body {
    font-size: 15px;
  }
  
  .note-actions {
    padding: 10px 15px;
  }
  
  .action-left {
    gap: 15px;
  }
  
  .author-info, .comments-section {
    padding: 15px;
  }
  
  .comments-title {
    font-size: 16px;
  }
  
  .related-title {
    font-size: 16px;
  }
}
</style> 