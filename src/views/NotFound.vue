<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <h1>404</h1>
      <h2>页面不存在</h2>
      <p>抱歉，您访问的页面不存在或已被删除。</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f6f6f6;
}

.not-found-container {
  text-align: center;
  padding: 40px;
}

h1 {
  font-size: 8rem;
  color: #ff2442;
  margin: 0;
  line-height: 1;
}

h2 {
  font-size: 2rem;
  color: #333;
  margin: 10px 0 20px;
}

p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 30px;
}

@media screen and (max-width: 768px) {
  h1 {
    font-size: 6rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}
</style> 