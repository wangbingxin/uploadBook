<template>
  <div class="book-list">
    <header>
      <el-menu
        default-active="1"
        mode="horizontal"
        background-color="#545c64"
        active-text-color="#ffd04b">
        <el-menu-item index="1">选择书籍</el-menu-item>
        <router-link to="/">返回任务列表<i class="el-icon-d-arrow-right"></i></router-link>
      </el-menu>
    </header>
    <section>
      <div class="el-row" :gutter="24">
        <el-form :inline="true">
          <el-form-item>
            <el-input placeholder="输入书籍ID/书名" size="medium" v-model="keywords"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="medium" @click="searchBook">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="bookList" class="table">
        <el-table-column prop="articleid" label="书号" width="100"></el-table-column>
        <el-table-column prop="articlename" label="书名" min-width="150"></el-table-column>
        <el-table-column prop="author" label="作家"></el-table-column>
        <el-table-column prop="chapters" label="已更新章节" min-width="150"></el-table-column>
        <el-table-column prop="lastchapter" label="最近更新章节" min-width="250"></el-table-column>
        <el-table-column label="是否有任务" min-width="150">
          <template slot-scope="scope">
            {{scope.row.jobs?scope.row.jobs:'否'}}
          </template>
        </el-table-column>
        <el-table-column prop="size" label="总字数"></el-table-column>
        <el-table-column label="新建时间" min-width="180">
          <template slot-scope="scope">
            {{getLocalTime(scope.row.postdate)}}
          </template>
        </el-table-column>
        <el-table-column prop="address" label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="warning" size="small" @click="updateTask(scope.row)">修改任务</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script>
import {
  searchBookList,
  setBookDrag
} from '../api/api'
import { getLocalTime } from '../assets/js/common'
export default {
  name: 'BookList',
  data () {
    return {
      bookList:[],
      keywords:'',
      params:{}
    }
  },
  mounted(){
    this.renderTable()
  },
  methods:{
    getLocalTime,
    renderTable(){
      searchBookList(this.params).then(res=>{
        if(res.code === 200){
          this.bookList=res.data
        }
      })
    },
    searchBook(){
      if(this.keywords.trim()!=''){
        if(isNaN(this.keywords)){
          delete this.params.articleid
          this.params.articlename=this.keywords
          this.renderTable()
        }else{
          delete this.params.articlename
          this.params.articleid=this.keywords
          this.renderTable()
        }
      }
    },
    updateTask(item){
      if(item.can_drag){
        this.$router.push('/chapter-list/'+item.articleid)
      }else{
        this.$confirm('确定将该书籍设置为拖拽上传书籍吗？设置之后书籍将只能通过拖拽上传，请通知作者不要再更新该书籍。','提示').then(()=>{
          setBookDrag({
            articleid:item.articleid
          }).then(res=>{
            if(res.code === 200){
              this.$router.push('/chapter-list/'+item.articleid)
            }
          })
        })
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  header ul{
    padding: 0 40px;
  }
  header ul a{
    float: right;
    color: #fff;
    font-size: 12px;
    margin-top: 20px;
    text-decoration: none;
  }
  header ul a:hover{
    text-decoration: underline;
    color: rgb(255, 208, 75);
  }
  .el-row .el-form-item{
    margin-bottom: 0;
  }
</style>
