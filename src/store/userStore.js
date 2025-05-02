import { defineStore } from 'pinia'
import userApi from '../api/user'
import { ElMessage } from 'element-plus'

// 定义用户Store
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    phone: localStorage.getItem('phone') || '',
    isLoading: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    userPhone: (state) => state.phone
  },
  
  actions: {
    // 发送验证码
    async sendCode(phone) {
      this.isLoading = true
      try {
        const res = await userApi.sendVerificationCode(phone)
        if (res) {
          // 保存手机号
          this.phone = phone
          localStorage.setItem('phone', phone)
          ElMessage.success('验证码发送成功')
          return res
        } else {
          ElMessage.error('验证码发送失败')
          return null
        }
      } catch (error) {
        ElMessage.error('验证码发送失败，请检查网络连接')
        return null
      } finally {
        this.isLoading = false
      }
    },
    
    // 登录操作
    async login(phone, code) {
      this.isLoading = true
      try {
        const token = await userApi.login(phone, code)
        if (token && typeof token === 'string') {
          this.token = token
          this.phone = phone
          localStorage.setItem('phone', phone)
          ElMessage.success('登录成功')
          return true
        } else {
          ElMessage.error('登录失败，验证码可能已过期')
          return false
        }
      } catch (error) {
        ElMessage.error('登录失败，请检查网络连接')
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    // 注册操作
    async register(userData) {
      this.isLoading = true
      try {
        const res = await userApi.register(userData)
        if (res.code === 0) {
          ElMessage.success('注册成功，请登录')
          return true
        } else {
          ElMessage.error(res.message || '注册失败')
          return false
        }
      } catch (error) {
        ElMessage.error('注册失败，请检查网络连接')
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      if (!this.token) return
      
      this.isLoading = true
      try {
        const res = await userApi.getUserInfo(this.userId)
        if (res.code === 0) {
          this.userInfo = res.data
          // 更新localStorage
          localStorage.setItem('userInfo', JSON.stringify(res.data))
        }
      } catch (error) {
        console.error('获取用户信息失败', error)
      } finally {
        this.isLoading = false
      }
    },
    
    // 退出登录
    logout() {
      this.token = ''
      this.phone = ''
      localStorage.removeItem('token')
      localStorage.removeItem('phone')
      ElMessage.success('已退出登录')
    },
    
    // 更新用户信息
    updateUserInfo(newInfo) {
      this.userInfo = { ...this.userInfo, ...newInfo }
      localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
    }
  }
}) 