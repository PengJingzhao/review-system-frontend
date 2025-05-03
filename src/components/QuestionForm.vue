<template>
  <div class="question-form">
    <el-form :model="questionForm" :rules="rules" ref="formRef" label-width="100px">
      <el-form-item label="题目标题" prop="title">
        <el-input v-model="questionForm.title" placeholder="请输入题目标题"></el-input>
      </el-form-item>

      <el-form-item label="答案" prop="answer">
        <MdEditor
          v-model="questionForm.answer"
          language="zh-CN"
          placeholder="请输入答案内容，支持Markdown格式"
          :toolbarsExclude="toolbarsExclude"
          previewTheme="github"
          codeTheme="atom"
          style="height: 350px"
        />
      </el-form-item>

      <el-form-item label="来源" prop="source">
        <el-input v-model="questionForm.source" placeholder="请输入题目来源，如：书籍、面试公司等"></el-input>
      </el-form-item>

      <el-form-item label="出现频率" prop="appearRate">
        <el-slider 
          v-model="questionForm.appearRate" 
          :step="0.01" 
          :min="0" 
          :max="1" 
          :format-tooltip="formatRate"
        ></el-slider>
      </el-form-item>

      <el-form-item label="难度等级" prop="difficulty">
        <el-rate 
          v-model="questionForm.difficulty" 
          :colors="difficultyColors"
          :max="5"
          :texts="difficultyTexts"
          show-text
        ></el-rate>
      </el-form-item>

      <el-form-item label="标签" prop="tagIds">
        <el-select
          v-model="questionForm.tagIds"
          multiple
          filterable
          placeholder="请选择标签"
          v-loading="tagsLoading"
        >
          <el-option
            v-for="tag in availableTags"
            :key="tag.id"
            :label="tag.tag"
            :value="tag.id"
          ></el-option>
        </el-select>
        <div class="tips">注意：只能选择已有标签，不可创建新标签</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">发布题目</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import noteApi from '@/api/note'
import {MdEditor} from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const emit = defineEmits(['success', 'cancel'])

// 表单引用
const formRef = ref(null)

// 可用标签列表
const availableTags = ref([])
const tagsLoading = ref(false)

// 表单数据
const questionForm = reactive({
  title: '',
  answer: '',
  source: '',
  appearRate: 0.5,
  difficulty: 3,
  tagIds: [] // 改为存储标签ID
})

// 表单验证规则
const rules = {
  title: [{ required: true, message: '请输入题目标题', trigger: 'blur' }],
  answer: [{ required: true, message: '请输入答案内容', trigger: 'blur' }],
  source: [{ required: true, message: '请输入题目来源', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择难度等级', trigger: 'change' }],
  tagIds: [{ required: true, message: '请至少选择一个标签', trigger: 'change' }]
}

// 难度等级颜色
const difficultyColors = ['#99A9BF', '#F7BA2A', '#FF9900', '#FA6400', '#FF0000']

// 难度等级文字
const difficultyTexts = ['入门级', '简单', '中等', '困难', '专家级']

// 格式化频率显示
const formatRate = (val) => {
  return `${Math.round(val * 100)}%`
}

// 精简工具栏，移除部分不需要的功能
const toolbarsExclude = [
  'github',
  'fullscreen'
]

// 获取所有可用标签
const fetchTags = async () => {
  tagsLoading.value = true
  try {
    const res = await noteApi.getQuestionTags()
    availableTags.value = res || []
  } catch (error) {
    console.error('获取标签列表失败:', error)
    ElMessage.error('获取标签列表失败')
    availableTags.value = []
  } finally {
    tagsLoading.value = false
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    // 准备提交数据
    const data = {
      ...questionForm,
      // 确保提交的是标签ID列表
      tagIds: questionForm.tagIds
    }
    
    // 调用API创建题目
    const result = await noteApi.createQuestion(data)
    
    ElMessage.success('题目发布成功')
    emit('success', result)
    resetForm()
  } catch (error) {
    console.error('表单验证失败或提交出错:', error)
    ElMessage.error('提交失败，请检查表单填写是否正确')
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 组件挂载时获取标签列表
onMounted(() => {
  fetchTags()
})
</script>

<style scoped>
.question-form {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 调整Markdown编辑器样式 */
:deep(.md-editor) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.tips {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style> 