import axios from 'axios'
import userApi from './user'
import noteApi from './note'

// 创建axios实例
const request = axios.create({
  // 设置基础URL为统一网关地址
  baseURL: 'http://10.21.32.95:30618/api',
  timeout: 10000 // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token并添加到请求头中
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 只返回实际数据部分
    return response.data
  },
  error => {
    // 处理错误情况，例如401未授权
    if (error.response && error.response.status === 401) {
      // 清除token，重定向到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 检查token是否存在的方法
const checkToken = () => {
  return !!localStorage.getItem('token')
}

export { request, userApi, noteApi, checkToken } 