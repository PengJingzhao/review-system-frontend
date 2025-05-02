<template>
  <div class="question-detail" v-loading="loading">
    <div v-if="!loading && question" class="question-container">
      <div class="question-header">
        <h2 class="title">{{ question.title }}</h2>
        <div class="meta">
          <div class="tags">
            <el-tag
              v-for="tag in question.tags"
              :key="tag"
              size="small"
              type="success"
              class="tag"
            >{{ tag }}</el-tag>
          </div>
          <div class="info">
            <span class="difficulty">
              <el-tooltip content="难度等级">
                <el-rate 
                  v-model="question.difficulty" 
                  disabled 
                  :colors="difficultyColors"
                  class="rating"
                ></el-rate>
              </el-tooltip>
            </span>
            <span class="appear-rate">出现频率: {{ formatRate(question.appearRate) }}</span>
            <span class="source">来源: {{ question.source }}</span>
            <span class="create-time">发布时间: {{ formatDate(question.createTime) }}</span>
          </div>
        </div>
      </div>

      <div class="question-content">
        <div class="section-title">
          题目答案
          <el-button
            size="small"
            type="primary"
            @click="toggleAnswer"
            class="toggle-btn"
          >
            {{ showAnswer ? '隐藏答案' : '查看答案' }}
          </el-button>
        </div>
        <div v-if="showAnswer" class="answer">
          <MdPreview :modelValue="question.answer" :theme="previewTheme" codeTheme="atom" />
        </div>
        <div v-else class="answer-hidden">
          <el-empty description="答案已隐藏，点击上方按钮查看" :image-size="80"></el-empty>
        </div>
      </div>

      <div class="stats">
        <div class="stat-item">
          <el-tooltip content="浏览次数" placement="top">
            <el-icon><View /></el-icon>
          </el-tooltip>
          <span>{{ question.viewCount }}</span>
        </div>
        <div class="stat-item">
          <el-tooltip content="收藏数" placement="top">
            <el-icon><Star /></el-icon>
          </el-tooltip>
          <span>{{ question.favoriteCount }}</span>
        </div>
        <div class="stat-item">
          <el-tooltip content="点赞数" placement="top">
            <el-icon><Coin /></el-icon>
          </el-tooltip>
          <span>{{ question.likeCount }}</span>
        </div>
        <div class="stat-item">
          <el-tooltip content="评论数" placement="top">
            <el-icon><Comment /></el-icon>
          </el-tooltip>
          <span>{{ question.commentCount }}</span>
        </div>
      </div>

      <div class="comments">
        <div class="section-title">评论 ({{ question.commentCount }})</div>
        <div v-if="question.comments && question.comments.length > 0" class="comment-list">
          <div v-for="comment in question.comments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span class="user-id">用户 {{ comment.userId }}</span>
              <span class="time">{{ formatDate(comment.createTime) }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
          </div>
        </div>
        <el-empty v-else description="暂无评论"></el-empty>

        <div class="add-comment">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="添加评论..."
          ></el-input>
          <el-button type="primary" @click="submitComment">发布评论</el-button>
        </div>
      </div>
    </div>
    <el-empty v-else-if="!loading && !question" description="题目不存在"></el-empty>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noteApi from '@/api/note'
import { ElMessage } from 'element-plus'
import { View, Star, Coin, Comment } from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const question = ref(null)
const commentContent = ref('')
const showAnswer = ref(false)
const previewTheme = 'github'

// 难度等级颜色
const difficultyColors = ['#99A9BF', '#F7BA2A', '#FF9900', '#FA6400', '#FF0000']

// 格式化频率显示
const formatRate = (val) => {
  return `${Math.round(val * 100)}%`
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 切换答案显示/隐藏
const toggleAnswer = () => {
  showAnswer.value = !showAnswer.value
}

// 获取题目详情
const fetchQuestionDetail = async () => {
  loading.value = true
  const questionId = route.params.id
  
  try {
    const data = await noteApi.getQuestionDetail(questionId)
    question.value = data
  } catch (error) {
    console.error('获取题目详情失败:', error)
    ElMessage.error('获取题目详情失败')
  } finally {
    loading.value = false
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  
  try {
    // 这里需要添加评论API，目前没有提供
    ElMessage.success('评论成功')
    commentContent.value = ''
    // 重新加载详情以获取最新评论
    fetchQuestionDetail()
  } catch (error) {
    console.error('评论失败:', error)
    ElMessage.error('评论失败，请稍后再试')
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchQuestionDetail()
})
</script>

<style scoped>
.question-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.question-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.question-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.title {
  margin: 0 0 16px;
  font-size: 22px;
  color: #303133;
  line-height: 1.4;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #606266;
}

.rating {
  font-size: 14px;
}

.question-content {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-btn {
  font-size: 12px;
  padding: 4px 10px;
}

.answer {
  background-color: #f8f8f8;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.answer :deep(.md-preview-wrapper) {
  padding: 0 !important;
  background-color: transparent !important;
}

.answer-hidden {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 15px;
}

.stats {
  display: flex;
  padding: 12px 20px;
  border-bottom: 1px solid #ebeef5;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #606266;
  font-size: 14px;
}

.comments {
  padding: 20px;
}

.comment-list {
  margin-bottom: 24px;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #909399;
}

.comment-content {
  font-size: 15px;
  line-height: 1.6;
  color: #303133;
}

.add-comment {
  margin-top: 20px;
}

.add-comment .el-button {
  margin-top: 12px;
}
</style> 