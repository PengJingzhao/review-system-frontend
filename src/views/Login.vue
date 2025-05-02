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
            <h2>用户登录</h2>
            <router-link to="/register">
              <el-button type="text">没有账号？去注册</el-button>
            </router-link>
          </div>
        </template>
        
        <el-form 
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
        >
          <el-form-item label="手机号" prop="phone">
            <el-input 
              v-model="loginForm.phone"
              placeholder="请输入手机号"
              prefix-icon="Iphone"
            />
          </el-form-item>
          
          <el-form-item label="密码" prop="password">
            <el-input 
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item label="验证码" prop="code">
            <div class="verification-code">
              <el-input 
                v-model="loginForm.code"
                placeholder="请输入验证码"
                prefix-icon="Key"
              />
              <el-button 
                type="primary" 
                :disabled="isCountingDown"
                @click="sendVerificationCode"
              >
                {{ countDownText }}
              </el-button>
            </div>
          </el-form-item>
          
          <div class="remember-me">
            <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            <el-button type="text" @click="forgotPassword">忘记密码？</el-button>
          </div>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="login-button" 
              @click="handleLogin"
              :loading="isLoading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="other-login">
          <div class="divider">
            <span>社交账号登录</span>
          </div>
          <div class="social-icons">
            <el-button circle class="social-icon"><el-icon><Promotion /></el-icon></el-button>
            <el-button circle class="social-icon"><el-icon><ChatLineRound /></el-icon></el-button>
            <el-button circle class="social-icon"><el-icon><Apple /></el-icon></el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/userStore'
import { User, Lock, Iphone, Key, Promotion, ChatLineRound, Apple } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import userApi from '../api/user'

// 路由实例
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 表单ref
const loginFormRef = ref(null)

// 表单数据
const loginForm = reactive({
  phone: '',
  password: '',
  code: ''
})

// 记住我选项
const rememberMe = ref(false)

// 加载状态
const isLoading = ref(false)

// 验证码计时器
const countDown = ref(0)
const isCountingDown = ref(false)
const countDownText = ref('获取验证码')

// 表单验证规则
const loginRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在6到20个字符之间', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 发送验证码
const sendVerificationCode = async () => {
  // 验证手机号
  try {
    await loginFormRef.value.validateField('phone')
    
    // 调用发送验证码API
    const res = await userApi.sendVerificationCode(loginForm.phone)
    if (res.code === 0) {
      ElMessage.success('验证码已发送，请注意查收')
      
      // 开始倒计时
      isCountingDown.value = true
      countDown.value = 60
      countDownText.value = `${countDown.value}秒后重新获取`
      
      const timer = setInterval(() => {
        countDown.value--
        countDownText.value = `${countDown.value}秒后重新获取`
        
        if (countDown.value <= 0) {
          clearInterval(timer)
          isCountingDown.value = false
          countDownText.value = '获取验证码'
        }
      }, 1000)
    } else {
      ElMessage.error(res.message || '验证码发送失败')
    }
  } catch (error) {
    // 手机号验证失败
    ElMessage.error('验证码发送失败，请检查手机号是否正确')
    console.error('手机号验证失败', error)
  }
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    
    isLoading.value = true
    const success = await userStore.login(loginForm.phone, loginForm.password, loginForm.code)
    
    if (success) {
      // 如果有重定向URL，跳转到该URL
      const redirectUrl = route.query.redirect || '/home'
      router.push(redirectUrl)
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败', error)
  } finally {
    isLoading.value = false
  }
}

// 忘记密码
const forgotPassword = () => {
  ElMessage.info('忘记密码功能暂未开放，请联系客服')
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

.remember-me {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #666;
}

.verification-code {
  display: flex;
}

.verification-code .el-input {
  flex: 1;
  margin-right: 10px;
}

.verification-code .el-button {
  white-space: nowrap;
}

.other-login {
  margin-top: 30px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.divider::before, .divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 70px);
  height: 1px;
  background-color: #e0e0e0;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  display: inline-block;
  padding: 0 10px;
  background-color: #fff;
  position: relative;
  z-index: 1;
  color: #999;
  font-size: 12px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.social-icon {
  font-size: 20px;
  color: #666;
}
</style> 