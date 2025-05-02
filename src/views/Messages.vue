<template>
  <div class="messages-page">
    <TheHeader />
    
    <div class="main-content">
      <!-- 左侧导航栏 -->
      <div class="left-sidebar">
        <div class="sidebar-item" :class="{ active: $route.path === '/' }" @click="goToPage('/')">
          <el-icon><HomeFilled /></el-icon>
          <span>发现</span>
        </div>
        <div class="sidebar-item" :class="{ active: $route.path === '/publish' }" @click="goToPage('/publish')">
          <el-icon><Plus /></el-icon>
          <span>发布</span>
        </div>
        <div class="sidebar-item" :class="{ active: $route.path === '/messages' }" @click="goToPage('/messages')">
          <el-icon><ChatDotSquare /></el-icon>
          <span>消息</span>
        </div>
        <div class="sidebar-item" :class="{ active: $route.path === '/profile' }" @click="goToPage('/profile')">
          <el-icon><User /></el-icon>
          <span>我</span>
        </div>
      </div>

      <!-- 消息内容区域 -->
      <div class="messages-container">
        <div class="messages-header">
          <h2>消息</h2>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="评论" name="comments">
              <div class="message-list">
                <div v-for="(message, index) in commentMessages" :key="index" class="message-item">
                  <el-avatar :src="message.avatar" :size="40" />
                  <div class="message-content">
                    <div class="message-info">
                      <span class="username">{{ message.username }}</span>
                      <span class="time">{{ message.time }}</span>
                    </div>
                    <div class="message-text">{{ message.content }}</div>
                    <div class="message-source">
                      来自: {{ message.source }}
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="点赞" name="likes">
              <div class="message-list">
                <div v-for="(message, index) in likeMessages" :key="index" class="message-item">
                  <el-avatar :src="message.avatar" :size="40" />
                  <div class="message-content">
                    <div class="message-info">
                      <span class="username">{{ message.username }}</span>
                      <span class="time">{{ message.time }}</span>
                    </div>
                    <div class="message-text">赞了你的笔记</div>
                    <div class="message-source">
                      来自: {{ message.source }}
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="关注" name="follows">
              <div class="message-list">
                <div v-for="(message, index) in followMessages" :key="index" class="message-item">
                  <el-avatar :src="message.avatar" :size="40" />
                  <div class="message-content">
                    <div class="message-info">
                      <span class="username">{{ message.username }}</span>
                      <span class="time">{{ message.time }}</span>
                    </div>
                    <div class="message-text">关注了你</div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TheHeader from '../components/TheHeader.vue'
import { HomeFilled, Plus, ChatDotSquare, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 当前激活的标签页
const activeTab = ref('comments')

// 页面跳转方法
const goToPage = (path) => {
  router.push(path)
}

// 模拟消息数据
const commentMessages = ref([
  {
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    username: '用户1',
    time: '10分钟前',
    content: '这个笔记写得真好！',
    source: '《如何学习Vue3》'
  },
  {
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    username: '用户2',
    time: '1小时前',
    content: '感谢分享！',
    source: '《我的旅行日记》'
  }
])

const likeMessages = ref([
  {
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    username: '用户3',
    time: '2小时前',
    source: '《美食探店》'
  }
])

const followMessages = ref([
  {
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    username: '用户4',
    time: '昨天'
  }
])
</script>

<style scoped>
.messages-page {
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

.messages-container {
  flex: 1;
  margin-left: 60px;
  padding: 20px;
  width: calc(100% - 60px);
  min-height: calc(100vh - 60px);
  position: relative;
}

.messages-header {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.messages-header h2 {
  margin-bottom: 20px;
  color: #333;
}

.message-list {
  margin-top: 20px;
}

.message-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.message-item:last-child {
  border-bottom: none;
}

.message-content {
  flex: 1;
  margin-left: 15px;
}

.message-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.username {
  font-weight: 500;
  color: #333;
}

.time {
  font-size: 12px;
  color: #999;
}

.message-text {
  color: #666;
  margin-bottom: 8px;
}

.message-source {
  font-size: 12px;
  color: #999;
}
</style> 