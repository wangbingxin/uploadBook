<template>
  <div class="task-list">
    <header>
      <el-menu
        default-active="1"
        mode="horizontal"
        background-color="#545c64"
        active-text-color="#ffd04b">
        <el-menu-item index="1">更新任务</el-menu-item>
      </el-menu>
    </header>
    <section>
      <div class="el-row" :gutter="24">
        <el-col :span="12">
          <el-switch
            v-model="status"
            active-text="已更新"
            inactive-text="待更新"
            active-color="#409eff"
            inactive-color="#409eff"
            :active-value="1"
            :inactive-value="0">
          </el-switch>
        </el-col>
        <el-col :span="12" style="text-align: right;">
          <el-form :inline="true">
            <el-form-item>
              <el-input placeholder="输入书籍ID/书名" size="medium" v-model="keywords"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="medium" @click="searchData">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" icon="el-icon-plus" size="medium" @click="$router.push('/book-list')">添加更新任务</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </div>
      <el-table :data="taskList" class="table">
        <el-table-column type="index" width="50"></el-table-column>
        <el-table-column label="更新时间" width="200">
          <template slot-scope="scope">
            <template v-if="!status">
              <template v-if="getTime(scope.row.this_time)">
                <span>{{getTime(scope.row.this_time)}}</span>后自动更新<br>
              </template>
              <template v-else>
                <b>定时发书失败</b><br>
              </template>
              本次：{{getLocalTime(scope.row.this_time)}}<br>
              <template v-if="scope.row.next_time">
                下次：{{getLocalTime(scope.row.next_time)}}
              </template>
            </template>
            <template v-else>
              <span>{{getTime(scope.row.this_time)}}</span>前更新于<br>
              {{getLocalTime(scope.row.this_time)}}
            </template>
          </template>
        </el-table-column>
        <el-table-column label="书籍" min-width="250">
          <template slot-scope="scope">
            [{{scope.row.articleid}}] <span>{{scope.row.articlename}}</span><br>
            作者：{{scope.row.author}}
          </template>
        </el-table-column>
        <el-table-column label="本次更新章节" min-width="250">
          <template slot-scope="scope">
            <span>{{scope.row.this_chapter_total}}</span> ({{scope.row.this_chapter_name}})<br>
            已有章节：{{scope.row.publish_chapter_total}}<br>
            <template v-if="!status">剩余待更：{{scope.row.timing_chapter_total}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="edit_name" label="计划任务人" width="150"></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="warning" size="small" @click="$router.push('/chapter-list/'+scope.row.articleid)">修改计划</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="el-row" :gutter="24" style="text-align: right;">
        <el-pagination
          @current-change="handleCurrentChange"
          :current-page.sync="params.page"
          :page-size="params.page_size"
          layout="total, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </section>
  </div>
</template>

<script>
import {
  getNeedUpdateTaskList,  // 待更新
  getUpdatedTaskList  // 已更新
} from '../api/api'
import { getLocalTime } from '../assets/js/common'
export default {
  name: 'TaskList',
  data () {
    return {
      taskList:[],
      status:0, // 0-待更新 1-已更新
      keywords:'',
      total:0,
      params:{
        page:1,
        page_size:15
      }
    }
  },
  watch:{
    'status':'statusChange'
  },
  mounted(){
    this.renderTable()
  },
  methods:{
    // 时间格式
    getLocalTime,
    // 渲染表格数据
    renderTable(){
      if(this.status){
        getUpdatedTaskList(this.params).then(res=>{
          if(res.code === 200){
            this.taskList=res.data.books
            this.total=res.data.total
          }
        })
      }else{
        getNeedUpdateTaskList(this.params).then(res=>{
          if(res.code === 200){
            this.taskList=res.data.books
            this.total=res.data.total
          }
        })
      }
    },
    // 切换更新状态
    statusChange(){
      this.params.page=1
      this.keywords=''
      if(this.params.articlename){
        delete this.params.articlename
      }
      if(this.params.articleid){
        delete this.params.articleid
      }
      this.renderTable()
    },
    // 查询书籍或书号
    searchData(){
      if(this.keywords.trim()!=''){
        if(isNaN(this.keywords)){
          this.params.articlename=this.keywords
          this.renderTable()
        }else{
          this.params.articleid=this.keywords
          this.renderTable()
        }
      }
      return;
    },
    // 分页
    handleCurrentChange(val){
      this.params.page=val
      this.renderTable()
    },
    // 倒计时计算
    getTime(time){
      let timeDistance
      if(!this.status){
        timeDistance=time-Date.parse(new Date())/1000
      }else{
        timeDistance=Date.parse(new Date())/1000-time
      }
      
      if(timeDistance>0 && timeDistance<=60){
        return `${timeDistance}秒`
      }else if(timeDistance>60 && timeDistance<60*60){
        return `${parseInt(timeDistance/60)}分${timeDistance%60}秒`
      }else if(timeDistance>60*60 && timeDistance<24*60*60){
        return `${parseInt(timeDistance/60/60)}时${parseInt((timeDistance%3600)/60)}分${timeDistance%3600%60}秒`
      }else if(timeDistance>24*60*60){
        return `${parseInt(timeDistance/60/60/24)}天${parseInt(timeDistance%(24*3600)/60/60)}时${parseInt(timeDistance%(24*3600)%3600/60)}分${timeDistance%(24*3600)%3600%60}秒`
      }else if(timeDistance<0){
        return false;
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
  .el-row .el-form-item{
    margin-bottom: 0;
  }
  span{
    color: #66b1ff;
    font-weight: bold;
  }
  b{
    color: #FA5555;
  }
</style>

