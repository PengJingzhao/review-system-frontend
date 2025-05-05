<template>
  <div class="recommend-panel panel">
    <div class="panel-header">
      <span class="panel-title">{{ title }}</span>
    </div>
    <div class="panel-body">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>
      <div v-else-if="questions.length === 0" class="empty-container">
        <el-empty description="暂无推荐题目" :image-size="60" />
      </div>
      <el-scrollbar v-else height="500px" class="recommend-scrollbar">
        <div class="recommend-list">
          <div 
            v-for="question in questions" 
            :key="question.id"
            class="recommend-item"
            @click="handleQuestionClick(question.id)"
          >
            <div class="question-difficulty">
              <el-tag 
                :type="getDifficultyType(question.difficulty)"
                effect="dark"
                size="small"
              >
                {{ getDifficultyLabel(question.difficulty) }}
              </el-tag>
            </div>
            <div class="recommend-title">{{ question.title }}</div>
            <div class="recommend-meta">
              <span class="appear-rate">出现率: {{ formatRate(question.appearRate) }}</span>
              <span class="source">{{ question.source }}</span>
            </div>
            <div class="recommend-tags">
              <el-tag 
                v-for="tag in question.tags" 
                :key="tag" 
                size="small"
                effect="plain"
                class="tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import noteApi from '@/api/note'

const router = useRouter()

// 定义组件接收的属性
const props = defineProps({
  title: {
    type: String,
    default: '推荐题目'
  },
  customQuestions: {
    type: Array,
    default: null
  },
  tagId: {
    type: [Number, String],
    default: null
  }
})

// 定义事件
const emit = defineEmits(['questionClick'])

// 数据状态
const questions = ref([])
const loading = ref(false)

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

// 处理题目点击
const handleQuestionClick = (questionId) => {
  emit('questionClick', questionId)
  
  // 默认导航行为 (可以被父组件的事件处理覆盖)
  router.push({
    path: `/question/${questionId}`,
    query: props.tagId ? { tagId: props.tagId } : {}
  })
}

// 获取推荐题目列表
const fetchRecommendQuestions = async () => {
  if (props.customQuestions) {
    questions.value = props.customQuestions
    return
  }
  
  loading.value = true
  try {
    const res = await noteApi.getRecommendQuestions()
    questions.value = res || []
  } catch (error) {
    console.error('获取推荐题目失败:', error)
    questions.value = []
  } finally {
    loading.value = false
  }
}

// 监听customQuestions属性变化
watch(
  () => props.customQuestions,
  (newQuestions) => {
    if (newQuestions) {
      questions.value = newQuestions
    } else {
      fetchRecommendQuestions()
    }
  }
)

// 组件挂载时获取数据
onMounted(() => {
  fetchRecommendQuestions()
})
</script>

<style scoped>
.recommend-scrollbar {
  --el-scrollbar-padding: 0;
}

.recommend-panel {
  width: 100%;
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

/* 推荐列表样式 */
.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 防止最后一个元素底部被裁剪 */
.recommend-list::after {
  content: "";
  height: 8px;
  display: block;
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

.tag {
  margin-right: 5px;
}

/* 加载和空状态容器 */
.loading-container,
.empty-container {
  padding: 20px 0;
}
</style> 