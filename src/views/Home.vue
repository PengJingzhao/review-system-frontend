<template>
  <div class="home">
    <TheHeader />
    <CategoryNav />
    <div class="content-container">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TheHeader from '@/components/TheHeader.vue'
import CategoryNav from '@/components/CategoryNav.vue'

// // 模拟数据
// const notes = ref([
//   {
//     id: 1,
//     title: '如何快速学会Vue3',
//     description: '分享一些学习Vue3的经验和技巧，包括组合式API、响应式系统等核心概念...',
//     cover: 'https://picsum.photos/300/200',
//     avatar: 'https://picsum.photos/50/50',
//     author: '张三',
//     likes: 1234,
//     comments: 56
//   },
//   {
//     id: 2,
//     title: '2024年最值得入手的数码产品',
//     description: '盘点2024年最值得入手的数码产品，包括手机、电脑、耳机等...',
//     cover: 'https://picsum.photos/300/201',
//     avatar: 'https://picsum.photos/50/51',
//     author: '李四',
//     likes: 2345,
//     comments: 78
//   },
//   {
//     id: 3,
//     title: '周末美食探店分享',
//     description: '分享几家最近发现的美食店，环境优雅，菜品精致，价格实惠...',
//     cover: 'https://picsum.photos/300/202',
//     avatar: 'https://picsum.photos/50/52',
//     author: '王五',
//     likes: 3456,
//     comments: 89
//   }
// ])
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content-container {
  padding-top: 120px; /* 为顶部导航栏和分类导航栏留出空间 */
  padding-left: 20px;
  padding-right: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style> 