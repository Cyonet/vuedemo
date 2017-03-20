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
      <el-button  @click="addHandler">新增</el-button>
    </div>

    <!--列表-->
    <template>
      <el-table :data="List" highlight-current-row v-loading="loading">
        <el-table-column prop="GameName" inline-template :context="_self" label="游戏名称">
          <router-link class="link-router" :to="{name:'version', params: {id: row.GameID,t:row.GameToken}}">{{row.GameName}}</router-link>
        </el-table-column>
        <el-table-column prop="GameIcon" inline-template :context="_self" label="游戏图标">
          <img :src="row.GameIcon">
        </el-table-column>
        <el-table-column prop="GameUrl" label="地址">
        </el-table-column>
        <el-table-column prop="JoinNum" label="当前参与人数">
        </el-table-column>
        <el-table-column prop="MaxJoinNum" label="最大参数人数" sortable>
        </el-table-column>
        <el-table-column prop="StartTime" label="开始时间" sortable>
        </el-table-column>
        <el-table-column prop="EndTime" label="结束时间" sortable>
        </el-table-column>
        <el-table-column prop="State" label="状态" :formatter="swapStatus" sortable>
          <el-tag :type="row.State == 0 ? 'gray' : 'success'" close-transition>{{row.State}}</el-tag>
        </el-table-column>
        <el-table-column inline-template :context="_self" width="220" label="操作">
					<div>
          <router-link class="link-router" :to="{name:'version', params: {id: row.GameID,t:row.GameToken}}">版本</router-link>
					<el-button type="info" size="small" @click="editHandle(row)">编辑</el-button>
					<el-button type="danger" size="small" @click="delHandle(row)">删除</el-button>
					<el-button type="warning" size="small" @click="changeState(row)">{{swapStatus(row)}}</el-button>
				  </div>
        </el-table-column>
      </el-table>
    </template>

    <!--分页-->
    <el-col :span="24" class="toolbar" style="padding-bottom:10px;">
      <el-pagination :current-page="Page" :page-sizes="[5, 10, 20, 50]" :page-size="PageNum"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="AllCount" style="float:right"
                     @size-change="sizeChange"
                     @current-change="currentChange"
      >
      </el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog :title="formTitle" v-model="isShow" :close-on-click-modal="false" @close="closeForm">
      <el-form :model="Item" label-width="100px" :rules="formRules" ref="editForm">
        <el-form-item label="游戏工厂" prop="GameToken">
          <el-select v-model="Item.GameToken" placeholder="请选择">
            <el-option
              v-for="opt in FList"
              :label="opt.FactoryName"
              :value="opt.GameToken">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="游戏名称" prop="GameName">
          <el-input v-model="Item.GameName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="游戏图标" prop="GameIcon">
          <el-input v-model="Item.GameIcon" auto-complete="off"></el-input>
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
        <el-form-item label="最大参与人数" prop="MaxJoinNum">
          <el-input-number v-model="Item.MaxJoinNum"  :min="0" ></el-input-number>
        </el-form-item>
        <el-form-item label="开始时间" prop="StartTime">
          <el-date-picker type="datetime" placeholder="选择日期" v-model="Item.StartTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="EndTime">
          <el-date-picker type="datetime" placeholder="选择日期" v-model="Item.EndTime"></el-date-picker>
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
  formAction,
  gameTypes
} from "../store/types";
import {
  mapState,
  mapGetters
} from 'vuex';

const prefix = "game";

export default {
  data() {
    return {
      isShow: false,
      formTitle: '',
      loading: false,
      row: {},
      upload:{
        loading:false,
        disabled:false
      },
      form:{
        loading:false,
        disabled:false
      },
      fileType:{Type:'images'}
    }
  },
  computed: {
    ...mapState({
      AllCount: state => state.Game.Page.AllCount,
      PageNum: state => state.Game.Page.Num,
      List: state => state.Game.List,
      FList: state => state.Game.FList,
      Item: state => state.Game.Item,
      Page: state => state.Game.Page.Page,
      statusTypes: state => state.statusTypes,
      stateType: state => state.stateType,
      uploadApi: state=> state.fileUpload,
      Search:state => state.Game.Search,
      Status:state => state.Game.Status
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
      $that.$store.dispatch(prefix+gameTypes.LOAD_FACTORY);
    }, ()=> {$that.loading = false;NProgress.done();});
  },
  methods: {
    swapStatus: function (row, column) {
      const state = column? row.State :!row.State;
      return _.find(this.stateType,function(item){
         return item.v == state;
      }).l;
    },
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
        $this.$store.dispatch(prefix+motion.DELETE_DATA, row.GameID).then(() => {
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
    //show
    editHandle: function (row) {
      this.formTitle = GameLang.edit;
      this.isShow = true;
      this.row = Object.assign({},row);
      this.$store.commit(prefix+formAction.UPDATE_FORM, row);
    },
    //edit
    saveHandler: function () {
      var $this = this;
      $this.$refs.editForm.validate((valid) => {
        if (valid) {
            $this.form.loading = true;
            $this.form.disabled = true;
            NProgress.start();
            $this.$store.dispatch(prefix+motion.ADD_DATA, $this.row).then(
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
    //显示新增界面
    addHandler: function () {
      const $this = this;
      this.formTitle = GameLang.add;
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
    changeState:function(row){
       const $this = this;
       this.$store.dispatch(prefix+gameTypes.CHANGE_STATE,row.GameID).then(()=>{$this.$notify.success({message: Crud.change.suc});},(data)=>{$this.$notify.error({message: data.errmsg})});
    },
    currentChange:function(cur){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["Game","Page","Page"], value:cur});
       this.searchHandler();
    },
    sizeChange:function(size){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["Game","Page","Num"], value:size});
       this.searchHandler();
    },
    uploadStart:function(){
       this.upload.loading = true;
       this.upload.disabled = true;
    },
    uploadSuccess:function(response){
       this.upload.loading = false;
       this.upload.disabled = false;
       this.$store.commit(motion.NOTICE_UPDATE,{key:["Game","Item","GameIcon"], value:response.resultData.Path});
    }
  }
}

</script>
