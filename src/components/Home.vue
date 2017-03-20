<template>
  <section>
  <div class="flex flex-vert home">
    <div class="panel p-header flex">
      <div class="logo">
        <a href="#/w">
          <img src="../images/logo.png">
          <span>谈资</span>
        </a>
      </div>
      <div class="flex-item-1 user-action">
        <el-dropdown @command="userHandler">
          <div class="user-info">
            <img src="../images/protrait.jpg" class="protrait">
            <span>{{user.NikeName}}</span>
            <i class="el-icon-caret-bottom"></i>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="setting"><i class="el-icon-setting"></i>设置</el-dropdown-item>
            <el-dropdown-item divided command="logout"><i class="el-icon-upload2"></i>退出</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div class="panel p-content flex-item-1 flex">
      <aside class="p-menu">
        <g-nav :router="router" :mode="mode" :theme="theme" :menu="menu" @menuClose="handleClose" @menuOpen="handleOpen"
               :active="active" :isAdmin="isAdmin"></g-nav>
      </aside>
      <section class="p-main flex flex-item-1 flex-vert">
        <div class="crumb">
          <strong style="width:200px;float:left;">{{currentPathName}}</strong>
          <el-breadcrumb separator="/" style="float:right;">
            <el-breadcrumb-item v-if="currentPathNameParent">{{currentPathNameParent}}</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentPathName!=''">{{currentPathName}}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="flex-item-1">
          <transition name="fade">
            <router-view></router-view>
          </transition>
        </div>
      </section>
    </div>
  </div>
  <el-dialog title="设置" v-model="isShow" size="full">
    <el-form :model="Info" label-width="100px" :rules="userRules" ref="editForm" v-if="form.isAdd">
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
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeForm">取 消</el-button>
      <el-button type="primary" @click="saveHandler" :loading="form.loading" :disabled="form.disabled">保存</el-button>
    </div>
  </el-dialog>
    </section>
</template>
<style lang="scss">
  @import "../sass/home.scss";
</style>
<script>
  import {mapState,mapGetters} from 'vuex'
  import GNav from './GNav.vue'
  import {login,motion} from '../store/types'
  export default {
    data:function(){
    let vEmail = (r,v,c) =>{
        let reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if(reg.test(v)){
           return c();
        }
          return c(new Error("输入正确的邮箱"))
    };
      return {
        currentPathName:"游戏",
        currentPathNameParent:"",
        active:'/g',
        mode:'vertical',
        theme:'dark',
        router:true,
        menu:[{
           index:'/fa',
           icon:'el-icon-menu',
           msg:"游戏工厂",
           isAdmin:true
        },{
           index:'/g',
           icon:'el-icon-menu',
           msg:"游戏管理",
        },{
           index:'/f',
           icon:'el-icon-picture',
           msg:"资源"
        },{
           index:'/u',
           icon:'el-icon-star-off',
           msg:"用户",
           isAdmin:true
        },{
           index:'/w',
           icon:'el-icon-document',
           msg:"公众号",
        }],
        isShow:false,
        form:{
           loading:false,
           disabled:false
        },
        addRules:{
        Email:[{ validator: vEmail, trigger: 'blur' }],
        NickName:[{required: true, message: '请输入密码', trigger: 'blur'}]
      }
      }
    },
    computed:{
      ...mapState({
        Info:state => state.User.Info,
        user:state => state.login
      }),
      ...mapGetters(['isAdmin'])
    },
    watch: {
		   '$route' (to, from) {//
			    this.currentPathName=to.meta.zh;
			    this.currentPathNameParent=to.matched[0].meta.zh;
			    this.active = to.path;
		   }
	  },
	  created:function(){
	    this.active = this.$route.path;
	  },
    methods: {
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      closeForm:function(){
      this.isShow = false;
      this.form.loading = false;
      this.form.disabled = false;
    },
    saveHandler: function () {
      var $this = this;
      $this.$refs.editForm.validate((valid) => {
        if (valid) {
            $this.form.loading = true;
            $this.form.disabled = true;
            NProgress.start();
            $this.$store.dispatch("user"+motion.EDIT_DATA).then(
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
    },
      userHandler(type){
        const $this = this;
        switch(type){
          case "logout":
             this.$store.dispatch(login.LOGOUT).then(()=>{
                $this.$store.commit(login.REST_STATE);
                $this.$router.go('/login');
             },()=>{

             });
             break;
          case "setting":
             console.info("setting");
             this.$store.dispatch("user"+motion.LOADING_DATA).then(()=>{
                this.isShow = true;
             },()=>{

             });
             break;
          default:
        }
      },
      closeForm(){},
      saveHandler(){}

    },
    components:{
      GNav
    }
  }


</script>
