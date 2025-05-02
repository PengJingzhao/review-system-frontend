<template>
  <header class="header">
    <div class="header-container">
      <!-- Logo -->
      <div class="logo">
        <router-link to="/">
          <img src="../assets/logo.png" alt="小红书" class="logo-img" />
        </router-link>
      </div>
      
      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索快乐内容更多小众内容"
          class="search-input"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
        />
      </div>
      
      <!-- 右侧导航 -->
      <div class="right-nav">
        <div class="nav-item">
          <router-link to="/creator">创作中心</router-link>
        </div>
        <div class="nav-item">
          <router-link to="/cooperation">业务合作</router-link>
        </div>
        
        <!-- 用户菜单 -->
        <el-dropdown v-if="userStore.isLoggedIn" @command="handleCommand">
          <div class="user-avatar">
            <el-avatar :src="userStore.avatar || defaultAvatar" :size="30" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon> 个人主页
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon> 设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <!-- 未登录状态 -->
        <div v-else class="login-buttons">
          <router-link to="/login">
            <el-button type="primary" size="small">登录</el-button>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import { Search, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 路由实例
const router = useRouter()

// 用户状态
const userStore = useUserStore()

// 搜索关键词
const searchKeyword = ref('')

// 搜索方法
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  // 跳转到搜索结果页面
  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value }
  })
}

// 用户菜单命令处理
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push(`/user/${userStore.userId}`)
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
}

.header-container {
  width: 1260px;  /* 1200px + 60px(左侧边栏宽度) */
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  flex: 0 0 auto;
  margin-right: 20px;
}

.logo-img {
  height: 32px;
  width: auto;
}

.search-box {
  flex: 1;
  max-width: 400px;
}

.search-input {
  border-radius: 20px;
}

.search-input :deep(.el-input__wrapper) {
  background-color: #f5f5f5;
  border-radius: 20px;
  border: none;
  box-shadow: none;
}

.search-input :deep(.el-input__inner) {
  color: #333;
}

.search-input :deep(.el-input__prefix-inner .el-icon) {
  color: #666;
}

.search-input:hover :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1) inset;
}

.right-nav {
  display: flex;
  align-items: center;
  gap: 20px;
  color: #333;
}

.nav-item a {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.nav-item a:hover {
  color: #ff2442;
}

.user-avatar {
  cursor: pointer;
}

.login-buttons {
  display: flex;
  gap: 10px;
}

.login-buttons .el-button--primary {
  background-color: #ff2442;
  border-color: #ff2442;
}

@media screen and (max-width: 768px) {
  .search-box {
    max-width: 200px;
    margin: 0 10px;
  }
  
  .right-nav {
    gap: 10px;
  }
}
</style> 