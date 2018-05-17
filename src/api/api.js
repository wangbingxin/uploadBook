import axios from 'axios'
import qs from 'qs'

axios.defaults.baseURL = 'http://api.yueloo.com:8004'
axios.defaults.withCredentials = true

// 获取已更新任务列表
export const getUpdatedTaskList = params => { return axios.get('/v1.0/book_update', { params: params }).then(res => res.data); }

// 获取待更新任务列表
export const getNeedUpdateTaskList = params => { return axios.get('/v1.0/book_timing', { params: params }).then(res => res.data); }

// 搜索书籍列表
export const searchBookList = params => { return axios.get('/v1.0/book_search', { params: params }).then(res => res.data); }

// 把书籍设为可拖拽上传
export const setBookDrag = params => { return axios.post('/v1.0/book_drag', qs.stringify(params)).then(res => res.data); }

// 获取书籍章节列表
export const getChapterList = params => { return axios.get('/v1.0/draft_uploaded_chapter_list', { params: params }); }

// 上传新增章节
export const uploadNewChapter = params => { return axios.post(`/v1.0/single_chapter/confirm_the_release_update_task`, qs.stringify(params)).then(res => res.data); }

// 为发布章节定时更新
export const timingPublishChapter = params => { return axios.post(`/v1.0/single_chapter_change`, qs.stringify(params)).then(res => res.data); }

// 定时发布异常，重新发布
export const errPublishAgain = params => { return axios.get(`/v1.0/error_exception_handling/${params}`).then(res => res.data); }
