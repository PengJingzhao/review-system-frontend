<template>
  <div class="publish-page">
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

      <!-- 发布内容区域 -->
      <div class="publish-container">
        <div class="publish-form">
          <h2>发布笔记</h2>
          <el-form :model="form" label-width="80px">
            <el-form-item label="标题">
              <el-input v-model="form.title" placeholder="请输入标题" />
            </el-form-item>
            
            <el-form-item label="内容">
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="6"
                placeholder="分享你的想法..."
              />
            </el-form-item>
            
            <el-form-item label="图片">
              <el-upload
                class="upload-demo"
                action="/api/upload"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                multiple
                :limit="9"
                :on-exceed="handleExceed"
                :file-list="fileList"
              >
                <el-button type="primary">点击上传</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    最多上传9张图片
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitForm">发布</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
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
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

// 表单数据
const form = ref({
  title: '',
  content: ''
})

// 上传文件列表
const fileList = ref([])

// 页面跳转方法
const goToPage = (path) => {
  router.push(path)
}

// 上传相关方法
const handleRemove = (file, fileList) => {
  console.log(file, fileList)
}

const handlePreview = (file) => {
  console.log(file)
}

const handleExceed = (files, uploadFiles) => {
  ElMessage.warning(`最多上传9张图片`)
}

const beforeRemove = (file) => {
  return ElMessageBox.confirm(`确定移除 ${file.name}？`)
}

// 表单提交
const submitForm = () => {
  // TODO: 实现发布逻辑
  ElMessage.success('发布成功')
  router.push('/')
}

// 重置表单
const resetForm = () => {
  form.value = {
    title: '',
    content: ''
  }
  fileList.value = []
}
</script>

<style scoped>
.publish-page {
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

.publish-container {
  flex: 1;
  margin-left: 60px;
  padding: 20px;
  width: calc(100% - 60px);
  min-height: calc(100vh - 60px);
  position: relative;
}

.publish-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.publish-form h2 {
  margin-bottom: 20px;
  color: #333;
}

.upload-demo {
  width: 100%;
}

.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 8px;
}
</style> 