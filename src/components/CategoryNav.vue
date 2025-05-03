<template>
  <div class="category-nav">
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/home/recommend' }" 
      @click="goToPage('/home/recommend')"
    >推荐</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/home/following' }" 
      @click="goToPage('/home/following')"
    >关注</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/home/questionbank' }" 
      @click="goToPage('/home/questionbank')"
    >题库</div>
    <!-- <div 
      class="category-item" 
      :class="{ active: currentPath === '/food' }" 
      @click="goToPage('/food')"
    >美食</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/beauty' }" 
      @click="goToPage('/beauty')"
    >美妆</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/movie' }" 
      @click="goToPage('/movie')"
    >影视</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/career' }" 
      @click="goToPage('/career')"
    >职场</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/emotion' }" 
      @click="goToPage('/emotion')"
    >情感</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/home' }" 
      @click="goToPage('/home')"
    >家居</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/game' }" 
      @click="goToPage('/game')"
    >游戏</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/travel' }" 
      @click="goToPage('/travel')"
    >旅行</div>
    <div 
      class="category-item" 
      :class="{ active: currentPath === '/fitness' }" 
      @click="goToPage('/fitness')"
    >健身</div> -->
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

// 计算当前路径
const currentPath = computed(() => route.path)

// 页面跳转方法
const goToPage = (path) => {
  router.push(path)
}
</script>

<style scoped>
.category-nav {
  position: fixed;
  top: 60px;
  left: 60px;
  right: 0;
  height: 50px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  overflow-x: auto;
  white-space: nowrap;
  box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.1);
  width: calc(100% - 60px);
  z-index: 100;
}

.category-item {
  padding: 0 15px;
  height: 100%;
  display: flex;
  align-items: center;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.category-item:hover {
  color: #ff2442;
}

.category-item.active {
  color: #ff2442;
  font-weight: 500;
}
</style> 