<template>
  <section>
    <div class="game-header">
      <el-button @click="addHandler">新增</el-button>
    </div>
    <!--列表-->
    <template>
      <el-table :data="List" highlight-current-row v-loading="loading">
        <el-table-column type="index" label="序列">
        </el-table-column>
        <el-table-column prop="Name" label="字体">
        </el-table-column>
        <el-table-column prop="Path" label="路径">
        </el-table-column>
        <el-table-column inline-template :context="_self" label="操作">
          <div>
            <el-button type="text"  @click="delHandle(row)">删除</el-button>
          </div>
        </el-table-column>
      </el-table>
    </template>

    <!--分页-->
    <el-col :span="24" class="toolbar" style="padding-bottom:10px;">
      <el-pagination :current-page="Page" :page-sizes="[5, 10, 20, 50]" :page-size="PageNum"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="AllCount" style="float:right"
                     @sizeChange="sizeChange"
                     @currentChange="currentChange"
      >
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog :title="formTitle" v-model="isShow" :close-on-click-modal="false" @click="closeForm">
      <el-form :model="Item" label-width="100px" :rules="formRules" ref="editForm">
        <el-form-item label="字体名称" prop="Name">
          <el-input v-model="Item.Name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="路径" prop="Path">
          <el-input v-model="Item.Path" auto-complete="off"></el-input>
          <el-upload
            :action="uploadApi"
            :headers="headers"
            :data="fileType"
            name="file"
            :on-success="uploadSuccess"
            :on-progress="uploadStart"
            :show-upload-list="false">
            <el-button size="small" type="primary" :loading="upload.loading" :disabled="upload.disabled">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeForm">取 消</el-button>
        <el-button type="primary" @click="saveHandler" :loading="form.loading" :disabled="form.disabled">保存</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import NProgress from 'nprogress'
import * as _ from 'lodash'
import {GameLang, Crud} from "../store/lang"
import {
  motion,
  formAction
} from "../store/types";
import {
  mapState,
  mapGetters
} from 'vuex';

const prefix = "font";

export default {
  data() {
    return {
      isShow: false,
      loading: false,
      upload:{
        loading:false,
        disabled:false
      },
      form:{
        loading:false,
        disabled:false
      },
      fileType:{Type:'ttf'},
    }
  },
  computed: {
    ...mapState({
      AllCount: state => state.Font.Page.AllCount,
      PageNum: state => state.Font.Page.Num,
      List: state => state.Font.List,
      Item: state => state.Font.Item,
      Page: state => state.Font.Page.Page,
      uploadApi: state=> state.fileUpload
    }),
    ...mapGetters(['headers'])
  },
  created: function () {
    var $that = this;
    $that.loading = true;
    this.$store.dispatch(prefix+motion.LOADING_DATA).then(() => {
      $that.loading = false;
    }, ()=> {})
  },
  methods: {
    //delete
    delHandle: function (row) {
      var $this = this;
      this.$confirm(GameLang.tipDel, GameLang.tip, {}).then(() => {
        $this.loading = true;
        NProgress.start();
        $this.$store.dispatch(prefix+motion.DELETE_DATA, row.FontID).then(() => {
          NProgress.done();
          $this.loading = false;
          $this.$notify.success({
            message: Crud.del.suc
          });
        }, (rep) => {
          $this.$notify.error({
            message: Crud.del.err
          });
          $this.loading = false;
        })
      },()=> {
      });
    },
    //edit
    saveHandler: function () {
      var $this = this;
      $this.$refs.editForm.validate((valid) => {
        if (valid) {
            $this.form.loading = true;
            $this.form.disabled = true;
            NProgress.start();
            $this.$store.dispatch(prefix+motion.ADD_DATA).then(
             ()=>{
                $this.form.loading = false;
                $this.form.disabled = false;
                $this.isShow = false;
                NProgress.done();
                $this.$notify.success({message: Crud.save.suc});
             },(data)=>{
                NProgress.done();
                $this.$notify.error({message: data.errmsg})
             }
            );

        }
      });

    },
    closeForm:function(){
       this.form.loading = false;
       this.form.disabled = false;
       this.isShow = false;
    },
    //显示新增界面
    addHandler: function () {
      this.$store.commit(prefix+formAction.REST_FORM);
      this.isShow = true;
    },
    reload: function () {
       const $this = this;
       $this.loading = true;
       this.$store.dispatch(prefix+motion.LOADING_DATA).then(()=>{
           $this.loading = false;
       },()=>{})
    },
    currentChange:function(cur){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["Font","Page","Page"], value:cur});
        this.reload()
    },
    sizeChange:function(size){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["Font","Page","Num"], value:size});
       this.reload();
    },
    uploadStart:function(){
       this.upload.loading = true;
       this.upload.disabled = true;
    },
    uploadSuccess:function(response){
       this.upload.loading = false;
       this.upload.disabled = false;
       if(response.error){
         this.$notify.error({message: response.errmsg})
       }
       else{
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Font","Item","Path"], value:response.resultData.Path});
       }

    }
  }
}


</script>
