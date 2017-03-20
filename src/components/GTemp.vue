<template>
  <section>
    <!--工具条-->
    <div class="game-header">
      <el-input class="inline-input" v-model="Search" icon="search" placeholder="游戏名称"></el-input>
      <el-select class="inline-input" v-model="Status">
        <el-option
          v-for="i in statusTypes"
          :label="i.l"
          :value="i.v">
        </el-option>
      </el-select>
      <el-button @click="searchHandler">查询</el-button>
      <el-button @click="addTemp">新增</el-button>
    </div>
    <!--列表-->
    <section class="game-grid">
      <template v-if="List.length">
        <div v-for="item in List" class="game-item">
          <el-card :body-style="{padding:0}">
            <div class="img-preview">
              <img :src="item.Data.Background.Path">
              <div class="over-warp">
                <a href="javascript:;" class="btn-preview" :data-id="item.TemplateID"
                   @click="preview(item.PreviewUrl)">预览</a>
              </div>
            </div>
            <div class="content">
              <p class="des">{{item.TemplateName}}</p>
              <div class="bottom">
                <time class="time">{{item.StartTime}}</time>
                <div class="action">
                  <el-button type="text" size="small" class="button" @click="editTemp(item)">编辑</el-button>
                  <el-button type="text" size="small" class="button del-btn" @click="delTemp(item.TemplateID)">删除
                  </el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </template>
      <span v-else>无数据</span>
    </section>
    <!--分页-->
    <el-col :span="24" class="toolbar" style="padding-bottom:10px;">
      <el-pagination :current-page="Page" :page-sizes="[12, 24, 48, 60]" :page-size="PageNum"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="AllCount" style="float:right"
                     @size-change="sizeChange"
                     @current-change="currentChange"
      >
      </el-pagination>
    </el-col>
    <!--编辑框-->
    <el-dialog custom-class="editor-form" size="large" v-model="isShow" @close="closeForm">
      <el-form :model="Item" :rules="formRules" ref="editForm">
        <div class="template-info">
          <el-input placeholder="名称" v-model="Item.TemplateName">
          </el-input>
          <el-upload :action="uploadApi" name="file" type="drag" :multiple="false"
                     :thumbnail-mode="true"
                     :headers="headers"
                     :data="fileType"
                     :on-remove="handleRemove"
                     :on-success="uploadSuccess"
                     :default-file-list="FileList"
          ><i class="el-icon-upload"></i>
            <div class="el-dragger__text">将文件拖到此处，或<em>点击上传</em></div>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
          <div class="flex t-state">
            <el-select v-model="Item.State" placeholder="状态">
              <el-option
                v-for="item in states"
                :label="item.k"
                :value="item.v">
              </el-option>
            </el-select>
            <el-date-picker
              v-model="Item.StartTime"
              type="datetime"
              placeholder="开始时间">
            </el-date-picker>
            <el-date-picker
              v-model="Item.EndTime"
              type="datetime"
              placeholder="结束时间">
            </el-date-picker>
          </div>

          <el-card class="box-card g-card">
            <div slot="header" class="header">
              <span>元素</span>
              <el-button type="text" @click="addFeature">新增</el-button>
            </div>
            <div class="write-box">
              <template v-if="Item.Data && Item.Data.Option">
                <div class="flex" v-for="(option,index) in Item.Data.Option">
                  <a href="javascript:;" @click="delFeature(index)" class="del-feature"><i
                    class="el-icon-delete"></i></a>
                  <el-select placeholder="类别" v-model="option.Type">
                    <el-option
                      v-for="item in types"
                      :label="item.label"
                      :value="item.value">
                    </el-option>
                  </el-select>
                  <template v-if="autoTypes.indexOf(option.Type) != -1 || textTypes.indexOf(option.Type) != -1">
                    <el-select placeholder="字体" v-model="option.Font">
                      <el-option
                        v-for="item in Fonts"
                        :label="item.Name"
                        :value="item.Path">
                      </el-option>
                    </el-select>
                    <el-input v-model="option.FontSize" placeholder="字号">
                    </el-input>
                    <el-input v-model="option.FontColor" placeholder="颜色">
                    </el-input>
                    <el-input v-if="textTypes.indexOf(option.Type) != -1" v-model="option.Content" placeholder="替换内容">
                    </el-input>
                  </template>
                  <template v-else>
                    <template v-if="headerTypes != option.Type">
                      <el-input v-model="option.Content" placeholder="地址">
                      </el-input>
                    </template>
                    <el-input v-model="option.Width" placeholder="限定宽度">
                    </el-input>
                    <el-input v-model="option.Height" placeholder="限定高度">
                    </el-input>
                  </template>
                  <el-input v-model="option.r" placeholder="水平旋转">
                  </el-input>
                  <el-input v-model="option.x" placeholder="水平坐标">
                  </el-input>
                  <el-input v-model="option.y" placeholder="垂直坐标">
                  </el-input>
                </div>
              </template>
            </div>

          </el-card>
        </div>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="warning" @click="closeForm">取 消</el-button>
        <el-button type="info" @click="postTemp" :loading="loading" :disabled="disabled">保存</el-button>
      </div>
    </el-dialog>
    <el-dialog custom-class="preview-box" title="预览" size="small" v-model="isPreview" @close="previewClose">
      <div class="game-header">
        <el-input class="inline-input" v-model="prevStr" placeholder="输入...">
        </el-input>
        <el-button type="warning" @click="preHandler">预览</el-button>
      </div>
      <img :src="tPreViewImg" class="preview-img">
    </el-dialog>
  </section>
</template>
<script>
  import NProgress from 'nprogress'
  import {mapState,mapGetters} from "vuex";
  import {motion, formAction, gameTypes} from "../store/types";
  import {Crud,GameLang} from "../store/lang";

  const prefix = "temp";
  export default {
    data(){
      return {
        isShow:false,
        isPreview:false,
        loading:false,
        disabled:false,
        fileType:{Type:'images'},
        defaultImg:"http://cdn-qn0.jianshu.io/assets/stats2015/zodiac/2-c99d495b6b2a777d8227e535e7b618e4.jpg",
        previewImg:"",
        prevStr:"",
        elOpt:[{label:"字体", value:'/GamePlatform/font/fanzhengxinxiulifanti.ttf'}],
        types:[{label:"参与者名称", value:'_name'},
               {label:"参与者性别", value:'_sex'},
               {label:"头像", value:'_headimg'},
               {label:"文本", value:'text'},
               {label:"图片", value:"img"}],
        states:[{k:'不启用',v:0},{k:'启用',v:1}],
        autoTypes:["_name","_sex"],
        textTypes:["text"],
        headerTypes:"_headimg"
      }
    },
    computed:{
      ...mapState({
        FileList: state => state.Temp.FileList,
        AllCount: state => state.Temp.Page.AllCount,
        PageNum: state => state.Temp.Page.Num,
        List: state => state.Temp.List,
        Item: state => state.Temp.Item,
        Search: state => state.Temp.Search,
        Status: state => state.Temp.Status,
        Page: state => state.Temp.Page.Page,
        statusTypes: state => state.statusTypes,
        stateType: state => state.stateType,
        uploadApi: state=> state.fileUpload
      }),
      ...mapGetters(["headers","tPreViewImg","hasFonts","Fonts"])
    },
    created: function () {
      NProgress.start();
      this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","InitItem","GameID"], value:this.$route.params.id});
      this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","InitItem","VersionsID"], value:this.$route.params.v});
      var $this = this;
      $this.loading = true;
      this.$store.dispatch(prefix+motion.LOADING_DATA).then(() => {
         $this.loading = false;
          NProgress.done();
      }, ()=> {$this.loading = false; NProgress.done();});
    },
    methods:{
      searchHandler:function(){
        const $this = this;
        $this.loading = true;
        this.$store.dispatch(prefix+motion.LOADING_DATA).then(()=>{
           $this.loading = false;
        },()=>{})
      },
      closeForm:function(){
         this.isShow = false;
         this.loading = false;
         this.disabled = false;
      },
      //模版编辑新增初始化
      addTemp:function(){
        if(!this.hasFonts){
           this.$store.dispatch(motion.LOAD_FONTS).then(()=>{},(data)=>{$this.$notify.error({message: data.errmsg})});
        }
        this.$store.commit(prefix+gameTypes.INIT_TEMP);
        this.isShow = true;
      },
      editTemp:function(row){
        if(!this.hasFonts){
           this.$store.dispatch(motion.LOAD_FONTS).then(()=>{},(data)=>{$this.$notify.error({message: data.errmsg})});
        }
        this.$store.commit(prefix+formAction.UPDATE_FORM,row);
        this.isShow = true;
      },
      //提交数据
      postTemp:function(){
        const $this = this;
        this.loading = true;
        this.disabled = true;
        NProgress.start();
        this.$store.dispatch(prefix+motion.ADD_DATA).then(()=>{
          $this.loading = false;
          $this.disabled = false;
          $this.isShow = false;
          $this.$notify.info({message:Crud.save.suc});
          NProgress.done();
        },(data)=>{
           $this.$notify.error({message:data.errmsg});
           $this.loading = false;
           $this.disabled = false;
           NProgress.done();
        });
      },
      //删除
      delTemp:function(id){
         var $this = this;
         this.$confirm(GameLang.tipDel, GameLang.tip, {}).then(() => {
         $this.loading = true;
         NProgress.start();
         $this.$store.dispatch(prefix+motion.DELETE_DATA, id).then(() => {
            NProgress.done();
            $this.loading = false;
            $this.$notify.success({
               message: Crud.del.suc
            });
         }, (rep) => {
            NProgress.done();
            $this.$notify.error({
               message: Crud.del.err
            });
            $this.loading = false;
        });
      },()=> {
      });
      },
      handlePreview:function(){},
      handleRemove:function(){},
      uploadSuccess:function(response){
         console.info(response);
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","Item","Data","Background","Path"], value:response.resultData.Path});
      },
      //需要替换内容
      addFeature:function(){
        this.$store.commit(prefix+gameTypes.ADD_FEATURE);
      },
      delFeature:function(index){
        this.$store.commit(prefix+gameTypes.DEL_FEATURE,index);
      },
      //预览
      preview:function(previewImg){
        this.isPreview = true;
        this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","previewImg"], value:previewImg});
      },
      preHandler:function(){
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","prevStr"], value:this.prevStr});
      },
      previewClose:function(){
        this.isPreview = false;
        this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","previewImg"], value:this.defaultImg});
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","prevStr"], value:""});
      },
      currentChange:function(cur){
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","Page","Page"], value:cur});
         this.searchHandler();
      },
      sizeChange:function(size){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["Temp","Page","Num"], value:size});
       this.searchHandler();
      },
    }
  }

</script>
<style lang="scss">
  @import "../sass/Game.scss";
</style>
