<template>
  <div class="question-bank">
    <div class="question-header">
      <h2>题库</h2>
      <el-button type="primary" @click="showCreateDialog = true">发布题目</el-button>
    </div>

    <!-- 主体内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧主内容区 -->
      <div class="main-content">
        <!-- 标签列表视图 -->
        <div v-if="!selectedTag">
          <div class="panel">
            <div class="panel-header">
              <span class="panel-title">标签分类</span>
              <el-input
                v-model="tagSearch"
                placeholder="搜索标签"
                clearable
                prefix-icon="Search"
                style="width: 200px"
              ></el-input>
            </div>
            <div class="panel-body">
              <div v-if="tagsLoading">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="filteredTags.length === 0">
                <el-empty description="暂无标签" />
              </div>
              <div v-else class="tag-list">
                <div 
                  v-for="tag in filteredTags" 
                  :key="tag.id" 
                  class="tag-card"
                  @click="selectTag(tag)"
                >
                  <div class="tag-info">
                    <h3>{{ tag.tag }}</h3>
                    <p class="tag-count" v-if="tag.count">共 {{ tag.count }} 题</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 题目列表视图 -->
        <div v-else>
          <div class="panel">
            <div class="panel-header">
              <el-page-header @back="backToTags" title="题目列表">
                <template #content>
                  <span class="selected-tag">{{ selectedTag.tag }}</span>
                </template>
              </el-page-header>
            </div>
            <div class="panel-body">
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
              <div v-if="loading" class="loading-container">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="questions.length === 0" class="empty-container">
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
          </div>
        </div>
      </div>

      <!-- 右侧推荐题目列表 -->
      <div class="sidebar">
        <RecommendQuestions
          @questionClick="goToQuestionDetail"
          :tagId="selectedTag?.id"
        />
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
import RecommendQuestions from '@/components/RecommendQuestions.vue'
import noteApi from '@/api/note'
import { ElMessage } from 'element-plus'
import { View, Star, Coin, Comment, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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

// 难度标签映射
const getDifficultyType = (level) => {
  const types = ['info', 'success', 'warning', 'danger', 'danger']
  return types[level - 1] || 'info'
}

const getDifficultyLabel = (level) => {
  const labels = ['入门级', '简单', '中等', '困难', '专家级']
  return labels[level - 1] || '未知'
}

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

// 跳转到题目详情
const goToQuestionDetail = (questionId) => {
  router.push({
    path: `/question/${questionId}`,
    query: selectedTag.value ? { tagId: selectedTag.value.id } : {}
  })
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

// 页面加载时获取标签数据和推荐题目
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

/* 统一布局样式 */
.content-wrapper {
  display: flex;
  gap: 20px;
  margin-top: 20px;
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

/* 标签列表样式 */
.tag-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 10px;
}

.tag-card {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.tag-card:hover {
  background-color: #ecf5ff;
  transform: translateY(-5px);
}

.tag-info {
  text-align: center;
}

.tag-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.tag-count {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* 选择标签样式 */
.selected-tag {
  font-weight: bold;
  font-size: 16px;
}

/* 表单样式 */
.filter-form {
  margin-bottom: 20px;
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

/* 题目列表样式 */
.question-list {
  margin-bottom: 20px;
}

.question-item {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  transition: all 0.3s;
}

.question-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
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

/* 推荐列表样式 */
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.recommend-item {
  padding: 12px;
  border-radius: 4px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: all 0.3s;
}

.recommend-item:hover {
  background-color: #ecf5ff;
  transform: translateY(-2px);
}

.question-difficulty {
  margin-bottom: 8px;
}

.recommend-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.recommend-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

/* 加载和空状态容器 */
.loading-container,
.empty-container {
  padding: 20px 0;
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