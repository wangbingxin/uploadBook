<template>
  <div class="chapter-list">
    <header>
      <el-menu
        default-active="1"
        mode="horizontal"
        background-color="#545c64"
        active-text-color="#ffd04b">
        <el-menu-item index="1">更新设置</el-menu-item>
        <a @click="$router.back()">
          返回上一级 <i class="el-icon-d-arrow-right"></i>
        </a>
      </el-menu>
    </header>
    <section>
      <div class="el-row" :gutter="24">
        <el-col :span="8">
          <el-upload
            drag
            ref="upload"
            action=""
            :auto-upload="false"
            :on-change="handleChange"> <i class="el-icon-upload"></i>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击选择</em>
            </div>
            <div class="el-upload__tip" slot="tip">只能上传text文件，且不超过10M</div>
          </el-upload>
        </el-col>
        <el-col :span="11">
          <el-form ref="form" :model="form" label-width="100px">
            <el-form-item label="立即更新章节">
              <el-input size="medium" v-model="form.update" style="width: 100px;"></el-input>
            </el-form-item>
            <el-form-item label="VIP开始章节">
              <el-input size="medium" v-model="form.vip" :disabled="isModifyVip" style="width: 100px;"></el-input>
              <a>仅第一次上次可以修改，之后修改</a>
            </el-form-item>
            <el-form-item label="每天更新">
              <el-input size="medium" v-model="form.amount" style="width: 120px;" @change="changeUpdateCount">
                <template slot="append">章</template>
              </el-input>
              <a>每天最多更新3章，次日开始更新</a>
            </el-form-item>
            <el-form-item label="更新时间">
              <el-time-select v-for="(item,index) in updateTime" :key="index"
                v-model="updateTime[index]"
                :picker-options="{
                  start: '00:00',
                  step: '00:30',
                  end: '24:00'
                }"
                placeholder="选择时间"
                style="width: 120px; margin-right: 5px;">
              </el-time-select>
            </el-form-item>
            <el-form-item>
              <el-button type="warning" icon="el-icon-question" size="medium" @click="dialogRulesVisible=true">选择分章规则</el-button>
              <el-button type="success" icon="el-icon-document" size="medium" @click="checkChapter">开始分章</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </div>
      <div class="el-row toolbar" :gutter="24">
        <el-col :span="20">
          <el-form :inline="true">
            <el-form-item>
              <el-select v-model="params.status" size="medium" @change="statusChange">
                <el-option
                    v-for="item in statusOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-select v-model="params.abnormal" size="medium" @change="issueChange" :disabled="params.status==3">
                <el-option
                    v-for="item in issueOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input placeholder="输入章节名称" size="medium" v-model="params.chapter_name" :disabled="params.status==3"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" size="medium" @click="renderTable" :disabled="params.status==3">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="medium" @click="allData">全部</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </div>
      <el-table :data="tempList" class="table" max-height="600">
        <el-table-column prop="chapter_order" label="序号" width="80"></el-table-column>
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <template v-if="scope.row.status==1">
              <el-tag type="info" size="small">已发布</el-tag>
            </template>
            <template v-if="scope.row.status==0">
              <el-tag size="small">未发布</el-tag>
            </template>
            <template v-if="scope.row.status==3">
              <el-tag type="danger" size="small">新增</el-tag>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="chapter_name" label="新章节名称" min-width="200"></el-table-column>
        <el-table-column prop="origin_chapter_name" label="源章节名称" min-width="200">
          <template slot-scope="scope">
            <template v-if="!scope.row.origin_chapter_name">{{'第'+(scope.$index+1)+'章 '+scope.row.chapter_name}}</template>
            <template v-else>{{scope.row.origin_chapter_name}}</template>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="字数"></el-table-column>
        <el-table-column label="章节类型" min-width="120">
          <template slot-scope="scope">{{scope.row.isvip?'vip':'免费'}}</template>
        </el-table-column>
        <el-table-column prop="abnormal_name" label="章节问题原因" min-width="150"></el-table-column>
        <el-table-column label="定时发布时间" min-width="180">
          <template slot-scope="scope">
            {{scope.row.publish_time?getLocalTime(scope.row.publish_time):'立即发布'}}
            <template v-if="scope.row.abnormal==1">
              <template v-if="scope.row.status!=1">
                <el-button type="warning" plain size="mini" @click="showTimingDailog(scope.row,scope.$index)">定时发布</el-button>
              </template>
            </template>
            <template v-else>
              <el-button type="danger" plain size="mini" @click="errPublishAgain(scope.row,scope.$index)">重新发布</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="el-row" :gutter="24">
        <el-button type="danger" :disabled="!newChapterList.length" size="medium" icon="el-icon-check" @click="getChapterInfo">确定发布更新任务</el-button>
      </div>
      <el-dialog title="选择分章规则" :visible.sync="dialogRulesVisible">
        <el-radio-group v-model="rule">
          <el-radio-button :label="0" :value="0">###第一章 作者感言###</el-radio-button>
          <el-radio-button :label="1" :value="1">第1章 作者感言</el-radio-button>
          <el-radio-button :label="2" :value="2">###第1章 作者感言###</el-radio-button>
        </el-radio-group>
      </el-dialog>
      <el-dialog title="定时发布" :visible.sync="dialogTimingVisible" width="30%">
        <el-date-picker
              v-model="time"
              type="datetime"
              placeholder="选择日期时间"
              :picker-options="pickerOptions"></el-date-picker>
        <el-alert title="定时时间请不要早于当前时间" type="error" style="margin-top: 10px;"></el-alert>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogTimingVisible = false">取 消</el-button>
          <el-button type="primary" @click="timingPublish">确 定</el-button>
        </span>
      </el-dialog>
      <el-dialog title="书籍上传进度" :visible.sync="dialogProgressVisible" :show-close="false" :close-on-click-modal="false">
        <el-progress :text-inside="true" :stroke-width="25" :percentage="percentage" status="success"></el-progress>
        <p></p>
        <el-alert title="章节没有上传完成前，请不要关闭或刷新浏览器！" type="error" style="margin-top: 10px;"></el-alert>
      </el-dialog>
    </section>
  </div>
</template>

<script>
import {
  getChapterList,  // 已上传章节
  uploadNewChapter,  // 上传新增章节
  searchBookList,  // 书籍信息
  timingPublishChapter,  // 已上传章节修改定时时间
  errPublishAgain,  // 发布异常重新发布
} from '../api/api'
import { getLocalTime, getDateStr } from '../assets/js/common'
export default {
  name: 'ChapterList',
  data () {
    return {
      chapterList:[],  // 已上传章节
      tempList:[],  // 临时章节
      newChapterList:[],  // 新增章节
      bookInfo:{},  // 书籍信息
      form:{
        update:0,  // 立即更新的章节数
        vip:0,  // vip开始章节
        amount:2
      },
      defaultOrder:0,  // 已上传的章节数
      progress:0,  // 进度索引
      percentage:0,  // 上传进度
      text:'',  // 需上传的内容
      time:'',  // 设置定时的时间
      statusOptions:[
        {
          label:'全部',
          value:0
        },
        {
          label:'已发布',
          value:1
        },
        {
          label:'未发布',
          value:2
        },
        {
          label:'新增',
          value:3
        }   // 章节状态
      ],
      issueOptions:[
        {
          label:'全部',
          value:0
        },
        {
          label:'正常',
          value:1
        },
        {
          label:'异常',
          value:2
        }  // 章节是否正常
      ],
      dialogRulesVisible:false, // 选择分章规则
      dialogTimingVisible:false,  // 选择定时发布时间
      dialogProgressVisible:false,  // 显示进度条
      params:{  // 上传章节参数
        book_id:this.$route.params.book_id,
        status:0,
        abnormal:0,
        chapter_name:''
      },
      isModifyVip:true,  // 是否是首次上传章节，是的话可以设置vip开始章节
      currentItem:{},  // 选中的当前章节信息
      currentIndex:0,  // 选中的当前章节索引
      pickerOptions:{
        disabledDate(time){
          return time.getTime() < Date.now()
        }
      },
      rule:-1,  // 分章规则索引
      ruleList:[  // 分章规则列表
        /###.*###/g,
        // /第.*?章(.*?)+/,  // ###第一章 作者感言###
        /[第][\d]{1,}[章]/g,  // 第1章 作者感言
        /###.*###/g  // ###第1章 作者感言###
      ],
      updateTime:['07:00','17:00'] // 每天定时更新时间
    }
  },
  mounted(){
    this.initTable()
    this.getBookInfo()
  },
  methods:{
    // 时间格式转换 时间戳=>yy-mm-dd hh:mm:ss
    getLocalTime,
    // 获取日期
    getDateStr,
    // 初始化表格
    initTable(){
      getChapterList(this.params).then(res=>{
        if(res.status===204){
          this.isModifyVip=false
        }else{
          if(res.data.code == 200){
            this.tempList=this.chapterList=res.data.data
            this.defaultOrder=res.data.data.length
            for(let i=0;i<res.data.data.length;i++){
              if(res.data.data[i].isvip){
                this.form.vip=i+1
                break;
              }
            }
          }
        }
      })
    },
    // 获取书籍信息(有上传章节需要的参数)
    getBookInfo(){
      searchBookList({
        articleid:this.$route.params.book_id
      }).then(res=>{
        if(res.code ===200){
          this.bookInfo=res.data[0]
        }
      })
    },
    // 重绘表格
    renderTable(){
      getChapterList(this.params).then(res=>{
        if(res.status!=204){
          if(res.data.code == 200){
            this.tempList=this.chapterList=res.data.data
            this.defaultOrder=res.data.data.length
          }
        }else{
          this.tempList=[]
        }
      })
    },
    // 读取文件
    handleChange(file,fileList){
      let _this=this,
          reader=new FileReader()
      if(fileList.length>1){  // 不能选取多个文件
        this.$refs.upload.uploadFiles.splice(0,1)
      }
      if(file.size>1024*1024*10){ // 限制文件大小
        _this.$message.warning('文件过大，请分多次选择')
        _this.$refs.upload.uploadFiles=[]
      }
      reader.onloadstart=function(){  
        if(file.size>1024*1024*10){
          reader.abort()  // 中断读取
        }
      }
      reader.onload=function(){
        _this.text=reader.result  // 获取读取的内容
      }
      reader.readAsText(file.raw)
    },
    // 更新章数改变
    changeUpdateCount(val){
      if(val==1){
        this.updateTime=['17:00']
      }else if(val==2){
        this.updateTime=['07:00','17:00']
      }else if(val==3){
        this.updateTime=['07:00','12:00','17:00']
      }
    },
    // 检测章节
    checkChapter(){
      if(this.text.length!=0){    // 判断是否选择文件
        if(this.form.vip!=0){    // 判断是否设置vip开始章节
          if(this.rule!=-1){
            if(this.newChapterList.length){    // 重新选择文件，置空新增章节列表
              this.newChapterList=[]
            }

            let titleList=this.text.match(this.ruleList[this.rule])    // 截取标题列表
            let contentList=this.text.split(this.ruleList[this.rule])    // 截取内容列表
            
            if(contentList[0].trim()==''){    // 判断首个是否为空章
              contentList.splice(0,1)
            }

            if(titleList.length==contentList.length){    // 判断分解后的章节与内容数量是否相等
              if(this.rule==0 || this.rule==2){
                this.segmentChapter(titleList,contentList)
              }else if(this.rule==1){

                let chapterList = []
                // 处理为数字序号
                titleList.map(item => {
                  chapterList.push(parseInt(item.match(/[\d]{1,}/)[0]))
                })
                // 错误章节数据
                let err = null
                // 重复章节数据
                let repeatChapter = []
                // 错乱章节数据
                let notOrderChapter = []
                // 遍历对比
                for (let i = 0; i < chapterList.length; i++) {
                  // 错乱章节
                  if ((chapterList[i] + 1 != chapterList[i + 1]) && i != chapterList.length - 1) {
                    notOrderChapter.push(chapterList[i])
                  }
                  // 重复章节
                  for (let j = i + 1; j < chapterList.length; j++) {
                    if (chapterList[i] == chapterList[j]) {
                      repeatChapter.push(chapterList[j])
                    }
                  }
                }
                // 本上传工具没有分卷功能，请严格按照章节顺序上传
                
                // 筛选重复章节取其一
                repeatChapter = [...new Set(repeatChapter)]
                // console.log(repeatChapter)
                if(repeatChapter.length){
                  this.$alert(`第${repeatChapter}章存在重复章节！`,'提示')
                  return ;
                }

                // 筛选错乱章节取其一
                notOrderChapter = [...new Set(notOrderChapter)]
                // console.log(notOrderChapter)
                if(notOrderChapter.length){
                  this.$alert(`第${notOrderChapter}章为错乱章节！`,'提示')
                  return ;
                }

                for(let i=0;i<contentList.length;i++){
                  titleList[i]+=contentList[i].slice(0,contentList[i].indexOf('\n'))
                  contentList[i]=contentList[i].slice(contentList[i].indexOf('\n'))
                }
                this.segmentChapter(titleList,contentList)
              }
            }else{
              this.$message.warning('该文件分章错误')
            }
          }else{
            this.$message.warning('请选择分章规则')
          }
        }else{
          this.$message.warning('请设置vip开始章节')
        }
      }else{
        this.$message.warning('请选择文件')
      }
    },
    // 切分章节
    segmentChapter(titleList,contentList){
      let getChapterName=null
      if(this.rule==0 || this.rule==2){
        getChapterName=title=>{
          let str=title.trim()
          return str.slice(str.indexOf('章')+1,-3).trim()
        }
      }else if(this.rule==1){
        getChapterName=title=>{
          return title.slice(title.indexOf('章')+1).trim()
        }
      }
      if(this.chapterList.length){  // 判断新增章节是否上传过
        let repeatChapter=''
        for(let i=0;i<titleList.length;i++){
          for(let j=0;j<this.chapterList.length;j++){
            if(this.chapterList[j].chapter_name.trim()!=''){
              if(getChapterName(titleList[i])==this.chapterList[j].chapter_name){
                repeatChapter+='【'+titleList[i]+'】'
              }
            }
          }
        }
        if(repeatChapter!=''){
          this.$alert(`章节${repeatChapter}已上传过了，请重新确认上传章节！`,'提示')
          return ;
        }
      }
      
      let timeArr=[],
          tempTime='',
          refer=null
      if(this.chapterList.length && !this.chapterList[this.chapterList.length-1].status){
        refer=this.chapterList[this.chapterList.length-1].publish_time*1000
      }else{
        refer=Date.now()
      }
      for(let i=0;i<titleList.length;i++){  // 遍历获取章节更新时间数组
        if(i<this.form.update){
          timeArr[i]=null
        }else{
          for(let j=0;j<this.form.amount;j++){
            tempTime=this.getDateStr(refer,i-this.form.update+1)+' '+this.updateTime[j]
            timeArr.push(Date.parse(new Date(tempTime))/1000)
          }
        }
      }

      for(let i=0;i<titleList.length;i++){  // 给新增章节赋默认值
        let item={},
            origin_order=this.chapterList.length?this.chapterList[this.chapterList.length-1].chapter_order:0
        item.chapter_order=i+1+origin_order
        if(getChapterName(titleList[i])==''){
          item.chapter_name=item.chapter_order
        }else{
          item.chapter_name=getChapterName(titleList[i])
        }
        item.origin_chapter_name=titleList[i]
        item.status=3
        item.chapter_content=contentList[i]
        item.publish_time=timeArr[i]

        if(this.form.vip>this.defaultOrder){  //根据vip开始章节来判断该章节是否是vip章节
          if(i<this.form.vip-this.defaultOrder-1){
            item.isvip=0
          }else{
            item.isvip=1
          }
        }else{
          item.isvip=1
        }
        this.newChapterList.push(item)
      }
      this.tempList=this.chapterList.concat(this.newChapterList)
    },
    // 获取上传章节的参数
    getChapterInfo(){
      for(let i=0;i<this.newChapterList.length-1;i++){
        let prevtime=this.newChapterList[i].publish_time || Date.now()/1000,
            nexttime=this.newChapterList[i+1].publish_time || Date.now()/1000
        if(prevtime>nexttime){
          this.$message.warning('设定的时间必须晚于前面章节发布的时间！')
          return ;
        }
      }
      this.dialogProgressVisible=true
      let params={}
      params.chapter_order=this.newChapterList[this.progress].chapter_order
      params.chapter_name=this.newChapterList[this.progress].chapter_name
      params.chapter_content=this.newChapterList[this.progress].chapter_content
      params.isvip=this.newChapterList[this.progress].isvip
      params.publish_time=this.newChapterList[this.progress].publish_time
      params.book_id=this.bookInfo.articleid
      params.book_name=this.bookInfo.articlename
      params.edit_name=this.bookInfo.edit_name
      params.author=this.bookInfo.author
      this.uploadChapter(params)
    },
    // 上传章节
    uploadChapter(params){
      uploadNewChapter(params).then(res=>{
        if(res.code === 200){
          this.progress++
          this.percentage=parseInt(this.progress/this.newChapterList.length*100)
          if(this.progress<this.newChapterList.length){
            this.getChapterInfo()
          }else{
            this.$message.success('上传成功！')
            this.dialogProgressVisible=false
            this.renderTable()
          }
        }
      })
    },
    // 章节状态的筛选
    statusChange(val){
      if(val==3){
        this.tempList=this.newChapterList
      }else{
        this.params.status=val
        this.renderTable()
      }
    },
    // 章节是否正常的筛选
    issueChange(val){
      this.params.abnormal=val
      this.renderTable()
    },
    // 全部数据
    allData(){
      this.params.status=0
      this.params.abnormal=0
      this.params.chapter_name=''
      this.renderTable()
    },
    // 显示定时框
    showTimingDailog(item,index){
      this.dialogTimingVisible=true
      this.currentItem=item
      this.currentIndex=index
    },
    // 设置定时更新的时间
    timingPublish(){
      let setTime=Date.parse(this.time)/1000
      if(setTime>this.tempList[this.currentIndex-1].publish_time){
        if(this.currentItem.status==0){  // 已上传章节定时发布
          timingPublishChapter({
            draft_id:this.currentItem.draft_id,
            publish_time:setTime,
            isvip:this.currentItem.isvip
          }).then(res=>{
            if(res.code === 200){
              this.dialogTimingVisible=false
              this.$message.success('定时成功！')
              this.tempList[this.currentIndex].publish_time=setTime
            }
          })
        }else if(this.currentItem.status==3){  // 未发布章节定时发布
          this.newChapterList[this.currentIndex-this.defaultOrder].publish_time=setTime
          this.dialogTimingVisible=false
        }
      }else{
        this.$message.warning('设定的时间必须晚于前面章节发布的时间！')
      }
    },
    // 默认更新时间
    defaultTiming(){
      timingPublishChapter({
        draft_id:this.currentItem.draft_id,
        publish_time:setTime,
        isvip:this.currentItem.isvip
      }).then(res=>{
        if(res.code === 200){
          this.dialogTimingVisible=false
          this.$message.success('定时成功！')
          this.tempList[this.currentIndex].publish_time=setTime
        }
      })
    },
    // 发布异常重新发布
    errPublishAgain(item,index){
      errPublishAgain(item.draft_id).then(res=>{
        if(res.code === 200){
          this.$message.success('发布成功')
        }
      })
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
    cursor: pointer;
  }
  header ul a:hover{
    text-decoration: underline;
    color: rgb(255, 208, 75);
  }
  a{
    font-size: 12px;
    color: #878D99;
  }
  .toolbar .el-form-item{
    margin: 0;
  }
</style>