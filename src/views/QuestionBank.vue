<template>
  <div class="question-bank">
    <div class="question-header">
      <h2>题库</h2>
      <el-button type="primary" @click="showCreateDialog = true">发布题目</el-button>
    </div>

    <!-- 筛选表单 -->
    <div class="filter-form">
      <el-form :model="queryParams" inline>
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="搜索题目标题和答案" clearable></el-input>
        </el-form-item>
        
        <el-form-item label="难度等级">
          <el-select v-model="queryParams.difficulty" placeholder="选择难度" clearable>
            <el-option label="入门级" :value="1"></el-option>
            <el-option label="简单" :value="2"></el-option>
            <el-option label="中等" :value="3"></el-option>
            <el-option label="困难" :value="4"></el-option>
            <el-option label="专家级" :value="5"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-select 
            v-model="queryParams.tags" 
            multiple 
            placeholder="选择标签"
            filterable
            collapse-tags
            clearable
          >
            <el-option
              v-for="tag in commonTags"
              :key="tag"
              :label="tag"
              :value="tag"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 题目列表 -->
    <div v-if="loading">
      <el-skeleton :rows="3" animated />
    </div>
    <div v-else-if="questions.length === 0">
      <el-empty description="暂无符合条件的题目" />
    </div>
    <div v-else>
      <div class="question-list">
        <div v-for="question in questions" :key="question.id" class="question-item">
          <div class="question-title">
            <h3>
              <router-link :to="`/question/${question.id}`" class="title-link">
                {{ question.title }}
              </router-link>
            </h3>
            <div class="question-meta">
              <el-tag size="small" type="success" v-for="tag in question.tags" :key="tag" class="tag">{{ tag }}</el-tag>
              <el-rate 
                v-model="question.difficulty" 
                disabled 
                :colors="difficultyColors"
                class="difficulty"
              ></el-rate>
              <span class="appear-rate">出现频率: {{ formatRate(question.appearRate) }}</span>
              <span class="source">来源: {{ question.source }}</span>
            </div>
          </div>
          <div class="question-stats">
            <span class="stat-item">
              <el-tooltip content="浏览次数" placement="top">
                <el-icon><View /></el-icon>
              </el-tooltip>
              <span>{{ question.viewCount }}</span>
            </span>
            <span class="stat-item">
              <el-tooltip content="收藏数" placement="top">
                <el-icon><Star /></el-icon>
              </el-tooltip>
              <span>{{ question.favoriteCount }}</span>
            </span>
            <span class="stat-item">
              <el-tooltip content="点赞数" placement="top">
                <el-icon><Coin /></el-icon>
              </el-tooltip>
              <span>{{ question.likeCount }}</span>
            </span>
            <span class="stat-item">
              <el-tooltip content="评论数" placement="top">
                <el-icon><Comment /></el-icon>
              </el-tooltip>
              <span>{{ question.commentCount }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :current-page="queryParams.page"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        >
        </el-pagination>
      </div>
    </div>

    <!-- 发布题目弹窗 -->
    <el-dialog
      v-model="showCreateDialog"
      title="发布新题目"
      width="60%"
      :before-close="handleCloseDialog"
    >
      <QuestionForm @success="handleCreateSuccess" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted} from 'vue'
import NoteList from '@/components/NoteList.vue'
import QuestionForm from '@/components/QuestionForm.vue'
import noteApi from '@/api/note'
import { ElMessage } from 'element-plus'
import { View, Star, Coin, Comment } from '@element-plus/icons-vue'

// 题库数据
const questions = ref([])
const loading = ref(true)
const showCreateDialog = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  difficulty: undefined,
  keyword: '',
  tags: []
})

// 常用标签
const commonTags = [
  '前端', '后端', '微服务', '架构', '设计', 'JavaScript', 'Vue', 'React', 'Node.js',
  'Java', 'Spring', 'Python', 'Go', '数据库', 'MySQL', 'MongoDB', 'Redis', '算法', '网络', 'Http'
]

// 难度等级颜色
const difficultyColors = ['#99A9BF', '#F7BA2A', '#FF9900', '#FA6400', '#FF0000']

// 格式化频率显示
const formatRate = (val) => {
  return `${Math.round(val * 100)}%`
}

// 获取题库列表 - 改为使用分页查询API
const fetchQuestionList = async () => {
  loading.value = true
  try {
    // 使用分页查询API
    const res = await noteApi.pageQuestionList(queryParams)
    if (res && res.records) {
      questions.value = res.records
      total.value = res.total
    } else {
      questions.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取题库内容失败:', error)
    ElMessage.error('获取题库内容失败')
    questions.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理查询
const handleQuery = () => {
  queryParams.page = 1
  fetchQuestionList()
}

// 重置查询条件
const resetQuery = () => {
  queryParams.page = 1
  queryParams.keyword = ''
  queryParams.difficulty = undefined
  queryParams.tags = []
  fetchQuestionList()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  queryParams.page = page
  fetchQuestionList()
}

// 处理每页条数变化
const handleSizeChange = (size) => {
  queryParams.size = size
  queryParams.page = 1
  fetchQuestionList()
}

// 关闭弹窗
const handleCloseDialog = () => {
  showCreateDialog.value = false
}

// 创建成功处理
const handleCreateSuccess = (newQuestion) => {
  ElMessage.success('题目发布成功')
  showCreateDialog.value = false
  // 重新获取题库列表或者直接添加到现有列表
  queryParams.page = 1 // 返回第一页
  fetchQuestionList()
}

// 页面加载时获取数据
onMounted(() => {
  fetchQuestionList()
})
</script>

<style scoped>
.question-bank {
  min-height: calc(100vh - 120px);
  padding: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.question-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.filter-form {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.question-list {
  margin-bottom: 20px;
}

.question-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.question-title {
  margin-bottom: 12px;
}

.question-title h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.title-link {
  color: #303133;
  text-decoration: none;
  transition: color 0.3s;
}

.title-link:hover {
  color: #409EFF;
}

.question-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 13px;
  color: #606266;
}

.tag {
  margin-right: 5px;
}

.difficulty {
  font-size: 14px;
}

.appear-rate, .source {
  margin-left: 10px;
  font-size: 13px;
  color: #606266;
}

.question-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.3s;
}

.stat-item:hover {
  color: #409EFF;
}

.stat-item .el-icon {
  font-size: 16px;
}

.pagination-container {
  text-align: center;
  margin-top: 30px;
}
</style> 