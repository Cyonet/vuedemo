<template>
  <section>
    <!--工具条-->
    <div class="game-header">
      <el-input class="inline-input" v-model="search" icon="Search" placeholder="游戏名称"></el-input>
      <el-select class="inline-input" v-model="Status">
        <el-option
          v-for="i in statusTypes"
          :label="i.l"
          :value="i.v">
        </el-option>
      </el-select>
      <el-button @click="searchHandler">查询</el-button>
      <el-button @click="addHandler">新增</el-button>
    </div>

    <!--列表-->
    <template>
      <el-table :data="List" highlight-current-row v-loading="loading">
        <el-table-column type="index" label="序列">
        </el-table-column>
        <el-table-column prop="VersionsName" inline-template :context="_self" label="版本名称">
          <router-link class="link-router" :to="{name:'temp', params: {id:row.GameID,v:row.VersionsID}}">{{row.VersionsName}}
          </router-link>
        </el-table-column>
        <el-table-column prop="GameUrl" label="地址">
        </el-table-column>
        <el-table-column prop="NickName" label="管理员">
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
            <router-link class="link-router" :to="{ name: 'temp', params: { id: row.GameID,v:row.VersionsID}}">模版
            </router-link>
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
        <el-form-item label="版本名称" prop="VersionsName">
          <el-input v-model="Item.VersionsName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="最大参与人数" prop="MaxJoinNum">
          <el-input-number v-model="Item.MaxJoinNum" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="开始时间" prop="StartTime">
          <el-date-picker type="datetime" placeholder="选择日期" format="yyyy-MM-dd HH:mm:ss"
                          v-model="Item.StartTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="EndTime">
          <el-date-picker type="datetime" placeholder="选择日期" format="yyyy-MM-dd HH:mm:ss"
                          v-model="Item.EndTime"></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="State">
          <el-select v-model="Item.State">
            <el-option
              v-for="i in stateType"
              :label="i.l"
              :value="i.v">
            </el-option>
          </el-select>
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
  mapState
} from 'vuex';

const prefix = "version";

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
      }
    }
  },
  computed: {
    ...mapState({
      AllCount: state => state.Ver.Page.AllCount,
      PageNum: state => state.Ver.Page.Num,
      List: state => state.Ver.List,
      Page: state => state.Ver.Page.Page,
      Item: state => state.Ver.Item,
      Search: state => state.Ver.Search,
      Status: state => state.Ver.Status,
      statusTypes: state => state.statusTypes,
      stateType: state => state.stateType
    })
  },
  created: function () {
    this.$store.commit(motion.NOTICE_UPDATE,{key:["Ver","InitItem","GameID"], value:this.$route.params.id});
    this.$store.commit(motion.NOTICE_UPDATE,{key:["Ver","InitItem","GameToken"], value:this.$route.params.t});
    var $that = this;
    $that.loading = true;
    this.$store.dispatch(prefix+motion.LOADING_DATA).then(() => {
      $that.loading = false;
    }, ()=> {})
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
        $this.$store.dispatch(prefix+motion.DELETE_DATA, row.VersionsID).then(() => {
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
                $this.form.loading = false;
                $this.form.disabled = false;
                NProgress.done();
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
       this.$store.dispatch(prefix+motion.CHANGE_STATE,row.VersionsID).then(()=>{$this.$notify.success({message: Crud.change.suc});},(data)=>{$this.$notify.error({message: data.errmsg})});
    },
    currentChange:function(cur){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["Ver","Page","Page"], value:cur});
    },
    sizeChange:function(size){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["Ver","Page","Num"], value:size});
       this.searchHandler();
    }
  }
}
</script>
