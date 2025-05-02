<template>
  <div class="user-profile-page">
    <TheHeader />
    
    <div class="content-container" v-loading="isLoading">
      <!-- 用户基本信息 -->
      <div class="user-info-section">
        <div class="user-header">
          <div class="user-avatar">
            <el-avatar :src="userInfo.avatar" :size="100"></el-avatar>
          </div>
          <div class="user-details">
            <h1 class="username">{{ userInfo.name }}</h1>
            <p class="user-id">小红书号：{{ userInfo.name }}</p>
            
            <div class="user-stats">
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.attentionCount || 0 }}</div>
                <div class="stat-label">关注</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.followerCount || 0 }}</div>
                <div class="stat-label">粉丝</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ userInfo.likeCount || 0 }}</div>
                <div class="stat-label">获赞</div>
              </div>
            </div>
            
            <div class="user-bio">{{ userInfo.bio || '这个人很懒，什么都没留下~' }}</div>
          </div>
          
          <div class="user-actions">
            <template v-if="isCurrentUser">
              <!-- 当前用户查看自己的主页 -->
              <el-button type="primary" plain @click="editProfile">编辑资料</el-button>
              <el-button @click="goToSettings">设置</el-button>
            </template>
            <template v-else>
              <!-- 查看他人主页 -->
              <el-button 
                type="primary" 
                :plain="userInfo.isFollowing" 
                @click="handleFollow"
              >
                {{ userInfo.isFollowing ? '已关注' : '关注' }}
              </el-button>
              <el-button icon="Message" @click="handleMessage">私信</el-button>
            </template>
          </div>
        </div>
      </div>
      
      <!-- 用户笔记/收藏内容 -->
      <div class="user-content-section">
        <el-tabs v-model="activeTab" @tab-click="handleTabChange">
          <el-tab-pane label="笔记" name="notes"></el-tab-pane>
          <el-tab-pane label="收藏" name="collections"></el-tab-pane>
          <el-tab-pane label="喜欢" name="likes"></el-tab-pane>
        </el-tabs>
        
        <!-- 笔记内容 -->
        <div class="notes-container">
          <template v-if="userNotes.length > 0">
            <div class="waterfall">
              <div v-for="note in userNotes" :key="note.id" class="waterfall-item">
                <NoteCard :note="note" />
              </div>
            </div>
            
            <!-- 加载更多 -->
            <div class="load-more" v-if="hasMoreNotes && !isLoadingMore">
              <el-button type="primary" plain @click="loadMoreNotes">加载更多</el-button>
            </div>
            <div class="loading-more" v-if="isLoadingMore">
              <el-spinner />
              <span>加载中...</span>
            </div>
          </template>
          
          <!-- 空状态 -->
          <el-empty 
            v-else 
            :description="
              activeTab === 'notes' ? '暂无笔记' : 
              activeTab === 'collections' ? '暂无收藏' : '暂无喜欢的内容'
            "
          >
            <template v-if="isCurrentUser && activeTab === 'notes'">
              <el-button type="primary" @click="goToPublish">发布笔记</el-button>
            </template>
          </el-empty>
        </div>
      </div>
    </div>
    
    <!-- 返回顶部 -->
    <el-backtop :right="20" :bottom="20" />
    
    <!-- 编辑资料弹窗 -->
    <el-dialog v-model="showEditDialog" title="编辑个人资料" width="500px">
      <el-form 
        ref="profileFormRef"
        :model="profileForm"
        label-position="top"
        class="profile-form"
      >
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            :show-file-list="false"
          >
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar-preview" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="profileForm.username" />
        </el-form-item>
        
        <el-form-item label="个人简介" prop="bio">
          <el-input 
            v-model="profileForm.bio" 
            type="textarea" 
            :rows="3"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="profileForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="other">保密</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="updateProfile" :loading="isUpdating">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import TheHeader from '../components/TheHeader.vue'
import NoteCard from '../components/NoteCard.vue'
import { ElMessage } from 'element-plus'
import { Plus, Message } from '@element-plus/icons-vue'
import userApi from '../api/user'
import noteApi from '../api/note'
import { request } from '../api/index'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 页面加载状态
const isLoading = ref(true)
const isLoadingMore = ref(false)

// 当前查看的用户ID
const userId = computed(() => route.params.id)

// 是否是当前登录用户
const isCurrentUser = computed(() => userId.value === userStore.userId)

// 用户信息
const userInfo = ref({
  name: '',
  attentionCount: 0,
  followerCount: 0,
  likeCount: 0,
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
})

// 笔记列表
const userNotes = ref([])
const currentPage = ref(1)
const hasMoreNotes = ref(true)

// 选中的标签
const activeTab = ref('notes')

// 编辑资料相关
const showEditDialog = ref(false)
const isUpdating = ref(false)
const avatarUrl = ref('')
const avatarFile = ref(null)

// 编辑表单
const profileFormRef = ref(null)
const profileForm = reactive({
  username: '',
  bio: '',
  gender: 'other'
})

// 页面初始化
onMounted(async () => {
  isLoading.value = true
  try {
    await fetchUserInfo()
    await fetchUserNotes()
  } catch (error) {
    console.error('获取用户数据失败', error)
    ElMessage.error('获取用户数据失败，请刷新重试')
  } finally {
    isLoading.value = false
  }
})

// 获取用户信息
const fetchUserInfo = async () => {
  isLoading.value = true
  try {
    const res = await request.get('/user/getUser')
    if (res) {
      userInfo.value = {
        ...userInfo.value,
        name: res.name,
        attentionCount: res.attentionCount,
        followerCount: res.followerCount
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  } finally {
    isLoading.value = false
  }
}

// 获取用户笔记
const fetchUserNotes = async (page = 1) => {
  try {
    const res = await noteApi.getUserNotes(null, page)
    if (res) {
      if (page === 1) {
        userNotes.value = res.records || []
      } else {
        userNotes.value = [...userNotes.value, ...(res.records || [])]
      }
      
      currentPage.value = res.current
      hasMoreNotes.value = res.total > (res.current * res.size)
    } else {
      ElMessage.error('获取笔记列表失败')
    }
  } catch (error) {
    console.error('获取用户笔记失败:', error)
    ElMessage.error('获取笔记列表失败')
    throw error
  }
}

// 获取用户收藏的笔记
const fetchUserCollections = async (page = 1) => {
  try {
    const res = await noteApi.getUserCollections(userId.value, page)
    if (res) {
      if (page === 1) {
        userNotes.value = res.list || []
      } else {
        userNotes.value = [...userNotes.value, ...(res.list || [])]
      }
      
      currentPage.value = page
      hasMoreNotes.value = res.hasMore || false
    } else {
      ElMessage.error('获取收藏列表失败')
    }
  } catch (error) {
    console.error('获取用户收藏失败:', error)
    ElMessage.error('获取收藏列表失败')
    throw error
  }
}

// 获取用户点赞的笔记
const fetchUserLikes = async (page = 1) => {
  try {
    const res = await noteApi.getUserLikes(userId.value, page)
    if (res) {
      if (page === 1) {
        userNotes.value = res.list || []
      } else {
        userNotes.value = [...userNotes.value, ...(res.list || [])]
      }
      
      currentPage.value = page
      hasMoreNotes.value = res.hasMore || false
    } else {
      ElMessage.error('获取点赞列表失败')
    }
  } catch (error) {
    console.error('获取用户点赞失败:', error)
    ElMessage.error('获取点赞列表失败')
    throw error
  }
}

// 处理标签切换
const handleTabChange = (tab) => {
  activeTab.value = tab.paneName
  currentPage.value = 1
  userNotes.value = []
  
  if (tab.paneName === 'notes') {
    // 加载笔记
    fetchUserNotes(1)
  } else if (tab.paneName === 'collections') {
    // 加载收藏
    fetchUserCollections(1)
  } else if (tab.paneName === 'likes') {
    // 加载点赞
    fetchUserLikes(1)
  }
}

// 加载更多笔记
const loadMoreNotes = async () => {
  if (isLoadingMore.value || !hasMoreNotes.value) return
  
  isLoadingMore.value = true
  try {
    if (activeTab.value === 'notes') {
      await fetchUserNotes(currentPage.value + 1)
    } else if (activeTab.value === 'collections') {
      await fetchUserCollections(currentPage.value + 1)
    } else if (activeTab.value === 'likes') {
      await fetchUserLikes(currentPage.value + 1)
    }
  } catch (error) {
    console.error('加载更多失败', error)
    ElMessage.error('加载更多失败，请重试')
  } finally {
    isLoadingMore.value = false
  }
}

// 关注/取消关注
const handleFollow = async () => {
  try {
    if (userInfo.value.isFollowing) {
      // 取消关注
      await userApi.unfollowUser(userId.value)
      userInfo.value.isFollowing = false
      userInfo.value.followerCount = Math.max((userInfo.value.followerCount || 1) - 1, 0)
      ElMessage.success(`已取消关注 ${userInfo.value.name}`)
    } else {
      // 关注
      await userApi.followUser(userId.value)
      userInfo.value.isFollowing = true
      userInfo.value.followerCount = (userInfo.value.followerCount || 0) + 1
      ElMessage.success(`已关注 ${userInfo.value.name}`)
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  }
}

// 发送私信
const handleMessage = () => {
  ElMessage.success('私信功能开发中...')
}

// 前往设置
const goToSettings = () => {
  router.push('/settings')
}

// 前往发布页面
const goToPublish = () => {
  router.push('/publish')
}

// 编辑资料
const editProfile = () => {
  // 初始化表单数据
  profileForm.username = userInfo.value.name || ''
  profileForm.bio = userInfo.value.bio || ''
  profileForm.gender = userInfo.value.gender || 'other'
  avatarUrl.value = userInfo.value.avatar
  
  showEditDialog.value = true
}

// 处理头像变更
const handleAvatarChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('请上传图片文件')
    return
  }
  
  // 显示预览
  avatarUrl.value = URL.createObjectURL(file.raw)
  avatarFile.value = file.raw
}

// 更新个人资料
const updateProfile = async () => {
  isUpdating.value = true
  
  try {
    // 如果有新头像，先上传头像
    let avatarUrlToUpdate = userInfo.value.avatar
    
    if (avatarFile.value) {
      try {
        // 上传头像
        const uploadRes = await noteApi.uploadImage(avatarFile.value)
        if (uploadRes.code === 0) {
          avatarUrlToUpdate = uploadRes.data.url
        } else {
          throw new Error(uploadRes.message || '头像上传失败')
        }
      } catch (error) {
        ElMessage.error('头像上传失败，请重试')
        isUpdating.value = false
        return
      }
    }
    
    // 更新资料
    const updateData = {
      username: profileForm.username,
      bio: profileForm.bio,
      gender: profileForm.gender,
      avatar: avatarUrlToUpdate
    }
    
    // 模拟更新成功
    // 实际项目中这里应该调用更新用户资料的API
    setTimeout(() => {
      // 更新本地状态
      Object.assign(userInfo.value, updateData)
      userStore.updateUserInfo(updateData)
      
      ElMessage.success('个人资料更新成功')
      showEditDialog.value = false
      isUpdating.value = false
    }, 1000)
  } catch (error) {
    ElMessage.error('更新失败，请重试')
    isUpdating.value = false
  }
}
</script>

<style scoped>
.user-profile-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.content-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 80px 20px 40px;
}

.user-info-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 30px;
  margin-bottom: 20px;
}

.user-header {
  display: flex;
  flex-wrap: wrap;
}

.user-avatar {
  margin-right: 30px;
}

.user-details {
  flex: 1;
  min-width: 200px;
}

.username {
  font-size: 24px;
  color: #333;
  margin: 0 0 5px;
}

.user-id {
  font-size: 14px;
  color: #999;
  margin: 0 0 15px;
}

.user-stats {
  display: flex;
  margin-bottom: 15px;
}

.stat-item {
  margin-right: 30px;
  cursor: pointer;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #999;
}

.user-bio {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.user-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
  align-self: flex-start;
}

.user-content-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  padding: 20px;
}

.waterfall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  grid-gap: 20px;
  margin-top: 20px;
}

.waterfall-item {
  break-inside: avoid;
  margin-bottom: 20px;
}

.load-more, .loading-more {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

.loading-more {
  align-items: center;
  color: #999;
}

.loading-more span {
  margin-left: 10px;
}

.avatar-uploader {
  text-align: center;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 50%;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

@media screen and (max-width: 768px) {
  .content-container {
    padding: 70px 10px 20px;
  }
  
  .user-info-section {
    padding: 20px 15px;
  }
  
  .user-header {
    flex-direction: column;
    text-align: center;
  }
  
  .user-avatar {
    margin: 0 auto 20px;
  }
  
  .user-stats {
    justify-content: center;
  }
  
  .user-actions {
    margin: 20px auto 0;
  }
  
  .waterfall {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    grid-gap: 10px;
  }
}
</style> 