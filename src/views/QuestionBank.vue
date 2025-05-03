<template>
  <div class="question-bank">
    <div class="question-header">
      <h2>题库</h2>
      <el-button type="primary" @click="showCreateDialog = true">发布题目</el-button>
    </div>

    <!-- 标签列表视图 -->
    <div v-if="!selectedTag" class="tags-container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>标签分类</span>
            <el-input
              v-model="tagSearch"
              placeholder="搜索标签"
              clearable
              prefix-icon="Search"
              style="width: 200px"
            ></el-input>
          </div>
        </template>
        <div v-if="tagsLoading">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else-if="filteredTags.length === 0">
          <el-empty description="暂无标签" />
        </div>
        <div v-else class="tag-list">
          <el-card 
            v-for="tag in filteredTags" 
            :key="tag.id" 
            shadow="hover" 
            class="tag-card"
            @click="selectTag(tag)"
          >
            <div class="tag-info">
              <h3>{{ tag.tag }}</h3>
              <p class="tag-count" v-if="tag.count">共 {{ tag.count }} 题</p>
            </div>
          </el-card>
        </div>
      </el-card>
    </div>

    <!-- 题目列表视图 -->
    <div v-else>
      <div class="category-header">
        <el-page-header @back="backToTags" title="题目列表">
          <template #content>
            <span class="selected-tag">{{ selectedTag.tag }}</span>
          </template>
        </el-page-header>
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
                <router-link :to="`/question/${question.id}?tagId=${selectedTag.id}`" class="title-link">
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
import { ref, reactive, onMounted, computed } from 'vue'
import NoteList from '@/components/NoteList.vue'
import QuestionForm from '@/components/QuestionForm.vue'
import noteApi from '@/api/note'
import { ElMessage } from 'element-plus'
import { View, Star, Coin, Comment, Search } from '@element-plus/icons-vue'

// 标签数据
const tags = ref([])
const tagsLoading = ref(true)
const tagSearch = ref('')
const selectedTag = ref(null)

// 题库数据
const questions = ref([])
const loading = ref(false)
const showCreateDialog = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  page: 1,
  size: 10,
  difficulty: undefined,
  keyword: '',
  tagId: null
})

// 过滤后的标签列表
const filteredTags = computed(() => {
  if (!tagSearch.value) return tags.value
  return tags.value.filter(tag => 
    tag.tag.toLowerCase().includes(tagSearch.value.toLowerCase())
  )
})

// 难度等级颜色
const difficultyColors = ['#99A9BF', '#F7BA2A', '#FF9900', '#FA6400', '#FF0000']

// 格式化频率显示
const formatRate = (val) => {
  return `${Math.round(val * 100)}%`
}

// 获取所有标签
const fetchTags = async () => {
  tagsLoading.value = true
  try {
    const res = await noteApi.getQuestionTags()
    tags.value = res || []
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
    tags.value = []
  } finally {
    tagsLoading.value = false
  }
}

// 选择标签
const selectTag = (tag) => {
  selectedTag.value = tag
  queryParams.tagId = tag.id
  queryParams.page = 1
  fetchQuestionList()
}

// 返回标签列表
const backToTags = () => {
  selectedTag.value = null
  queryParams.tagId = null
}

// 获取题目列表
const fetchQuestionList = async () => {
  if (!selectedTag.value) return
  
  loading.value = true
  try {
    const res = await noteApi.getQuestionsByTag(selectedTag.value.id, queryParams.page, queryParams.size)
    if (res && res.records) {
      questions.value = res.records
      total.value = res.total
    } else {
      questions.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取题目列表失败:', error)
    ElMessage.error('获取题目列表失败')
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
  // 重新获取标签列表
  fetchTags()
}

// 页面加载时获取标签数据
onMounted(() => {
  fetchTags()
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

.tags-container {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tag-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.tag-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.tag-card:hover {
  transform: translateY(-5px);
}

.tag-info {
  text-align: center;
  padding: 10px;
}

.tag-count {
  margin-top: 5px;
  color: #909399;
  font-size: 14px;
}

.category-header {
  margin-bottom: 20px;
}

.selected-tag {
  font-weight: bold;
  font-size: 16px;
}

.filter-form {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.question-list {
  margin-bottom: 20px;
}

.question-item {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}

.question-title {
  flex: 1;
}

.title-link {
  color: #303133;
  text-decoration: none;
}

.title-link:hover {
  color: #409EFF;
}

.question-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 8px;
  gap: 10px;
}

.tag {
  margin-right: 5px;
}

.difficulty {
  font-size: 14px;
}

.appear-rate, .source {
  font-size: 14px;
  color: #606266;
}

.question-stats {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #909399;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 