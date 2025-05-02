<template>
  <div class="register-page">
    <div class="register-container">
      <div class="logo">
        <h1>小红书</h1>
        <p>加入小红书，分享你的精彩</p>
      </div>
      
      <el-card class="register-card">
        <template #header>
          <div class="card-header">
            <h2>用户注册</h2>
            <router-link to="/login">
              <el-button type="text">已有账号？去登录</el-button>
            </router-link>
          </div>
        </template>
        
        <el-form 
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="registerForm.username"
              placeholder="设置用户名"
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input 
              v-model="registerForm.phone"
              placeholder="输入手机号"
              prefix-icon="Iphone"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="registerForm.password"
              type="password"
              placeholder="设置密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input 
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="确认密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <div class="agreement">
            <el-checkbox v-model="agreement">我已阅读并同意</el-checkbox>
            <el-button type="text" @click="showAgreement">《用户协议》</el-button>
            <span>和</span>
            <el-button type="text" @click="showPrivacy">《隐私政策》</el-button>
          </div>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="register-button" 
              @click="handleRegister"
              :loading="isLoading"
              :disabled="!agreement"
            >
              注册
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <!-- 协议弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      top="10vh"
    >
      <div class="dialog-content" v-html="dialogContent"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/userStore'
import { User, Lock, Iphone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 路由实例
const router = useRouter()
const userStore = useUserStore()

// 表单ref
const registerFormRef = ref(null)

// 表单数据
const registerForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 协议同意选项
const agreement = ref(false)

// 加载状态
const isLoading = ref(false)

// 弹窗状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogContent = ref('')

// 表单验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在4到20个字符之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  if (!agreement.value) {
    ElMessage.warning('请先阅读并同意用户协议和隐私政策')
    return
  }
  
  try {
    await registerFormRef.value.validate()
    
    isLoading.value = true
    const userData = {
      username: registerForm.username,
      phone: registerForm.phone,
      password: registerForm.password
    }
    
    const success = await userStore.register(userData)
    
    if (success) {
      ElMessage.success('注册成功，请登录')
      router.push('/login')
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败', error)
  } finally {
    isLoading.value = false
  }
}

// 显示用户协议
const showAgreement = () => {
  dialogTitle.value = '用户协议'
  dialogContent.value = `
    <h3>小红书用户协议</h3>
    <p>欢迎您使用小红书服务！</p>
    <p>本协议是您与小红书之间关于使用小红书服务的协议。在您注册成为小红书用户前，请您仔细阅读本协议的全部内容。如您不同意本协议的任意内容，请勿注册或使用小红书服务。如您点击"注册"按钮，即表示您已充分阅读、理解并接受本协议的全部内容。</p>
    <h4>一、服务内容</h4>
    <p>小红书是一个生活方式分享平台，用户可以在小红书上发布图文、视频等内容，分享生活经验和心得。</p>
    <h4>二、用户行为规范</h4>
    <p>用户在使用小红书服务时，应当遵守中华人民共和国法律法规，不得利用小红书服务从事违法违规行为，包括但不限于...</p>
    <!-- 更多协议内容 -->
  `
  dialogVisible.value = true
}

// 显示隐私政策
const showPrivacy = () => {
  dialogTitle.value = '隐私政策'
  dialogContent.value = `
    <h3>小红书隐私政策</h3>
    <p>小红书非常重视用户的隐私保护，致力于保护用户的个人信息安全。本隐私政策旨在向您说明我们如何收集、使用、存储和共享您的个人信息，以及您如何访问、更新、控制和保护您的个人信息。</p>
    <h4>一、我们收集的信息</h4>
    <p>在您使用小红书服务的过程中，我们可能会收集以下类型的信息：</p>
    <p>1. 您提供的信息：包括但不限于您在注册账户、使用服务过程中提供的个人信息，如姓名、电话号码、电子邮箱等。</p>
    <p>2. 您使用服务时我们获取的信息：包括但不限于设备信息、日志信息、位置信息等。</p>
    <!-- 更多隐私政策内容 -->
  `
  dialogVisible.value = true
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f6f6f6;
  background-image: linear-gradient(135deg, #f6f6f6 0%, #ffffff 100%);
}

.register-container {
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

.register-card {
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

.register-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  border-radius: 4px;
  background-color: #ff2442;
  border-color: #ff2442;
}

.register-button:hover {
  background-color: #e01f3d;
  border-color: #e01f3d;
}

.agreement {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 12px;
  color: #666;
}

.dialog-content {
  max-height: 60vh;
  overflow-y: auto;
  line-height: 1.6;
}

.dialog-content h3 {
  margin-top: 0;
  color: #333;
}

.dialog-content h4 {
  margin-top: 20px;
  color: #333;
}

.dialog-content p {
  margin: 10px 0;
  color: #666;
}

@media screen and (max-width: 768px) {
  .register-container {
    padding: 15px;
  }
  
  .logo h1 {
    font-size: 28px;
  }
  
  .register-button {
    padding: 10px 0;
  }
  
  .dialog-content {
    max-height: 50vh;
  }
}
</style> 