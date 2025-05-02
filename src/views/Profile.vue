<template>
  <div class="profile-page">
    <TheHeader />
    
    <div class="main-content">
      <!-- 左侧导航栏 -->
      <div class="left-sidebar">
        <div class="sidebar-item" :class="{ active: currentPath === '/home/recommend' }" @click="goToPage('/home/recommend')">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </div>
        <div class="sidebar-item" :class="{ active: currentPath === '/publishNote' }" @click="goToPage('/publishNote')">
          <el-icon><Plus /></el-icon>
          <span>发布</span>
        </div>
        <div class="sidebar-item" :class="{ active: currentPath === '/messages' }" @click="goToPage('/messages')">
          <el-icon><ChatDotSquare /></el-icon>
          <span>消息</span>
        </div>
        <div class="sidebar-item" :class="{ active: currentPath === '/profile' }" @click="goToPage('/profile')">
          <el-icon><User /></el-icon>
          <span>我的</span>
        </div>
      </div>

      <!-- 个人主页内容区域 -->
      <div class="profile-container">
        <!-- 用户信息卡片 -->
        <div class="profile-card">
          <div class="profile-header">
            <el-avatar :src="userInfo.avatar" :size="80" />
            <div class="profile-info">
              <h2>{{ userInfo.name }}</h2>
              <p class="bio">{{ userInfo.bio }}</p>
              <div class="stats">
                <div class="stat-item">
                  <span class="count">{{ userInfo.attentionCount || 0 }}</span>
                  <span class="label">关注</span>
                </div>
                <div class="stat-item">
                  <span class="count">{{ userInfo.followerCount || 0 }}</span>
                  <span class="label">粉丝</span>
                </div>
                <div class="stat-item">
                  <span class="count">{{ userInfo.likeCount || 0 }}</span>
                  <span class="label">获赞</span>
                </div>
              </div>
            </div>
            <el-button type="primary" class="edit-btn">编辑资料</el-button>
          </div>
        </div>

        <!-- 用户笔记列表 -->
        <div class="notes-section">
          <el-tabs v-model="activeTab" @tab-click="handleTabChange">
            <el-tab-pane label="我的笔记" name="notes">
              <div v-loading="activeTab === 'notes' && isLoading">
                <div v-if="userNotes.length > 0">
                  <div class="notes-list">
                    <div v-for="(note, index) in userNotes" :key="index" class="note-item">
                      <NoteCard :note="note" />
                    </div>
                  </div>
                  
                  <!-- 加载更多 -->
                  <div class="load-more" v-if="hasMoreNotes && !isLoadingMore">
                    <el-button type="primary" plain @click="loadMore">加载更多</el-button>
                  </div>
                  <div class="loading-more" v-if="isLoadingMore">
                    <el-spinner />
                    <span>加载中...</span>
                  </div>
                </div>
                <el-empty v-else description="暂无笔记">
                  <el-button type="primary" @click="goToPage('/publishNote')">发布笔记</el-button>
                </el-empty>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="收藏" name="favorites">
              <div v-loading="activeTab === 'favorites' && isLoading">
                <div v-if="favoriteNotes.length > 0">
                  <div class="notes-list">
                    <div v-for="(note, index) in favoriteNotes" :key="index" class="note-item">
                      <NoteCard :note="note" />
                    </div>
                  </div>
                  
                  <!-- 加载更多 -->
                  <div class="load-more" v-if="hasMoreNotes && !isLoadingMore">
                    <el-button type="primary" plain @click="loadMore">加载更多</el-button>
                  </div>
                </div>
                <el-empty v-else description="暂无收藏" />
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="喜欢" name="likes">
              <div v-loading="activeTab === 'likes' && isLoading">
                <div v-if="likedNotes.length > 0">
                  <div class="notes-list">
                    <div v-for="(note, index) in likedNotes" :key="index" class="note-item">
                      <NoteCard :note="note" />
                    </div>
                  </div>
                  
                  <!-- 加载更多 -->
                  <div class="load-more" v-if="hasMoreNotes && !isLoadingMore">
                    <el-button type="primary" plain @click="loadMore">加载更多</el-button>
                  </div>
                </div>
                <el-empty v-else description="暂无喜欢的内容" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TheHeader from '../components/TheHeader.vue'
import NoteCard from '../components/NoteCard.vue'
import { HomeFilled, Plus, ChatDotSquare, User } from '@element-plus/icons-vue'
import { request } from '../api/index'
import { ElMessage } from 'element-plus'
import noteApi from '../api/note'
import userApi from '../api/user'

const router = useRouter()
const route = useRoute()

// 计算当前路径
const currentPath = computed(() => route.path)

// 当前激活的标签页
const activeTab = ref('notes')

// 页面跳转方法
const goToPage = (path) => {
  router.push(path)
}

// 用户信息
const userInfo = ref({
  name: '',
  attentionCount: 0,
  followerCount: 0,
  likeCount: 0,
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  bio: '这个人很懒，什么都没写~'
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await userApi.getUserInfo()
    if (res) {
      userInfo.value = {
        ...userInfo.value,
        name: res.name,
        attentionCount: res.attentionCount,
        followerCount: res.followerCount,
        likeCount: res.likeCount,
        bio: res.bio || userInfo.value.bio,
        avatar: res.avatar || userInfo.value.avatar
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 页面加载状态
const isLoading = ref(false)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const hasMoreNotes = ref(true)

// 用户笔记、收藏、喜欢列表
const userNotes = ref([])
const favoriteNotes = ref([])
const likedNotes = ref([])

// 获取用户笔记
const fetchUserNotes = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await noteApi.getUserNotes(null, page)
    if (res) {
      if (page === 1) {
        userNotes.value = res.records || []
      } else {
        userNotes.value = [...userNotes.value, ...(res.records || [])]
      }
      hasMoreNotes.value = res.total > (res.current * res.size)
      currentPage.value = res.current
    }
  } catch (error) {
    console.error('获取用户笔记失败:', error)
    ElMessage.error('获取笔记失败')
  } finally {
    isLoading.value = false
  }
}

// 获取用户收藏
const fetchUserCollections = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await noteApi.getUserCollections(localStorage.getItem('userId'), page)
    if (res) {
      if (page === 1) {
        favoriteNotes.value = res.list || []
      } else {
        favoriteNotes.value = [...favoriteNotes.value, ...(res.list || [])]
      }
    }
  } catch (error) {
    console.error('获取收藏失败:', error)
    ElMessage.error('获取收藏失败')
  } finally {
    isLoading.value = false
  }
}

// 获取用户喜欢的笔记
const fetchUserLikes = async (page = 1) => {
  isLoading.value = true
  try {
    const res = await noteApi.getUserLikes(localStorage.getItem('userId'), page)
    if (res) {
      if (page === 1) {
        likedNotes.value = res.list || []
      } else {
        likedNotes.value = [...likedNotes.value, ...(res.list || [])]
      }
    }
  } catch (error) {
    console.error('获取喜欢失败:', error)
    ElMessage.error('获取喜欢失败')
  } finally {
    isLoading.value = false
  }
}

// 处理标签切换
const handleTabChange = (tab) => {
  activeTab.value = tab.paneName
}

// 加载更多
const loadMore = async () => {
  if (isLoadingMore.value) return
  
  isLoadingMore.value = true
  currentPage.value++
  
  try {
    if (activeTab.value === 'notes') {
      await fetchUserNotes(currentPage.value)
    } else if (activeTab.value === 'favorites') {
      await fetchUserCollections(currentPage.value)
    } else if (activeTab.value === 'likes') {
      await fetchUserLikes(currentPage.value)
    }
  } catch (error) {
    console.error('加载更多失败', error)
  } finally {
    isLoadingMore.value = false
  }
}

onMounted(async () => {
  await fetchUserInfo()
  await fetchUserNotes()
  await fetchUserCollections()
  await fetchUserLikes()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #fff;
}

.main-content {
  display: flex;
  padding-top: 60px;
  min-height: calc(100vh - 60px);
  position: relative;
}

.left-sidebar {
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: 60px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  box-shadow: 1px 0 0 0 rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.sidebar-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  color: #333;
  transition: all 0.3s;
}

.sidebar-item:hover {
  background-color: #f5f5f5;
}

.sidebar-item.active {
  color: #ff2442;
}

.sidebar-item i {
  font-size: 20px;
  margin-bottom: 4px;
}

.sidebar-item span {
  font-size: 12px;
}

.profile-container {
  flex: 1;
  margin-left: 60px;
  padding: 20px;
  width: calc(100% - 60px);
  min-height: calc(100vh - 60px);
  position: relative;
}

.profile-card {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.profile-info {
  flex: 1;
}

.profile-info h2 {
  margin: 0 0 10px;
  color: #333;
}

.bio {
  color: #666;
  margin-bottom: 15px;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.count {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.label {
  font-size: 12px;
  color: #999;
}

.edit-btn {
  margin-left: 20px;
}

.notes-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.notes-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-gap: 20px;
  margin-top: 20px;
}

.note-item {
  break-inside: avoid;
  width: 100%;
}

.load-more, .loading-more {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.loading-more {
  align-items: center;
  color: #999;
}

.loading-more span {
  margin-left: 10px;
}
</style> 