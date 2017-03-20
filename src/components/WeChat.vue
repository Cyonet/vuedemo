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
      <el-button  @click="searchHandler">查询</el-button>
      <el-button  @click="addHandler">设置</el-button>
    </div>

    <!--列表-->
    <template>
      <el-table :data="List" highlight-current-row v-loading="loading">
        <el-table-column prop="AppID" label="AppID"></el-table-column>
        <el-table-column prop="WechatName" label="名称">
        </el-table-column>
        <el-table-column prop="NickName" label="管理员">
        </el-table-column>
        <el-table-column prop="AppSecrect" label="AppSecrect" sortable>
        </el-table-column>
        <el-table-column prop="Qrcode" inline-template :context="_self" label="二维码">
          <img :src="row.Qrcode">
        </el-table-column>
        <el-table-column inline-template :context="_self" width="220" label="操作">
					<div>
					<el-button type="info" size="small" @click="jsSign(row)">签名</el-button>
					<el-button type="danger" size="small" @click="delHandle(row)">删除</el-button>
				  </div>
        </el-table-column>
      </el-table>
    </template>

    <!--分页-->
    <el-col :span="24" class="toolbar" style="padding-bottom:10px;">
      <el-pagination :current-page="Page.Page" :page-sizes="[5, 10, 20, 50]" :page-size="Page.PageNum"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="Page.AllCount" style="float:right"
                     @size-change="sizeChange"
                     @current-change="currentChange"
      >
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog title="设置" v-model="isShow" :close-on-click-modal="false" @close="closeForm">
      <el-form :model="Item" label-width="100px" :rules="formRules" ref="editForm">
        <el-form-item label="名称" prop="WechatName">
          <el-input v-model="Item.WechatName"></el-input>
        </el-form-item>
        <el-form-item label="AppID" prop="AppID">
          <el-input v-model="Item.AppID" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="AppSecret" prop="AppSecret">
          <el-input v-model="Item.AppSecret" ></el-input>
        </el-form-item>
        <el-form-item label="二维码地址" prop="Qrcode">
          <el-input v-model="Item.Qrcode"></el-input>
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
import {GameLang, Crud} from "../store/lang"
import {
  motion,
  formAction
} from "../store/types";
import {
  mapState,
  mapGetters
} from 'vuex';

const prefix = "wechat";

export default {
  data() {
    return {
      isShow: false,
      loading: false,
      form:{
        loading:false,
        disabled:false
      },
      upload:{
        loading:false,
        disabled:false
      },
      fileType:{Type:'images'},
    }
  },
  computed: {
    ...mapState({
      Page: state => state.WeChat.Page,
      List: state => state.WeChat.List,
      Item: state => state.WeChat.Item,
      statusTypes: state => state.statusTypes,
      Search:state => state.WeChat.Search,
      Status:state => state.WeChat.Status,
      uploadApi: state=> state.fileUpload
    }),
    ...mapGetters(['headers'])
  },
  created: function () {
    NProgress.start();
    var $that = this;
    $that.loading = true;
    this.$store.dispatch(prefix+motion.LOADING_DATA).then(() => {
      $that.loading = false;
      NProgress.done();
    }, ()=> {$that.loading = false;NProgress.done();})
  },
  methods: {
    closeForm:function(){
      this.isShow = false;
      this.form.loading = false;
      this.form.disabled = false;
    },
    //delete
    delHandle: function (row) {
      var $this = this;
      this.$confirm(GameLang.tipDel, GameLang.tip, {}).then(() => {
        $this.loading = true;
        NProgress.start();
        $this.$store.dispatch(prefix+motion.DELETE_DATA, {AdminID: row.AdminID,AppID:[row.AppID]}).then(() => {
          NProgress.done();
          $this.loading = false;
          $this.$notify.success({
            message: Crud.del.suc
          });
        }, (rep) => {
          $this.$notify.error({
            message: Crud.del.err
          });
          $this.listLoading = false;
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
                $this.form.loading = false;
                $this.form.disabled = false;
                $this.$notify.error({message: data.errmsg})
             }
            );

        }
      });

    },
    jsSign: function(row){
      var $this = this;
      NProgress.start();
      $this.$store.dispatch(prefix+motion.CHANGE_STATE, {AdminID: row.AdminID,AppID:row.AppID}).then(() => {
          NProgress.done();
          $this.$notify.success({
            message: "签名成功"
          });
        }, (rep) => {
          $this.$notify.error({
            message: "签名失败"
          });
        });
    },
    //显示新增界面
    addHandler: function () {
      this.$store.commit(prefix+formAction.REST_FORM);
      this.isShow = true;
    },
    searchHandler: function () {
       const $this = this;
       $this.loading = true;
       this.$store.dispatch(prefix+motion.LOADING_DATA).then(()=>{
           $this.loading = false;
       },()=>{})
    },
    currentChange:function(cur){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["WeChat","Page","Page"], value:cur});
    },
    sizeChange:function(size){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["WeChat","Page","Num"], value:size});
       this.searchHandler();
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
         this.$store.commit(motion.NOTICE_UPDATE,{key:["WeChat","Item","Qrcode"], value:response.resultData.Path});
       }

    }
  }
}

</script>
