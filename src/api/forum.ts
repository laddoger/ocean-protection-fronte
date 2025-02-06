import request from '@/utils/request'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface User {
  id: number
  username: string
  avatar?: string
}

export interface Post {
  id: number
  userId: number
  title: string
  content: string
  imageUrl?: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdTime: string
  updatedTime: string
  deleted: boolean
  user?: User
  comments?: ForumComment[]
  showComments?: boolean
  isLiked?: boolean
}

export interface ForumComment {
  id: number
  postId: number
  userId: number
  content: string
  createdTime: string
  updatedTime: string
  user?: User
}

export interface CreatePostData {
  title: string
  content: string
}

export const forumApi = {
  // 获取帖子列表
  getPosts: () => 
    request.get<ApiResponse<Post[]>>('/forum/posts'),
  
  // 上传图片
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post<ApiResponse<string>>('/forum/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 发布帖子
  createPost: (data: { title: string; content: string; image?: File }) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', data.content)
    if (data.image) {
      formData.append('image', data.image)
    }
    return request.post<ApiResponse<Post>>('/forum/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
    
  // 更新帖子
  updatePost: (id: number, data: { title: string; content: string; image?: File }) => {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', data.content)
    if (data.image) {
      formData.append('image', data.image)
    }
    
    return request.put<ApiResponse<Post>>(`/forum/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 删除帖子
  deletePost: (id: number) =>
    request.delete<ApiResponse<void>>(`/forum/posts/${id}`),
  
  // 获取评论列表
  getComments: (postId: number) => 
    request.get<ApiResponse<Comment[]>>(`/forum/posts/${postId}/comments`),
  
  // 添加评论
  addComment: (postId: number, content: string) =>
    request.post<ApiResponse<Comment[]>>(`/forum/posts/${postId}/comments/add`, { content }),
    
  // 点赞/取消点赞
  toggleLike: (postId: number) => 
    request.post<ApiResponse<void>>(`/forum/posts/${postId}/like`),
  
  // 更新帖子评论数
  updatePostCommentCount: (postId: number) =>
    request.get<ApiResponse<Post>>(`/forum/posts/${postId}`)
} 