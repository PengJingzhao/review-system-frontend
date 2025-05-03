import { createRouter, createWebHistory } from 'vue-router'
import { checkToken } from '../api/index'
import Home from '../views/Home.vue'
import Following from '../views/Following.vue'
import NoteDetail from '../views/NoteDetail.vue'
import QuestionBank from '../views/QuestionBank.vue'
import QuestionDetail from '../views/QuestionDetail.vue'

// 路由懒加载
const Login = () => import('../views/Login.vue')
const PhoneLogin = () => import('../views/PhoneLogin.vue')
const CodeVerify = () => import('../views/CodeVerify.vue')
const Register = () => import('../views/Register.vue')
const UserProfile = () => import('../views/UserProfile.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    redirect: '/home/questionbank'
  },
  {
    path: '/login',
    name: 'Login',
    component: PhoneLogin,  // 默认使用手机号登录页面
    meta: { title: '登录 - 小红书' }
  },
  {
    path: '/login/code',
    name: 'CodeVerify',
    component: CodeVerify,
    props: true,
    meta: { title: '验证码登录 - 小红书' }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: '注册 - 小红书' }
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: 'recommend',
        name: 'recommend',
        component: () => import('../views/Recommend.vue')
      },
      {
        path: 'following',
        name: 'following',
        component: Following
      },
      {
        path: 'questionbank',
        name: 'questionbank',
        component: QuestionBank
      }
    ],
    meta: {
      title: '首页 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/food',
    name: 'Food',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '美食 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/beauty',
    name: 'Beauty',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '美妆 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/movie',
    name: 'Movie',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '影视 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/career',
    name: 'Career',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '职场 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/emotion',
    name: 'Emotion',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '情感 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/home',
    name: 'HomeDecor',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '家居 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '游戏 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/travel',
    name: 'Travel',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '旅行 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/fitness',
    name: 'Fitness',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '健身 - 小红书',
      requiresAuth: true,
      showCategoryNav: true
    }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('@/views/Publish.vue'),
    meta: {
      title: '发布笔记 - 小红书',
      requiresAuth: true,
      showCategoryNav: false
    }
  },
  {
    path: '/publish/note',
    name: 'PublishNote',
    component: () => import('@/views/PublishNote.vue'),
    meta: {
      title: '发布笔记 - 小红书',
      requiresAuth: true,
      showCategoryNav: false
    }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/views/Messages.vue'),
    meta: {
      title: '消息 - 小红书',
      requiresAuth: true,
      showCategoryNav: false
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      title: '个人资料 - 小红书',
      requiresAuth: true,
      showCategoryNav: false
    }
  },
  {
    path: '/note/:id',
    name: 'noteDetail',
    component: NoteDetail,
    props: true,
    meta: { 
      title: '笔记详情 - 小红书', 
      requiresAuth: true,
      showCategoryNav: false
    }
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfile,
    props: true,
    meta: { 
      title: '用户主页 - 小红书', 
      requiresAuth: true,
      showCategoryNav: false
    }
  },
  {
    path: '/question/:id',
    name: 'questionDetail',
    component: QuestionDetail,
    props: true,
    meta: { 
      title: '题目详情',
      requiresAuth: true,
      showCategoryNav: false
    }
  },
  { 
    path: '/:pathMatch(.*)*', 
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面未找到 - 小红书' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 全局前置守卫，处理页面标题和身份验证
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title || '小红书'
  
  // 检查是否需要身份验证
  if (to.meta.requiresAuth) {
    // 使用checkToken方法检查是否有token
    if (!checkToken()) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }
  }
  next()
})

export default router 