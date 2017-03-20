<template>
  <el-tabs @tab-click="tabHandler" class="factory-tabs">
    <el-tab-pane label="工厂列表" name="factory">
      <!--工具条-->
      <div class="game-header">
        <el-input class="inline-input" v-model="Factory.Search" icon="search" placeholder="工厂名称"></el-input>
        <el-select class="inline-input" v-model="Factory.Status">
          <el-option
            v-for="i in fStatus"
            :label="i.l"
            :value="i.v">
          </el-option>
        </el-select>
        <el-button @click="factorSearch">查询或刷新</el-button>
      </div>
      <template>
        <el-table :data="Factory.List" highlight-current-row v-loading="fLoading">
          <el-table-column prop="FactoryCategory" label="类型">
          </el-table-column>
          <el-table-column prop="FactoryName" label="名称">
          </el-table-column>
          <el-table-column prop="FactoryDetailsImg" inline-template :context="_self" label="介绍图">
            <img :src="row.FactoryDetailsImg">
          </el-table-column>
          <el-table-column prop="FactoryIcon" inline-template :context="_self" label="图标">
            <img :src="row.FactoryIcon">
          </el-table-column>
          <el-table-column prop="FactoryIntroduce" label="介绍">
          </el-table-column>
          <el-table-column prop="FactorySketch" label="简述" sortable>
          </el-table-column>
          <el-table-column inline-template :context="_self" prop="Online" label="状态" sortable>
            <el-tag :type="row.Online == 0 ? 'gray' : 'success'" close-transition>{{row.Online?"上线":"未上线"}}</el-tag>
          </el-table-column>
        </el-table>
      </template>
      <!--分页-->
      <el-col :span="24" class="toolbar" style="padding-bottom:10px;">
        <el-pagination :current-page="Factory.Page.Page" :page-sizes="[5, 10, 20, 50]" :page-size="Factory.Page.PageNum"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="Factory.Page.AllCount" style="float:right"
                       @size-change="fSizeCg"
                       @current-change="fCurrCg"
        >
        </el-pagination>
      </el-col>
    </el-tab-pane>
    <el-tab-pane label="授权列表" name="auth">
      <!--工具条-->
      <div class="game-header">
        <el-input class="inline-input" v-model="Auth.Search" icon="search" placeholder="游戏名称"></el-input>
        <el-select class="inline-input" v-model="Auth.Status">
          <el-option
            v-for="i in aStatus"
            :label="i.l"
            :value="i.v">
          </el-option>
        </el-select>
        <el-button @click="authSearch">查询或刷新</el-button>
        <el-button @click="addNewAuth">设置新的授权</el-button>
      </div>
      <template>
        <el-table :data="Auth.List" highlight-current-row v-loading="aLoading">
          <el-table-column prop="FactoryName" label="工厂名称">
          </el-table-column>
          <el-table-column prop="NickName" label="授权用户">
          </el-table-column>
          <el-table-column prop="MaxGameNum" label="游戏个数" sortable>
          </el-table-column>
          <el-table-column prop="MaxJoinNum" label="最大参与人数" sortable>
          </el-table-column>
          <el-table-column prop="StartTime" label="开始时间" sortable>
          </el-table-column>
          <el-table-column prop="EndTime" label="结束时间" sortable>
          </el-table-column>
          <el-table-column inline-template :context="_self" width="120" label="操作">
            <div>
              <el-button type="warning" size="small" @click="cancelAuth(row)">取消授权</el-button>
            </div>
          </el-table-column>
        </el-table>
      </template>
      <!--分页-->
      <el-col :span="24" class="toolbar" style="padding-bottom:10px;">
        <el-pagination :current-page="Auth.Page.Page" :page-sizes="[5, 10, 20, 50]" :page-size="Auth.Page.PageNum"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="Auth.Page.AllCount" style="float:right"
                       @size-change="authSizeCg"
                       @current-change="authCurrCg"
        >
        </el-pagination>
      </el-col>

      <el-dialog title="授权" v-model="isShow" :close-on-click-modal="false" @close="closeAuthForm">
        <el-form :model="AuthFactory" label-width="100px"   ref="authForm">
          <el-form-item label="用户" prop="AdminID">
            <el-select v-model="AuthFactory.AdminID" placeholder="请选择授权用户">
              <el-option
                v-for="opt in Users"
                :label="opt.Account"
                :value="opt.AdminID">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="工厂" prop="GameToken">
            <el-select v-model="AuthFactory.GameToken" placeholder="请选择授权用户">
              <el-option
                v-for="op in Factories"
                :label="op.FactoryName"
                :value="op.GameToken">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="最大游戏数" prop="MaxGameNum">
            <el-input-number v-model="AuthFactory.MaxGameNum" :min="1"></el-input-number>
          </el-form-item>
          <el-form-item label="最大参与数" prop="MaxJoinNum">
            <el-input-number v-model="AuthFactory.MaxJoinNum" :min="10000"></el-input-number>
          </el-form-item>
          <el-form-item label="开始时间" prop="StartTime">
            <el-date-picker type="datetime" placeholder="选择日期" v-model="AuthFactory.StartTime"></el-date-picker>
          </el-form-item>
          <el-form-item label="结束时间" prop="EndTime">
            <el-date-picker type="datetime" placeholder="选择日期" v-model="AuthFactory.EndTime"></el-date-picker>
          </el-form-item>
          <el-form-item label="是否试用" prop="Trial">
            <el-switch
              v-model="AuthFactory.Trial"
              on-color="#13ce66"
              off-color="#ff4949">
            </el-switch>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeAuthForm">取 消</el-button>
          <el-button type="primary" @click="authToUser" :loading="authForm.postLoading" :disabled="authForm.postDisabled">授权
          </el-button>
        </div>
      </el-dialog>
    </el-tab-pane>
  </el-tabs>
</template>
<script>
  import NProgress from 'nprogress';
  import {motion,factory} from "../store/types";
  import {mapState, mapGetters} from 'vuex';

  const prefix = "fact";

  export default {
     data(){
       return {
          fLoading:false,
          aLoading:false,
          isShow:false,
          authForm:{
            postLoading:false,
            postDisabled:false
          },
          fStatus:[{l:'全部',v:'all'},{l:'上架', v:'online'},{l:'下架',v:'offline'}],
          aStatus:[{l:'全部',v:'all'},{l:'未开始', v:'notstart'},{l:'进行中',v:'beginning'},{l:'已结束',v:'end'},{l:'正式',v:'formal'},{l:'试用',v:'trial'}],
       }
     },
     computed:{
       ...mapState({
          Factory: state => state.Factory.Factory,
          Auth: state => state.Factory.Auth,
          AuthFactory: state => state.Factory.AuthFactory,
       }),
       ...mapGetters(['Users','Factories','hasUsers','hasFactories'])
     },
     created: function () {
        this.factorSearch();
     },
     methods:{
       //tab change handler
       tabHandler:function(tab){
          if(tab.name == "auth"){
             if(!this.Auth.List.length){
                this.authSearch();
             }
          }
          else if(tab.name == "factory"){
            if(!this.Factory.List.length){
                this.factorSearch();
             }
          }
       },
       //factor search
       factorSearch:function(){
         NProgress.start();
         var $this = this;
         $this.fLoading = true;
         $this.$store.dispatch(prefix+factory.LOAD_FACTORY).then(() => {
           $this.fLoading = false;
           NProgress.done();
         }, ()=> {$this.fLoading = false;NProgress.done();});
       },
       //factor pageSize change
       fSizeCg:function(num){
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Factory","Factory","Page","Num"], value:num});
         this.factorSearch();
       },
       // factor current page change
       fCurrCg:function(cur){
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Factory","Factory","Page","Page"], value:cur});
         this.factorSearch();
       },
       authSearch:function(){
         NProgress.start();
         var $this = this;
         $this.aLoading = true;
         $this.$store.dispatch(prefix+factory.LOAD_AUTH).then(() => {
           $this.aLoading = false;
           NProgress.done();
         }, ()=> {$that.aLoading = false;NProgress.done();});
       },
       addNewAuth:function(){
         const $this = this;
         if(!this.hasUsers){
           this.$store.dispatch(motion.LOAD_USERS).then(()=>{},(data)=>{$this.$notify.error({message: data.errmsg})});
         }
         if(!this.hasFactories){
           this.$store.dispatch(factory.LOAD_FACTORY_ALL).then(()=>{},(data)=>{$this.$notify.error({message: data.errmsg})});
         }
         $this.isShow = true;
       },
       cancelAuth:function(row){
         const $this = this;
         this.$confirm("取消授权？", "提示", {}).then(() => {
            NProgress.start();
            $this.$store.dispatch(prefix+factory.CANCEL_AUTH, {AdminID:row.AdminID,GameToken:row.GameToken}).then(() => {
              NProgress.done();
              $this.$notify.success({
                message: "授权取消成功"
              });
            }, (rep) => {
               $this.$notify.error({
                 message: "授权取消失败"
               });
            })
         },()=> {
         });
       },
       authSizeCg:function(num){
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Factory","Auth","Page","Num"], value:num});
         this.authSearch();
       },
       authCurrCg:function(cur){
         this.$store.commit(motion.NOTICE_UPDATE,{key:["Factory","Auth","Page","Page"], value:cur});
         this.authSearch();
       },
       closeAuthForm:function(){
         const $this = this;
         $this.isShow = false;
         $this.authForm.postLoading = false;
         $this.authForm.postDisabled = false;
         $this.$store.commit(prefix+motion.REST_STATE)
       },
       authToUser:function(){
         var $this = this;

            $this.authForm.postLoading = true;
            $this.authForm.postDisabled = true;
            NProgress.start();
            $this.$store.dispatch(prefix+factory.AUTH_USER).then(
             ()=>{
                $this.authForm.postLoading = false;
                $this.authForm.postDisabled = false;
                $this.isShow = false;
                NProgress.done();
                $this.authSearch();
                $this.$notify.success({message: "授权成功"});
             },(data)=>{
                NProgress.done();
                $this.authForm.postLoading = false;
                $this.authForm.postDisabled = false;
                $this.$notify.error({message: data.errmsg})
             }
            );


       }
     }
  }
</script>
