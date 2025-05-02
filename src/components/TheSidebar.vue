<template>
  <div class="left-sidebar">
    <div class="sidebar-item" :class="{ active: $route.path === '/home/recommend' }" @click="goToPage('/home/recommend')">
      <el-icon><HomeFilled /></el-icon>
      <span>发现</span>
    </div>
    <div class="sidebar-item" :class="{ active: $route.path === '/publish/note' }" @click="goToPage('/publish/note')">
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
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, Plus, ChatDotSquare, User } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 页面跳转方法
const goToPage = (path) => {
  router.push(path)
}
</script>

<style scoped>
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

@media screen and (max-width: 768px) {
  .left-sidebar {
    width: 60px;
  }
}
</style> 