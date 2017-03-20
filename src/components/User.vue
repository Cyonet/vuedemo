<template>
  <section>
    <template v-if="isAdmin">
      <!--工具条-->
      <div class="game-header">
        <el-input class="inline-input" v-model="Search" icon="search" placeholder="账号"></el-input>
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
          <el-table-column prop="Account" label="用户">
          </el-table-column>
          <el-table-column prop="Email" label="邮箱">
          </el-table-column>
          <el-table-column prop="NikeName" label="昵称">
          </el-table-column>
          <el-table-column prop="Phone" label="手机" sortable>
          </el-table-column>
          <el-table-column prop="State" label="状态" :formatter="swapStatus" sortable>
          </el-table-column>
          <el-table-column prop="SuperAdmin" label="是否管理员" :formatter="swapIsAdmin" sortable>
          </el-table-column>
          <el-table-column inline-template :context="_self" width="220" label="操作">
            <div>
              <el-button type="info" size="small" @click="editHandle(row)">更改</el-button>
              <el-button type="danger" size="small" @click="delHandle(row)">删除</el-button>
              <el-button type="warning" size="small" @click="changeState(row)">{{swapStatus(row)}}</el-button>
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
    </template>
    <template v-else>
      <div>您当前不是管理员，无权限操作当前模块！</div>
    </template>
    <el-dialog :title="Title" v-model="isShow" :close-on-click-modal="false" @close="closeForm">
      <el-form :model="Info" label-width="100px" :rules="addRules" ref="addForm" v-if="form.isAdd">
        <el-form-item label="账号" prop="Account">
          <el-input v-model="Info.Account" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="PassWord">
          <el-input type="password" v-model="Info.PassWord" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="Email">
          <el-input v-model="Info.Email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="昵称" prop="NickName">
          <el-input v-model="Info.NickName" :min="0"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="Phone">
          <el-input v-model="Info.Phone" :min="0"></el-input>
        </el-form-item>

      </el-form>
      <el-form v-else :model="EPwd" label-width="100px" :rules="pwdRules" ref="pwdForm">
        <el-form-item label="账号" prop="Account">
          <el-input v-model="EPwd.Account" :disabled="true" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="newPassword_1">
          <el-input type="password" v-model="EPwd.newPassword_1" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="newPassword_2">
          <el-input type="password" v-model="EPwd.newPassword_2" auto-complete="off"></el-input>
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

const prefix = "user";

export default {
  data() {
    let vAccount = (r,v,c) =>{
       if(!v){return c(new Error('账号不能为空'))}
       if(!/[a-zA-Z0-9]{4,8}/.test(v)){
         return c(new Error("账号只能为4到8位的英文字符或数字"))
       }
       c();
    };
    let vEmail = (r,v,c) =>{
        let reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if(reg.test(v)){
           return c();
        }
          return c(new Error("输入正确的邮箱"))
    };
    let vPhone = (r,v,c)=>{
        let reg = /^[1][0-9]{10}$/;
        if(reg.test(v)){
           return c();
        }
        return c(new Error("输入正确的手机号码"))
    };
    let vPass2 = (r, v, c) => {
        if (v === '') {
          c(new Error('请再次输入密码'));
        } else if (v !== this.EPwd.newPassword_1) {
          c(new Error('两次输入密码不一致!'));
        } else {
          c();
        }
     };
    return {
      loading:false,
      stateType:[{l:"激活",v:1},{l:"未激活",v:0}],
      form:{
        isAdd:true,
        loading:false,
        disabled:false
      },
      Title:"",
      isShow:false,
      addRules:{
        Account:[{ validator: vAccount, trigger: 'blur' }],
        PassWord:[{required: true, message: '请输入密码', trigger: 'blur' },{ min: 6, max: 12, message: '密码长度为6-12位', trigger: 'blur' }],
        Email:[{ validator: vEmail, trigger: 'blur' }],
        Phone:[{ validator: vPhone, trigger: 'blur' }]
      },
      pwdRules:{
        newPassword_1:[{required: true, message: '请输入密码', trigger: 'blur' },{ min: 6, max: 12, message: '密码长度为6-12位', trigger: 'blur' }],
        newPassword_2:[{ validator: vPass2, trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapState({
      List: state => state.User.List,
      Page: state => state.User.Page,
      statusTypes: state => state.statusTypes,
      Info: state => state.User.Info,
      EPwd: state => state.User.EPwd,
      Search:state => state.User.Search,
      Status:state => state.User.Status
    }),
    ...mapGetters(['isAdmin'])
  },
  created: function () {
    NProgress.start();
    var $that = this;
    $that.loading = true;
    this.$store.dispatch(prefix+motion.INIT_DATA).then(() => {
      $that.loading = false;
      NProgress.done();
    }, ()=> {$that.loading = false;NProgress.done();})
  },
  methods: {
    swapStatus: function (row, column) {
      if(!row){return {};}
      const state = (column? row.State :!row.State)||0;
      return _.find(this.stateType,function(item){
         return item.v == state;
      }).l;
    },
    swapIsAdmin:function(row, column){
      return column? "是":"否";
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
        $this.$store.dispatch(prefix+motion.DELETE_DATA,row.AdminID).then(() => {
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
      this.formTitle = GameLang.pwd;
      this.form.isAdd = false;
      this.isShow = true;
      this.$store.commit(prefix+motion.CHANGE_A_PSW,{AdminID:row.AdminID,Account:row.Account});
    },
    //edit
    saveHandler: function () {
      var $this = this;
      if($this.form.isAdd){//添加
        $this.$refs.addForm.validate((valid) => {
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
      }else{
        $this.$refs.pwdForm.validate((valid) => {
        if (valid) {
            $this.form.loading = true;
            $this.form.disabled = true;
            NProgress.start();
            $this.$store.dispatch(prefix+motion.CHANGE_A_PSW).then(
             ()=>{
                $this.form.loading = false;
                $this.form.disabled = false;
                $this.isShow = false;
                NProgress.done();
                $this.$notify.success({message: Crud.change.suc});
             },(data)=>{
                NProgress.done();
                $this.form.loading = false;
                $this.form.disabled = false;
                $this.$notify.error({message: data.errmsg})
             }
            );

        }
      });
      }


    },
    //显示新增界面
    addHandler: function () {
      const $this = this;
      this.Title = GameLang.add;
      this.form.isAdd = true;
      this.$store.commit(prefix+motion.REST_STATE);
      this.isShow = true;
    },
    searchHandler: function () {
       const $this = this;
       $this.loading = true;
       this.$store.dispatch(prefix+motion.INIT_DATA).then(()=>{
           $this.loading = false;
       },()=>{})
    },
    changeState:function(row){
       const $this = this;
       this.$store.dispatch(prefix+motion.CHANGE_STATE,row.AdminID).then(()=>{$this.$notify.success({message: Crud.change.suc});},(data)=>{$this.$notify.error({message: data.errmsg})});
    },
    currentChange:function(cur){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["User","Page","Page"], value:cur});
    },
    sizeChange:function(size){
       this.$store.commit(motion.NOTICE_UPDATE,{key:["User","Page","Num"], value:size});
       this.searchHandler();
    }
  }
}


</script>
