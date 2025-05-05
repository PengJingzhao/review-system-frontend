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

      <el-form-item label="讲解视频">
        <el-upload
          class="video-uploader"
          action="http://10.21.32.95:30618/api/file/uploadFile"
          :headers="uploadHeaders"
          :before-upload="beforeVideoUpload"
          :on-success="handleVideoSuccess"
          :on-error="handleVideoError"
          :on-progress="handleVideoProgress"
          :limit="1"
          :file-list="videoFileList"
          accept="video/*"
        >
          <el-button type="primary" :loading="videoUploading">
            <el-icon><Upload /></el-icon>
            {{ videoUrl ? '更换视频' : '上传讲解视频' }}
          </el-button>
          <template #tip>
            <div class="tips">支持mp4、webm等主流视频格式，建议大小不超过100MB</div>
          </template>
        </el-upload>
        
        <!-- 视频预览 -->
        <div v-if="videoUrl" class="video-preview">
          <video :src="videoUrl" controls class="preview-video"></video>
          <el-button type="danger" size="small" @click="removeVideo">
            <el-icon><Delete /></el-icon> 删除视频
          </el-button>
        </div>
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
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import noteApi from '@/api/note'
import { request } from '@/api/index'
import {MdEditor} from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { Upload, Delete } from '@element-plus/icons-vue'

const emit = defineEmits(['success', 'cancel'])

// 表单引用
const formRef = ref(null)

// 可用标签列表
const availableTags = ref([])
const tagsLoading = ref(false)

// 视频上传相关
const videoUrl = ref('')
const videoUploading = ref(false)
const videoFileList = ref([])

// 上传请求头，用于携带token
const uploadHeaders = computed(() => {
  return {
    Authorization: localStorage.getItem('token') || ''
  }
})

// 表单数据
const questionForm = reactive({
  title: '',
  answer: '',
  source: '',
  appearRate: 0.5,
  difficulty: 3,
  tagIds: [], // 存储标签ID
  videoUrl: '', // 存储视频URL用于预览
  video: '' // 存储返回的OSS文件名
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

// 视频上传前验证
const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isVideo) {
    ElMessage.error('只能上传视频文件！')
    return false
  }
  
  if (!isLt100M) {
    ElMessage.error('视频大小不能超过100MB！')
    return false
  }
  
  videoUploading.value = true
  return true
}

// 视频上传成功处理
const handleVideoSuccess = async (response, file) => {
  videoUploading.value = false
  
  if (response) {
    // 保存返回的OSS文件名
    const objectName = response
    
    try {
      // 请求获取真实视频URL的接口
      const videoUrlResponse = await request.get('/file/getReviewUrl', {
        params: { objectName }
      })
      
      if (videoUrlResponse) {
        // 设置真实的视频URL
        videoUrl.value = videoUrlResponse
        // 同时保存文件名，用于提交表单
        questionForm.video = objectName
        ElMessage.success('视频上传成功')
      } else {
        ElMessage.error('获取视频链接失败')
      }
    } catch (error) {
      console.error('获取视频链接失败:', error)
      ElMessage.error('获取视频链接失败，请重试')
    }
  } else {
    ElMessage.error('上传失败，未能获取视频文件名')
  }
}

// 视频上传失败处理
const handleVideoError = () => {
  videoUploading.value = false
  ElMessage.error('视频上传失败，请重试')
}

// 视频上传进度处理
const handleVideoProgress = () => {
  videoUploading.value = true
}

// 删除视频
const removeVideo = () => {
  videoUrl.value = ''
  questionForm.videoUrl = ''
  questionForm.video = ''
  videoFileList.value = []
  ElMessage.success('视频已删除')
}

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
    
    if (videoUploading.value) {
      ElMessage.warning('视频正在上传中，请等待上传完成')
      return
    }
    
    // 准备提交数据
    const data = {
      ...questionForm,
      // 确保提交的是标签ID列表和视频文件名（而不是URL）
      tagIds: questionForm.tagIds,
      video: questionForm.video || ''
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
  videoUrl.value = ''
  questionForm.videoUrl = ''
  questionForm.video = ''
  videoFileList.value = []
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

.video-uploader {
  margin-bottom: 15px;
}

.video-preview {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-video {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  object-fit: contain;
  background-color: #f5f7fa;
}
</style> 