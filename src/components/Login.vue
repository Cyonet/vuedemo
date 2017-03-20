<template>
  <div class="login-page">
    <el-form :model="user" :rules="rules" ref="userLogin" class="card-box login-form">
      <h3 class="login-title">系统登录</h3>
      <span class="login-tips" v-if="loginInfo.isSuccess">{{loginInfo.msg}}</span>
      <el-form-item prop="account">
        <el-input type="text" v-model="user.account" auto-complete="off" placeholder="账号" @change="accountChange"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password" v-model="user.password" auto-complete="off" placeholder="密码"></el-input>
      </el-form-item>
      <el-checkbox v-model="checked" checked class="login-check">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button type="primary" style="width:100%;" @click.native.prevent="loginHandler">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {login,constants} from '../store/types'
  import {mapState} from 'vuex';
  import Vue from 'vue';
  import util from "util/util"
  export default {
    data() {
      return {
        user: {
          isAuto:false,
          account: '',
          password: ''
        },
        rules: {
          account: [
            { required: true, message: '请输入账号', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
          ]
        },
        checked: true,
      };
    },
    created:function(){
       const user = util.getStorage(constants.USER_INFO_KEY);
       if(user){
         this.user.account = user.UserName;
         this.user.password = util.decryAES(user.PassWord,this.aesKey);
         this.user.isAuto = true;
       }
    },
    computed:{
      ...mapState(['loginInfo','aesKey'])
    },
    methods: {
      accountChange(){
         this.user.isAuto = false;
         this.user.password = "";
      },
      loginHandler(ev) {
        var $this= this;
        this.$refs.userLogin.validate((valid) => {
          if (valid) {
             var user = {};
             user.UserName =  $this.user.account;
             user.PassWord = $this.user.isAuto?$this.user.password:util.encryMD5($this.user.password);
             $this.$store.dispatch(login.LOGIN, user).then((data)=>{
                user.PassWord = util.encryAES(user.PassWord, $this.aesKey);
                util.setStorage({key:constants.USER_INFO_KEY,data:user}, true);
                $this.$router.replace(decodeURIComponent($this.$route.query.redirect||'/g'));
             },()=>{console.info('fail')});
          }
          else{
             store.commit(login.LOGIN_FAIL,{msg:'密码或用户名不能为空'})
          }
        });
      }
    }
  }
</script>

<style lang="sass">
  .login-page
    width: 100%
    height: 100%
    background: #324057
    padding-top: 120px
    text-align: center
    .login-form
      display: inline-block
      width: 350px
      padding: 35px 35px 15px 35px
    .card-box
      border-radius: 5px
      background-clip: padding-box
      background-color: #F9FAFC
    .login-title
      padding: 0 0 20px
      margin: 0
      color: #324057
    .login-check
      display: block
      text-align: left
      margin: 0 0 30px
    .login-tips
      font-size: 12px
      padding: 5px
      width: 100%
      display: inline-block
      color: #FF4949

</style>
