<template>
  <div class="question-detail" v-loading="loading">
    <div v-if="!loading && question" class="content-wrapper">
      <!-- 左侧主内容区 -->
      <div class="main-content">
        <div class="question-container">
          <!-- 导航按钮 -->
          <div class="navigation-buttons">
            <el-button 
              type="primary" 
              plain 
              :disabled="!prevQuestionId" 
              @click="navigateToQuestion(prevQuestionId)"
            >
              <el-icon><ArrowLeft /></el-icon> 上一题
            </el-button>
            
            <el-button 
              type="primary" 
              @click="backToList"
            >
              返回列表
            </el-button>
            
            <el-button 
              type="primary" 
              plain 
              :disabled="!nextQuestionId" 
              @click="navigateToQuestion(nextQuestionId)"
            >
              下一题 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>

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

          <!-- 讲解视频 -->
          <div v-if="question.video" class="video-section">
            <div class="section-title">讲解视频</div>
            <div v-if="videoUrl" class="video-container">
              <video :src="videoUrl" controls class="tutorial-video"></video>
            </div>
            <div v-else class="video-loading">
              <el-skeleton animated :rows="3" />
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
      </div>
      
      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 题目导航 -->
        <div class="sidebar-panel" v-if="questions.length > 0">
          <div class="panel">
            <div class="panel-header">
              <span class="panel-title">题目导航</span>
            </div>
            <div class="panel-body">
              <el-scrollbar height="300px">
                <div 
                  v-for="(q, index) in questions" 
                  :key="q.id" 
                  class="question-nav-item" 
                  :class="{ active: q.id === parseInt(id) }"
                  @click="navigateToQuestion(q.id)"
                >
                  <span class="question-index">{{ index + 1 }}</span>
                  <span class="question-title-nav">{{ q.title }}</span>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
        
        <!-- 推荐题目列表 -->
        <div class="sidebar-panel">
          <RecommendQuestions 
            @questionClick="handleRecommendClick"
            :tagId="tagId"
          />
        </div>
      </div>
    </div>
    <el-empty v-else-if="!loading && !question" description="题目不存在"></el-empty>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noteApi from '@/api/note'
import { request } from '@/api/index'
import { ElMessage } from 'element-plus'
import { View, Star, Coin, Comment, ArrowRight, ArrowLeft } from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import RecommendQuestions from '@/components/RecommendQuestions.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const question = ref(null)
const commentContent = ref('')
const showAnswer = ref(false)
const previewTheme = 'github'
const id = ref(route.params.id)
const tagId = ref(route.query.tagId)
const nextQuestionId = ref(null)
const prevQuestionId = ref(null)
const questions = ref([])
const videoUrl = ref('') // 存储视频播放URL

// 难度等级颜色
const difficultyColors = ['#99A9BF', '#F7BA2A', '#FF9900', '#FA6400', '#FF0000']

// 监听路由变化
watch(
  () => route.params.id,
  (newId) => {
    id.value = newId
    fetchQuestionDetail()
  }
)

watch(
  () => route.query.tagId,
  (newTagId) => {
    tagId.value = newTagId
    if (newTagId) {
      fetchTagQuestions()
    }
  }
)

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

// 获取视频URL
const fetchVideoUrl = async (objectName) => {
  if (!objectName) return
  
  try {
    const url = await request.get('/file/getReviewUrl', {
      params: { objectName }
    })
    
    if (url) {
      videoUrl.value = url
    } else {
      console.error('获取视频URL失败，返回为空')
    }
  } catch (error) {
    console.error('获取视频URL失败:', error)
  }
}

// 获取题目详情
const fetchQuestionDetail = async () => {
  loading.value = true
  videoUrl.value = '' // 重置视频URL
  
  try {
    const data = await noteApi.getQuestionDetail(id.value)
    question.value = data
    
    // 如果有视频，获取视频URL
    if (data && data.video) {
      fetchVideoUrl(data.video)
    }
    
    // 获取上一题和下一题的ID
    if (tagId.value) {
      fetchNextQuestion()
      fetchPrevQuestion()
    }
  } catch (error) {
    console.error('获取题目详情失败:', error)
    ElMessage.error('获取题目详情失败')
  } finally {
    loading.value = false
  }
}

// 获取该标签下所有题目列表（用于导航）
const fetchTagQuestions = async () => {
  if (!tagId.value) return
  
  try {
    // 获取标签下所有题目，设置较大的size以获取全部
    const res = await noteApi.getQuestionsByTag(tagId.value, 1, 100)
    if (res && res.records) {
      questions.value = res.records
    }
  } catch (error) {
    console.error('获取标签题目列表失败:', error)
  }
}

// 获取下一题
const fetchNextQuestion = async () => {
  try {
    const res = await noteApi.getNextQuestion(id.value, tagId.value)
    nextQuestionId.value = res ? res: null
  } catch (error) {
    console.error('获取下一题失败:', error)
    nextQuestionId.value = null
  }
}

// 获取上一题
const fetchPrevQuestion = async () => {
  try {
    const res = await noteApi.getPrevQuestion(id.value, tagId.value)
    prevQuestionId.value = res ? res: null
  } catch (error) {
    console.error('获取上一题失败:', error)
    prevQuestionId.value = null
  }
}

// 导航到指定题目
const navigateToQuestion = (questionId) => {
  if (!questionId) return
  
  router.push({
    path: `/question/${questionId}`,
    query: { tagId: tagId.value }
  })
}

// 返回题目列表
const backToList = () => {
  if (tagId.value) {
    router.push('/home/questionbank')
  } else {
    router.go(-1)
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

// 处理推荐题目点击
const handleRecommendClick = (questionId) => {
  router.push({
    path: `/question/${questionId}`,
    query: { tagId: tagId.value }
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchQuestionDetail()
  if (tagId.value) {
    fetchTagQuestions()
  }
})
</script>

<style scoped>
.question-detail {
  padding: 20px;
}

/* 主体两栏布局 */
.content-wrapper {
  display: flex;
  gap: 20px;
}

.main-content {
  flex: 1;
  padding-top: 0;
}

.sidebar {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  align-self: flex-start;
}

.sidebar-panel {
  margin-bottom: 20px;
}

.question-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 统一面板样式 */
.panel {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-header {
  height: 56px;
  padding: 0 15px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.panel-body {
  padding: 15px;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
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

.video-section {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
}

.video-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.tutorial-video {
  width: 100%;
  max-width: 720px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.video-loading {
  padding: 40px 0;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
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
  margin-left: auto;
}

.answer {
  margin-top: 16px;
}

.answer-hidden {
  padding: 40px 0;
  text-align: center;
}

.question-nav-item {
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.3s;
  border-bottom: 1px solid #ebeef5;
}

.question-nav-item:last-child {
  border-bottom: none;
}

.question-nav-item:hover {
  background-color: #e6f1fc;
}

.question-nav-item.active {
  background-color: #ecf5ff;
  color: #409EFF;
  font-weight: bold;
}

.question-index {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 50%;
  background-color: #909399;
  color: white;
  margin-right: 10px;
  font-size: 12px;
}

.question-nav-item.active .question-index {
  background-color: #409EFF;
}

.question-title-nav {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats {
  display: flex;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
}

.comments {
  padding: 20px;
}

.comment-list {
  margin-bottom: 20px;
}

.comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #909399;
}

.comment-content {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
}

.add-comment {
  margin-top: 20px;
}

.add-comment .el-button {
  margin-top: 12px;
}

/* 添加底部填充，防止滚动时内容被裁剪 */
.el-scrollbar__view::after {
  content: "";
  height: 8px;
  display: block;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    margin-top: 20px;
  }
}
</style> 