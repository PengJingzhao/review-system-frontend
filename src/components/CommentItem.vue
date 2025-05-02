<template>
  <div class="comment-item">
    <div class="comment-user">
      <el-avatar :src="comment.author.avatar" :size="40"></el-avatar>
    </div>
    <div class="comment-content">
      <div class="comment-header">
        <span class="username">{{ comment.author.username }}</span>
        <span class="time">{{ formatTime(comment.createTime) }}</span>
      </div>
      <div class="comment-text">{{ comment.content }}</div>
      <div class="comment-actions">
        <span class="action" @click="handleLike">
          <el-icon :color="comment.isLiked ? '#ff2442' : '#999'">
            <component :is="comment.isLiked ? 'Star' : 'StarFilled'" />
          </el-icon>
          <span>{{ comment.likeCount || 0 }}</span>
        </span>
        <span class="action" @click="toggleReplyForm">回复</span>
      </div>
      
      <!-- 回复表单 -->
      <div v-if="showReplyForm" class="reply-form">
        <el-input
          v-model="replyContent"
          type="textarea"
          :rows="2"
          placeholder="回复评论..."
          resize="none"
        />
        <div class="reply-buttons">
          <el-button size="small" @click="showReplyForm = false">取消</el-button>
          <el-button size="small" type="primary" @click="submitReply" :loading="isSubmitting">回复</el-button>
        </div>
      </div>
      
      <!-- 子评论列表 -->
      <div v-if="comment.children && comment.children.length > 0" class="replies">
        <div v-for="reply in comment.children" :key="reply.id" class="reply-item">
          <div class="comment-user">
            <el-avatar :src="reply.author.avatar" :size="30"></el-avatar>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="username">{{ reply.author.username }}</span>
              <span class="time">{{ formatTime(reply.createTime) }}</span>
            </div>
            <div class="comment-text">
              <template v-if="reply.replyTo">
                回复 <span class="reply-to">@{{ reply.replyTo.username }}</span>：
              </template>
              {{ reply.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { StarFilled, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 定义组件属性
const props = defineProps({
  comment: {
    type: Object,
    required: true
  }
})

// 事件
const emit = defineEmits(['reply', 'like'])

// 回复相关状态
const showReplyForm = ref(false)
const replyContent = ref('')
const isSubmitting = ref(false)

// 切换回复表单显示状态
const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value
  if (!showReplyForm.value) {
    replyContent.value = ''
  }
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  isSubmitting.value = true
  try {
    await emit('reply', {
      commentId: props.comment.id,
      content: replyContent.value,
      replyTo: {
        id: props.comment.author.id,
        username: props.comment.author.username
      }
    })
    
    // 重置表单
    replyContent.value = ''
    showReplyForm.value = false
    ElMessage.success('回复成功')
  } catch (error) {
    ElMessage.error('回复失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 处理点赞/取消点赞
const handleLike = () => {
  emit('like', {
    commentId: props.comment.id,
    isLiked: !props.comment.isLiked
  })
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000) // 秒数差
  
  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    return `${Math.floor(diff / 60)}分钟前`
  } else if (diff < 86400) {
    return `${Math.floor(diff / 3600)}小时前`
  } else if (diff < 2592000) {
    return `${Math.floor(diff / 86400)}天前`
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
}
</script>

<style scoped>
.comment-item {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-user {
  margin-right: 12px;
  flex-shrink: 0;
}

.comment-content {
  flex-grow: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 10px;
  word-break: break-all;
}

.comment-actions {
  display: flex;
  gap: 15px;
}

.action {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.action:hover {
  color: #ff2442;
}

.reply-form {
  margin-top: 12px;
}

.reply-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 10px;
}

.replies {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #f0f0f0;
}

.reply-item {
  display: flex;
  margin-bottom: 12px;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-to {
  color: #ff2442;
  font-weight: 600;
}

@media screen and (max-width: 768px) {
  .comment-item {
    margin-bottom: 15px;
    padding-bottom: 10px;
  }
  
  .comment-user {
    margin-right: 8px;
  }
  
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .time {
    margin-top: 2px;
  }
}
</style> 