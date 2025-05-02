<template>
  <div class="login-page">
    <div class="login-container">
      <div class="logo">
        <h1>小红书</h1>
        <p>分享你的生活方式</p>
      </div>
      
      <el-card class="login-card">
        <template #header>
          <div class="card-header">
            <h2>手机号登录</h2>
          </div>
        </template>
        
        <el-form 
          ref="phoneFormRef"
          :model="phoneForm"
          :rules="phoneRules"
          label-position="top"
        >
          <el-form-item label="手机号" prop="phone">
            <el-input 
              v-model="phoneForm.phone"
              placeholder="请输入手机号"
              :prefix-icon="Iphone"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="login-button" 
              @click="handleSendCode"
              :loading="isLoading"
            >
              获取验证码
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import { Iphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 路由实例
const router = useRouter()
const userStore = useUserStore()

// 表单ref
const phoneFormRef = ref(null)

// 表单数据
const phoneForm = reactive({
  phone: ''
})

// 加载状态
const isLoading = ref(false)

// 表单验证规则
const phoneRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ]
}

// 处理发送验证码
const handleSendCode = async () => {
  if (!phoneFormRef.value) return
  
  try {
    await phoneFormRef.value.validate()
    
    isLoading.value = true
    const res = await userStore.sendCode(phoneForm.phone)
    
    if (res) {
      // 跳转到验证码输入页面
      router.push({
        name: 'CodeVerify',
        params: { phone: phoneForm.phone }
      })
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f6f6f6;
  background-image: linear-gradient(135deg, #f6f6f6 0%, #ffffff 100%);
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo h1 {
  font-size: 32px;
  color: #ff2442;
  margin-bottom: 5px;
}

.logo p {
  font-size: 14px;
  color: #999;
}

.login-card {
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 18px;
  color: #333;
  margin: 0;
}

.login-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  border-radius: 4px;
  background-color: #ff2442;
  border-color: #ff2442;
}

.login-button:hover {
  background-color: #e01f3d;
  border-color: #e01f3d;
}
</style> 