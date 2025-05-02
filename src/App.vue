<template>
  <div class="app">
    <TheHeader />
    <TheSidebar />
    <CategoryNav v-if="$route.meta.showCategoryNav" />
    <main class="main-content" :class="{ 'has-category-nav': $route.meta.showCategoryNav }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import TheHeader from '@/components/TheHeader.vue'
import TheSidebar from '@/components/TheSidebar.vue'
import CategoryNav from '@/components/CategoryNav.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Helvetica Neue', Helvetica, 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  color: #333;
}

.app {
  min-height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

/* 主内容区域 */
.main-content {
  margin-left: 60px;
  padding-top: 60px;
  min-height: calc(100vh - 60px);
  position: relative;
  z-index: 1;
}

/* 有分类导航时的样式 */
.main-content.has-category-nav {
  padding-top: 110px;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 通用样式类 */
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .page-container {
    padding: 10px;
  }
}
</style> 