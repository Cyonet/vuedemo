<template>
  <el-menu :default-active="active" :theme="theme" :mode="mode" :router="router">
    <template v-for="item in menu">
      <template v-if="item.subs">
        <el-submenu :index="item.index" v-if="item.isAdmin?isAdmin:true">
          <template slot="title"><i v-if="item.icon" :class="item.icon"></i>{{item.msg}}</template>
          <template v-for="sub in item.subs">
            <el-menu-item :index="sub.index" v-if="sub.isAdmin?isAdmin:true">{{sub.msg}}</el-menu-item>
          </template>
        </el-submenu>
      </template>
      <template v-else>
        <el-menu-item :index="item.index" v-if="item.isAdmin?isAdmin:true"><i v-if="item.icon" :class="item.icon"></i>{{item.msg}}</el-menu-item>
      </template>
    </template>
  </el-menu>
</template>
<style>
</style>
<script>
  export default{
     props:{
        router:Boolean,
        active:String,
        mode:String,
        theme:String,
        menu:Array,
        isAdmin:Boolean
     },
     method:{
        handleClose:function(){
          console.info(11);
          this.$emit('menuClose');
        },
        handleOpen:function(){
          this.$emit('menuOpen');
        }

     }

  }


</script>
