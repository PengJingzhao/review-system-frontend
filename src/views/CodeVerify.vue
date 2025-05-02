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
            <el-button 
              :icon="ArrowLeft"
              type="text" 
              @click="$router.back()"
              class="back-button"
            />
            <h2>验证码登录</h2>
            <div></div>
          </div>
        </template>
        
        <div class="phone-info">
          验证码已发送至 <span class="phone">{{ formattedPhone }}</span>
        </div>
        
        <el-form 
          ref="codeFormRef"
          :model="codeForm"
          :rules="codeRules"
          label-position="top"
        >
          <el-form-item prop="code">
            <div class="verification-code-input">
              <div 
                v-for="(digit, index) in codeDigits" 
                :key="index" 
                :class="['code-digit', {
                  'active': currentCodeIndex === index,
                  'filled': digit !== ''
                }]"
                @click="focusInput"
              >
                {{ digit }}
              </div>
            </div>
            <input 
              ref="codeInputRef"
              type="tel" 
              v-model="codeForm.code" 
              maxlength="6"
              class="hidden-input"
              @input="handleCodeInput"
              @keydown="handleKeyDown"
              @focus="handleFocus"
              autocomplete="off"
            />
          </el-form-item>
          
          <div class="resend-code">
            <el-button 
              type="text" 
              @click="handleResendCode"
              :disabled="isCountingDown"
            >
              {{ countDownText }}
            </el-button>
          </div>
          
          <el-form-item>
            <el-button 
              type="primary" 
              class="login-button" 
              @click="handleLogin"
              :disabled="codeForm.code.length !== 6 || isLoading"
              :loading="isLoading"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../store/userStore'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 路由实例
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 获取路由参数中的手机号
const phone = computed(() => {
  return route.params.phone || userStore.phone || ''
})

// 格式化手机号显示 (例如: 138****8888)
const formattedPhone = computed(() => {
  if (!phone.value || phone.value.length !== 11) return ''
  return `${phone.value.slice(0, 3)}****${phone.value.slice(7)}`
})

// 表单ref
const codeFormRef = ref(null)
const codeInputRef = ref(null)

// 表单数据
const codeForm = reactive({
  code: ''
})

// 将验证码分成6个数字
const codeDigits = computed(() => {
  const digits = []
  for (let i = 0; i < 6; i++) {
    digits.push(codeForm.code[i] || '')
  }
  return digits
})

// 当前输入焦点位置
const currentCodeIndex = computed(() => codeForm.code.length)

// 加载状态
const isLoading = ref(false)

// 重发验证码倒计时
const isCountingDown = ref(false)
const countDown = ref(60)
const countDownText = computed(() => {
  return isCountingDown.value ? `${countDown.value}秒后重新获取` : '重新获取验证码'
})

// 表单验证规则
const codeRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// 获取输入框焦点
const focusInput = () => {
  if (codeInputRef.value) {
    codeInputRef.value.focus()
  }
}

// 处理验证码输入
const handleCodeInput = (e) => {
  // 确保只能输入数字
  codeForm.code = e.target.value.replace(/\D/g, '').slice(0, 6)
  
  // 如果输入了6位验证码，自动提交
  if (codeForm.code.length === 6) {
    setTimeout(() => {
      handleLogin()
    }, 500)
  }
}

// 处理键盘事件
const handleKeyDown = (e) => {
  // 只允许输入数字和退格键
  if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && 
      e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && !e.ctrlKey && !e.metaKey) {
    e.preventDefault()
  }
}

// 处理输入框获取焦点
const handleFocus = () => {
  // 将光标放在最后
  if (codeInputRef.value) {
    setTimeout(() => {
      codeInputRef.value.selectionStart = codeInputRef.value.selectionEnd = codeForm.code.length
    }, 0)
  }
}

// 重发验证码
const handleResendCode = async () => {
  if (isCountingDown.value) return
  
  try {
    isLoading.value = true
    const res = await userStore.sendCode(phone.value)
    
    if (res) {
      // 开始倒计时
      isCountingDown.value = true
      countDown.value = 60
      
      const timer = setInterval(() => {
        countDown.value--
        
        if (countDown.value <= 0) {
          clearInterval(timer)
          isCountingDown.value = false
        }
      }, 1000)
    }
  } catch (error) {
    console.error('重发验证码失败', error)
  } finally {
    isLoading.value = false
  }
}

// 处理登录
const handleLogin = async () => {
  if (!codeFormRef.value) return
  
  try {
    await codeFormRef.value.validate()
    
    isLoading.value = true
    const success = await userStore.login(phone.value, codeForm.code)
    
    if (success) {
      // 登录成功，跳转到首页或之前尝试访问的页面
      const redirectUrl = route.query.redirect || '/home'
      router.replace(redirectUrl)
    }
  } catch (error) {
    // 表单验证失败
    console.error('表单验证失败', error)
  } finally {
    isLoading.value = false
  }
}

// 组件挂载后启动倒计时
onMounted(() => {
  focusInput()
  
  // 如果是从获取验证码页面跳转过来，启动倒计时
  if (route.params.phone) {
    isCountingDown.value = true
    countDown.value = 60
    
    const timer = setInterval(() => {
      countDown.value--
      
      if (countDown.value <= 0) {
        clearInterval(timer)
        isCountingDown.value = false
      }
    }, 1000)
  }
})
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

.back-button {
  margin-right: 10px;
}

.phone-info {
  text-align: center;
  margin-bottom: 25px;
  color: #666;
  font-size: 14px;
}

.phone {
  color: #333;
  font-weight: 500;
}

.verification-code-input {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.code-digit {
  width: 40px;
  height: 50px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  cursor: text;
  transition: all 0.3s;
}

.code-digit.active {
  border-color: #ff2442;
  box-shadow: 0 0 0 2px rgba(255, 36, 66, 0.2);
}

.code-digit.filled {
  border-color: #ff2442;
  color: #ff2442;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.resend-code {
  text-align: center;
  margin-bottom: 20px;
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