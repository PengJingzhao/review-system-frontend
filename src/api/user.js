import { request } from './index'

// 用户相关API
const userApi = {
  // 用户登录 - 使用手机号和验证码登录
  login: async (phone, code) => {
    try {
      const res = await request.post('/user/login', { phone, code })
      // 登录成功后保存token到localStorage
      if (res && typeof res === 'string') {
        localStorage.setItem('token', res)
      }
      return res
    } catch (error) {
      throw error
    }
  },

  // 发送验证码
  sendVerificationCode: async (phone) => {
    try {
      return await request.get(`/user/sendCode/${phone}`)
    } catch (error) {
      throw error
    }
  },

  // 用户注册
  register: async (userData) => {
    try {
      return await request.post('/user/register', userData)
    } catch (error) {
      throw error
    }
  },

  // 获取用户信息
  getUserInfo: async (userId) => {
    try {
      return await request.get('/user/getUser')
    } catch (error) {
      throw error
    }
  },

  // 获取用户动态
  getUserFeeds: async (userId, page = 1, limit = 10) => {
    try {
      return await request.get(`/user/${userId}/feeds`, {
        params: { page, limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 关注用户
  followUser: async (userId) => {
    try {
      return await request.post(`/user/follow/${userId}`)
    } catch (error) {
      throw error
    }
  },

  // 取消关注用户
  unfollowUser: async (userId) => {
    try {
      return await request.post(`/user/unfollow/${userId}`)
    } catch (error) {
      throw error
    }
  },

  // 获取关注列表
  getFollowings: async (userId, page = 1, limit = 20) => {
    try {
      return await request.get(`/user/${userId}/followings`, {
        params: { page, limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 获取粉丝列表
  getFollowers: async (userId, page = 1, limit = 20) => {
    try {
      return await request.get(`/user/${userId}/followers`, {
        params: { page, limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 退出登录
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
}

export default userApi 