import { defineStore } from 'pinia'
import noteApi from '../api/note'
import { ElMessage } from 'element-plus'

// 定义笔记Store
export const useNoteStore = defineStore('note', {
  state: () => ({
    recommendNotes: [],
    followingNotes: [],
    currentNote: null,
    noteComments: [],
    isLoading: false,
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
    tabType: 'recommend' // 'recommend' 或 'following'
  }),
  
  getters: {
    displayNotes: (state) => {
      return state.tabType === 'recommend' ? state.recommendNotes : state.followingNotes
    },
    
    // 是否还有更多数据
    hasMoreNotes: (state) => state.currentPage < state.totalPages
  },
  
  actions: {
    // 设置当前标签类型
    setTabType(type) {
      this.tabType = type
      this.currentPage = 1
      this.fetchNotes()
    },
    
    // 获取笔记列表（推荐或关注）
    async fetchNotes(page = 1) {
      this.isLoading = true
      try {
        const fetchMethod = this.tabType === 'recommend' 
          ? noteApi.getRecommendNotes 
          : noteApi.getFollowingNotes
        
        const res = await fetchMethod(page, this.pageSize)
        
        if (res.code === 0) {
          const { list, totalPages } = res.data
          
          // 根据当前页码决定是追加还是替换数据
          if (page === 1) {
            this[`${this.tabType}Notes`] = list
          } else {
            this[`${this.tabType}Notes`] = [...this[`${this.tabType}Notes`], ...list]
          }
          
          this.currentPage = page
          this.totalPages = totalPages
        } else {
          ElMessage.error(res.message || '获取笔记列表失败')
        }
      } catch (error) {
        console.error('获取笔记列表失败', error)
        ElMessage.error('网络错误，请稍后重试')
      } finally {
        this.isLoading = false
      }
    },
    
    // 加载更多笔记
    loadMoreNotes() {
      if (this.hasMoreNotes && !this.isLoading) {
        this.fetchNotes(this.currentPage + 1)
      }
    },
    
    // 获取笔记详情
    async fetchNoteDetail(noteId) {
      this.isLoading = true
      try {
        const res = await noteApi.getNoteDetail(noteId)
        if (res) {
          // 将API返回的like和likeCount字段映射到isLiked和likes字段
          this.currentNote = {
            ...res,
            isLiked: res.like,
            likes: res.likeCount
          }
        } else {
          ElMessage.error('获取笔记详情失败')
        }
      } catch (error) {
        console.error('获取笔记详情失败', error)
        ElMessage.error('网络错误，请稍后重试')
        this.currentNote = null
      } finally {
        this.isLoading = false
      }
    },
    
    // 获取笔记评论
    async fetchNoteComments(noteId, page = 1) {
      this.isLoading = true
      try {
        const res = await noteApi.getNoteComments(noteId, page, 20)
        if (res.code === 0) {
          if (page === 1) {
            this.noteComments = res.data.list
          } else {
            this.noteComments = [...this.noteComments, ...res.data.list]
          }
        } else {
          ElMessage.error(res.message || '获取评论失败')
        }
      } catch (error) {
        console.error('获取评论失败', error)
        ElMessage.error('网络错误，请稍后重试')
      } finally {
        this.isLoading = false
      }
    },
    
    // 发布笔记
    async publishNote(noteData) {
      this.isLoading = true
      try {
        const res = await noteApi.publishNote(noteData)
        if (res.code === 0) {
          ElMessage.success('发布成功')
          return res.data
        } else {
          ElMessage.error(res.message || '发布失败')
          return null
        }
      } catch (error) {
        console.error('发布笔记失败', error)
        ElMessage.error('网络错误，请稍后重试')
        return null
      } finally {
        this.isLoading = false
      }
    },
    
    // 点赞笔记
    async likeNote(noteId) {
      try {
        await noteApi.likeNote(noteId)
        // 更新本地状态
        this.updateNoteInList(noteId, { isLiked: true, likeCount: (this.findNote(noteId)?.likeCount || 0) + 1 })
      } catch (error) {
        ElMessage.error('点赞失败，请稍后重试')
      }
    },
    
    // 取消点赞笔记
    async unlikeNote(noteId) {
      try {
        await noteApi.unlikeNote(noteId)
        // 更新本地状态
        this.updateNoteInList(noteId, { isLiked: false, likeCount: Math.max((this.findNote(noteId)?.likeCount || 1) - 1, 0) })
      } catch (error) {
        ElMessage.error('取消点赞失败，请稍后重试')
      }
    },
    
    // 评论笔记
    async commentNote(noteId, content) {
      try {
        const res = await noteApi.commentNote(noteId, content)
        if (res.code === 0) {
          ElMessage.success('评论成功')
          // 更新评论列表
          this.noteComments = [res.data, ...this.noteComments]
          // 更新笔记评论数
          this.updateNoteInList(noteId, { commentCount: (this.findNote(noteId)?.commentCount || 0) + 1 })
          return true
        } else {
          ElMessage.error(res.message || '评论失败')
          return false
        }
      } catch (error) {
        ElMessage.error('评论失败，请稍后重试')
        return false
      }
    },
    
    // 辅助方法：查找笔记
    findNote(noteId) {
      return this.recommendNotes.find(note => note.id === noteId) || 
             this.followingNotes.find(note => note.id === noteId) ||
             (this.currentNote?.id === noteId ? this.currentNote : null)
    },
    
    // 辅助方法：更新列表中的笔记
    updateNoteInList(noteId, updateData) {
      // 更新推荐列表中的笔记
      const recommendIndex = this.recommendNotes.findIndex(note => note.id === noteId)
      if (recommendIndex !== -1) {
        this.recommendNotes[recommendIndex] = { 
          ...this.recommendNotes[recommendIndex], 
          ...updateData 
        }
      }
      
      // 更新关注列表中的笔记
      const followingIndex = this.followingNotes.findIndex(note => note.id === noteId)
      if (followingIndex !== -1) {
        this.followingNotes[followingIndex] = { 
          ...this.followingNotes[followingIndex], 
          ...updateData 
        }
      }
      
      // 更新当前笔记
      if (this.currentNote?.id === noteId) {
        this.currentNote = { ...this.currentNote, ...updateData }
      }
    }
  }
}) 