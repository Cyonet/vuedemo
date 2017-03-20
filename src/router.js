/**
 * Created by wenruo on 2016/11/26.
 */

import Vue from 'vue';
import vueRouter from 'vue-router';

import Error from './components/Error.vue'
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Game from './components/Game.vue'
import Font from './components/Font.vue'
import GTemp from './components/GTemp.vue'
import GVersion from './components/GVersion.vue'
import User from './components/User.vue'
import WeChat from './components/WeChat.vue'
import GFactory from './components/GFactory.vue'

import {constants,login} from "./store/types"
import util from "./util/util"

Vue.use(vueRouter);

const router = new vueRouter({
  routes:[
    { path: '/', component: Home,name:'home',meta:{zh:"首页"},children:[
      {
        path:'/g',
        component:Game,
        name:'game',
        meta:{requiresAuth:true,zh:"游戏管理"}
      },
      {
        path:'/v/:id/:t',
        component:GVersion,
        name:'version',
        meta:{requiresAuth:true,zh:'版本管理'}
      },
      {
        path:'/t/:id/:v',
        component:GTemp,
        name:'temp',
        meta:{requiresAuth:true, zh:'模版管理'}
      },
      {
        path:'/f',
        component:Font,
        name:'font',
        meta:{requiresAuth:true,zh:"字体"}
      },
      { path: '/u',meta:{requiresAuth:true,zh:'用户管理'}, component: User, name:"user"},
      { path: '/fa',meta:{requiresAuth:true,zh:'游戏工厂'}, component: GFactory, name:"factory"},
      { path: '/w',meta:{requiresAuth:true,zh:'微信管理'}, component: WeChat, name:"wechat"},
    ]},
    { path: '/login', component: Login,hidden:true},
    { path: '/404', name:'error',component:  Error}
  ]
});
router.beforeEach((to, from, next) => {
  if(to.name == "home"){
    next({path:'/g'});
  }
  if(!to.matched.length){
     next({name:'error',params: { msg: "not found view" }});
  }
  if(to.matched.some(record => record.meta.requiresAuth)){
    if(router.app.$store.state.login.isLogin){
      next();
    }
    else{
      const token = sessionStorage.getItem(constants.USER_TOKEN);
      Vue.http.headers.common['UserToken'] = String(token);
      router.app.$store.dispatch(login.CHECK_TOKEN).then(()=>{
        const state = util.getStorage(constants.SAVE_STORE_KEY,true);
        if(state){
          router.app.$store.replaceState(state);
          if(/\/login/.test(to.path)){
            next({path:'/'})
          }
          else{
            next({path:to.path,query:to.query,params:to.params});
          }
        }
        else{
          next({path:'/login', query:{redirect:encodeURIComponent(to.path)}});
        }
      },()=>{
        next({path:'/login', query:{redirect:encodeURIComponent(to.path)}});
      });
    }
  }
  else{
    next();
  }

});

export default router;

