import { request } from './index'

// 笔记相关API
const noteApi = {
  // 获取推荐笔记列表
  getRecommendNotes: async (page = 1, limit = 10) => {
    try {
      return await request.get('/notes/recommend', {
        params: { page, limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 获取关注用户的笔记列表
  getFollowingNotes: async (page = 1, limit = 10) => {
    try {
      return await request.get('/content/getSelfFollowerFeed', {
        params: { current: page, size: limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 获取笔记详情
  getNoteDetail: async (noteId) => {
    try {
      return await request.get(`/content/getContentDetail/${noteId}`)
    } catch (error) {
      throw error
    }
  },

  // 发布笔记
  publishNote: async (noteData) => {
    try {
      // noteData包含标题、内容、图片、标签等
      return await request.post('/notes', noteData)
    } catch (error) {
      throw error
    }
  },

  // 创建笔记内容（新增方法）
  createContent: async (contentData) => {
    try {
      return await request.post('/content/createContent', contentData)
    } catch (error) {
      throw error
    }
  },

  // 上传图片
  uploadImage: async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await request.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // 直接返回图片URL
      if (response && typeof response === 'string') {
        return response;
      } else if (response && response.url) {
        return response.url;
      } else if (response && response.data && response.data.url) {
        return response.data.url;
      } else {
        console.log('上传图片响应:', response);
        throw new Error('无法获取图片URL');
      }
    } catch (error) {
      console.error('上传图片失败:', error);
      throw error;
    }
  },

  // 点赞内容（适配新接口）
  likeNote: async (contentId) => {
    try {
      // 新接口返回Long类型点赞数
      return await request.post(`/content/like/${contentId}`)
    } catch (error) {
      throw error
    }
  },

  // 收藏笔记
  collectNote: async (noteId) => {
    try {
      return await request.post(`/notes/${noteId}/collect`)
    } catch (error) {
      throw error
    }
  },

  // 取消收藏
  uncollectNote: async (noteId) => {
    try {
      return await request.post(`/notes/${noteId}/uncollect`)
    } catch (error) {
      throw error
    }
  },

  // 评论笔记
  commentNote: async (noteId, content) => {
    try {
      return await request.post(`/notes/${noteId}/comment`, { content })
    } catch (error) {
      throw error
    }
  },

  // 获取笔记评论列表
  getNoteComments: async (noteId, page = 1, limit = 20) => {
    try {
      return await request.get(`/notes/${noteId}/comments`, {
        params: { page, limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 删除笔记
  deleteNote: async (noteId) => {
    try {
      return await request.delete(`/notes/${noteId}`)
    } catch (error) {
      throw error
    }
  },

  // 获取用户发布的笔记
  getUserNotes: async (userId, page = 1, limit = 10) => {
    try {
      return await request.get('/content/getSelfPosts', {
        params: { current: page, size: limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 获取用户收藏的笔记
  getUserCollections: async (userId, page = 1, limit = 10) => {
    try {
      return await request.get(`/notes/collections/${userId}`, {
        params: { page, limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 获取用户点赞的笔记
  getUserLikes: async (userId, page = 1, limit = 10) => {
    try {
      return await request.get(`/notes/likes/${userId}`, {
        params: { page, limit }
      })
    } catch (error) {
      throw error
    }
  },

  // 获取题库内容
  getQuestionBank: async (page = 1, limit = 10) => {
    try {
      // 实际项目中应该使用专门的题库API
      // 这里暂时使用推荐接口
      return await request.get('/notes/recommend', {
        params: { page, limit, type: 'question' }
      })
    } catch (error) {
      throw error
    }
  },

  // 创建题目
  createQuestion: async (questionData) => {
    try {
      return await request.post('/question/createQuestion', questionData)
    } catch (error) {
      throw error
    }
  },

  // 分页查询题目列表
  pageQuestionList: async (queryParams) => {
    try {
      return await request.post('/question/pageQuestionList', queryParams)
    } catch (error) {
      throw error
    }
  },

  // 获取题目详情
  getQuestionDetail: async (id) => {
    try {
      return await request.get(`/question/getQuestionDetail/${id}`)
    } catch (error) {
      throw error
    }
  },

  // 获取所有标签列表
  getQuestionTags: async () => {
    try {
      return await request.get('/question/getTags')
    } catch (error) {
      throw error
    }
  },

  // 获取特定标签下的题目列表
  getQuestionsByTag: async (tagId, page = 1, size = 10) => {
    try {
      return await request.get(`/question/getByTag/${tagId}`, {
        params: { page, size }
      })
    } catch (error) {
      throw error
    }
  },

  // 获取上一题/下一题
  getNextQuestion: async (currentId, tagId) => {
    try {
      return await request.get('/question/getNext', {
        params: { currentId, tagId }
      })
    } catch (error) {
      throw error
    }
  },

  getPrevQuestion: async (currentId, tagId) => {
    try {
      return await request.get('/question/getPrev', {
        params: { currentId, tagId }
      })
    } catch (error) {
      throw error
    }
  },
  
  // 获取推荐题目列表
  getRecommendQuestions: async () => {
    try {
      return await request.get('/recommend/questions')
    } catch (error) {
      throw error
    }
  }
}

export default noteApi 