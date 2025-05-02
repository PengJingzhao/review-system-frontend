<template>
  <div class="publish-page">
    <TheHeader />
    
    <div class="content-container">
      <el-card class="publish-card">
        <template #header>
          <div class="card-header">
            <h2>发布笔记</h2>
          </div>
        </template>
        
        <el-form 
          ref="publishFormRef"
          :model="publishForm"
          :rules="publishRules"
          label-position="top"
          class="publish-form"
        >
          <!-- 笔记标题 -->
          <el-form-item label="标题" prop="title">
            <el-input 
              v-model="publishForm.title"
              placeholder="输入笔记标题（2-30字）"
              maxlength="30"
              show-word-limit
            />
          </el-form-item>
          
          <!-- 笔记内容 -->
          <el-form-item label="内容" prop="content">
            <div class="editor-controls">
              <span class="editor-label">编辑器宽度：</span>
              <el-radio-group v-model="editorWidth" size="small">
                <el-radio-button label="100%">全宽</el-radio-button>
                <el-radio-button label="85%">宽</el-radio-button>
                <el-radio-button label="75%">中等</el-radio-button>
                <el-radio-button label="65%">窄</el-radio-button>
              </el-radio-group>
            </div>
            <div class="markdown-wrapper" :style="{ display: 'flex', justifyContent: editorWidth !== '100%' ? 'center' : 'flex-start' }">
              <md-editor
                v-model="publishForm.content"
                :theme="theme"
                previewTheme="github"
                height="400px"
                @change="handleContentChange"
                :toolbars="toolbars"
                :style="{ width: editorWidth }"
              />
              <!-- <div class="markdown-tips">
                <p>支持Markdown语法，可以使用各种格式如标题、列表、代码块等</p>
                <p>提示：## 标题，**粗体**，*斜体*，[链接](URL)，`代码`，```代码块```</p>
              </div> -->
            </div>
          </el-form-item>
          
          <!-- 图片上传 -->
          <el-form-item label="添加图片" prop="images">
            <el-upload
              v-model:file-list="fileList"
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="9"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :before-upload="() => false"
            >
              <el-icon><Plus /></el-icon>
              <template #file="{ file }">
                <div class="upload-image-preview">
                  <img class="preview-image" :src="file.url" alt="" />
                  <div class="upload-image-actions">
                    <el-icon class="delete" @click.stop="handleFileRemove(file)"><Delete /></el-icon>
                  </div>
                </div>
              </template>
            </el-upload>
            <div class="upload-tip">
              <p>支持jpg、png、gif格式，每张图片不超过10MB，最多上传9张</p>
            </div>
          </el-form-item>
          
          <!-- 标签 -->
          <el-form-item label="添加标签" prop="tags">
            <el-select
              v-model="publishForm.tags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="输入标签，回车确认"
              :max-collapse-tags="3"
              style="width: 100%"
            >
              <el-option
                v-for="tag in recommendTags"
                :key="tag"
                :label="tag"
                :value="tag"
              />
            </el-select>
            <div class="recommend-tags">
              <span class="recommend-title">推荐：</span>
              <el-tag
                v-for="tag in recommendTags.slice(0, 6)"
                :key="tag"
                class="recommend-tag"
                @click="addTag(tag)"
              >
                {{ tag }}
              </el-tag>
            </div>
          </el-form-item>
          
          <!-- 位置 -->
          <el-form-item label="位置" prop="location">
            <el-input 
              v-model="publishForm.location"
              placeholder="添加位置（选填）"
              prefix-icon="Location"
            />
          </el-form-item>
          
          <!-- 提交按钮 -->
          <el-form-item>
            <div class="publish-buttons">
              <el-button @click="saveAsDraft">存为草稿</el-button>
              <el-button 
                type="primary" 
                @click="handlePublish"
                :loading="isPublishing"
              >
                发布笔记
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '../store/noteStore'
import { useUserStore } from '../store/userStore'
import TheHeader from '../components/TheHeader.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Location } from '@element-plus/icons-vue'
import noteApi from '../api/note'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const router = useRouter()
const noteStore = useNoteStore()
const userStore = useUserStore()

// 表单ref
const publishFormRef = ref(null)

// 上传的文件列表
const fileList = ref([])

// 发布状态
const isPublishing = ref(false)

// 主题
const theme = ref('light')

// 编辑器宽度
const editorWidth = ref('100%')

// 配置工具栏
const toolbars = [
  'bold', 'italic', 'strikethrough', 'title', 'quote', 'unorderedList',
  'orderedList', 'codeRow', 'code', 'link', 'image', 'table', 'revoke',
  'next', 'preview', 'htmlPreview', 'help'
]

// 推荐标签
const recommendTags = [
  '美食', '旅行', '穿搭', '读书', '摄影', '健身',
  '生活方式', '家居', '数码', '护肤', '彩妆', '宠物'
]

// 表单数据
const publishForm = reactive({
  title: '',
  content: '',
  images: [],
  tags: [],
  location: ''
})

// 表单验证规则
const publishRules = {
  title: [
    { required: true, message: '请输入笔记标题', trigger: 'blur' },
    { min: 2, max: 30, message: '标题长度在2到30个字符之间', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入笔记内容', trigger: 'change' },
    { 
      validator: (rule, value, callback) => {
        if (value && value.trim().length < 10) {
          callback(new Error('内容至少需要10个字符'))
        } else if (value && value.length > 10000) {
          callback(new Error('内容不能超过10000个字符'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  images: [
    { 
      validator: (rule, value, callback) => {
        console.log('校验图片数组:', value, value ? value.length : 0)
        if (!value || !Array.isArray(value) || value.length === 0) {
          callback(new Error('请上传至少一张图片'))
        } else {
          callback()
        }
      }, 
      trigger: 'change'
    }
  ]
}

// 处理文件变更
const handleFileChange = (uploadFile) => {
  // 限制文件大小为10MB
  const maxSize = 10 * 1024 * 1024
  if (uploadFile.raw.size > maxSize) {
    ElMessage.error('图片大小不能超过10MB')
    fileList.value = fileList.value.filter(file => file.uid !== uploadFile.uid)
    return
  }
  
  // 限制文件类型
  const allowTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowTypes.includes(uploadFile.raw.type)) {
    ElMessage.error('只能上传jpg、png、gif格式的图片')
    fileList.value = fileList.value.filter(file => file.uid !== uploadFile.uid)
    return
  }
  
  // 确保fileList被更新后再更新表单数据
  setTimeout(() => {
    // 更新表单数据中的图片数组
    publishForm.images = fileList.value.map(file => file.raw)
    
    console.log('图片验证触发', publishForm.images.length, '张图片')
    
    // 手动触发表单验证
    if (publishFormRef.value && fileList.value.length > 0) {
      publishFormRef.value.validateField('images')
    }
  }, 10)
}

// 处理文件移除
const handleFileRemove = (file) => {
  fileList.value = fileList.value.filter(item => item.uid !== file.uid)
  
  // 确保fileList更新后再更新表单数据
  setTimeout(() => {
    publishForm.images = fileList.value.map(file => file.raw)
    
    // 手动触发验证
    if (publishFormRef.value) {
      publishFormRef.value.validateField('images')
    }
  }, 10)
}

// 处理内容变更
const handleContentChange = (content) => {
  // 内容变更时会触发的函数
  console.log('内容已更新')
  // 更新内容后验证表单
  if (publishFormRef.value) {
    publishFormRef.value.validateField('content')
  }
}

// 添加标签
const addTag = (tag) => {
  if (!publishForm.tags.includes(tag)) {
    publishForm.tags.push(tag)
  }
}

// 保存为草稿
const saveAsDraft = async () => {
  try {
    // 执行表单验证
    await publishFormRef.value.validate()
    
    // 显示保存中状态
    isPublishing.value = true
    
    try {
      // 上传图片
      const imageUrls = []
      console.log('开始上传图片（草稿模式），共', publishForm.images.length, '张')
      
      for (const image of publishForm.images) {
        try {
          console.log('上传图片:', image.name || '未命名图片')
          const imageUrl = await noteApi.uploadImage(image)
          console.log('图片上传成功, URL:', imageUrl)
          imageUrls.push(imageUrl)
        } catch (error) {
          console.error('图片上传失败:', error)
          ElMessage.error('图片上传失败，请重试')
          isPublishing.value = false
          return
        }
      }
      
      console.log('所有图片上传完成, URLs:', imageUrls)
      
      // 设置状态为"保存为草稿"
      const contentData = {
        textContent: publishForm.content,
        mediaUrls: imageUrls.join(','),
        tags: publishForm.tags.join(','),
        location: publishForm.location || '',
        status: 0 // 草稿状态
      }
      
      console.log('发送数据（草稿）:', contentData)
      
      // 调用创建内容API
      const response = await noteApi.createContent(contentData)
      
      // 保存成功后提示并返回首页
      ElMessage.success('草稿保存成功')
      router.push('/')
    } catch (error) {
      console.error('保存草稿失败', error)
      ElMessage.error('保存草稿失败，请重试')
    } finally {
      isPublishing.value = false
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败', error)
  }
}

// 发布笔记
const handlePublish = async () => {
  try {
    // 执行表单验证
    await publishFormRef.value.validate()
    
    // 弹窗确认
    await ElMessageBox.confirm(
      '确定要发布这篇笔记吗？发布后将无法编辑',
      '发布确认',
      {
        confirmButtonText: '确认发布',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 设置发布状态
    isPublishing.value = true
    
    try {
      // 上传图片
      const imageUrls = []
      console.log('开始上传图片，共', publishForm.images.length, '张')
      
      for (const image of publishForm.images) {
        try {
          console.log('上传图片:', image.name || '未命名图片')
          const imageUrl = await noteApi.uploadImage(image)
          console.log('图片上传成功, URL:', imageUrl)
          imageUrls.push(imageUrl)
        } catch (error) {
          console.error('图片上传失败:', error)
          ElMessage.error('图片上传失败，请重试')
          isPublishing.value = false
          return
        }
      }
      
      console.log('所有图片上传完成, URLs:', imageUrls)
      
      // 准备笔记数据
      const contentData = {
        textContent: publishForm.content,
        mediaUrls: imageUrls.join(','),
        tags: publishForm.tags.join(','),
        location: publishForm.location || '',
        status: 1 // 发布状态
      }
      
      console.log('发送数据:', contentData)
      
      // 调用创建内容API
      const response = await noteApi.createContent(contentData)
      
      // 发布成功后提示并返回首页
      ElMessage.success('笔记发布成功')
      router.push('/')
    } catch (error) {
      console.error('发布笔记失败', error)
      ElMessage.error('发布失败，请重试')
    } finally {
      isPublishing.value = false
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败', error)
  }
}
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40px;
}

.content-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 15px;
}

.publish-card {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.publish-form {
  margin-top: 20px;
}

.upload-image-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-image-actions {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 5px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 0 0 0 4px;
}

.upload-image-actions .delete {
  color: #fff;
  cursor: pointer;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.recommend-tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.recommend-title {
  font-size: 14px;
  color: #666;
}

.recommend-tag {
  cursor: pointer;
}

.publish-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.markdown-wrapper {
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

/* 自定义Markdown编辑器样式 */
:deep(.md-editor) {
  width: 100% !important;
  max-width: 100%;
  margin: 0 auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.md-editor-toolbar) {
  border-bottom: 1px solid #ebeef5;
}

/* 调整不同屏幕尺寸下的编辑器宽度 */
@media screen and (max-width: 767px) {
  .content-container {
    padding: 0 10px;
  }
  
  :deep(.md-editor) {
    width: 100% !important;
  }
}

@media screen and (min-width: 768px) and (max-width: 991px) {
  :deep(.md-editor) {
    width: 100% !important;
  }
}

@media screen and (min-width: 992px) {
  :deep(.md-editor) {
    width: 100% !important;
  }
}

.markdown-tips {
  margin-top: 5px;
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

.editor-controls {
  margin-bottom: 10px;
}

.editor-label {
  margin-right: 10px;
}
</style> 