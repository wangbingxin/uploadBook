import Vue from 'vue'
import Router from 'vue-router'
import TaskList from '@/views/taskList.vue'
import ChapterList from '@/views/chapterList.vue'
import BookList from '@/views/bookList.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TaskList',
      component: TaskList
    },
    {
      path: '/book-list',
      name: 'BookList',
      component: BookList
    },
    {
      path: '/chapter-list/:book_id',
      name: 'ChapterList',
      component: ChapterList
    }
  ]
})
