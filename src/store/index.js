/**
 * Created by wenruo on 2016/11/25.
 */

import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './mutations';
import getters from './getters';
import actions from './actions';
import Game from './modules/Game';
import Temp from './modules/Temp';
import Ver from './modules/Version';
import User from './modules/User';
import Font from './modules/Font';
import WeChat from './modules/WeChat';
import Factory from './modules/Factory';

import {constants, login, motion} from './types'
import {fileUpload} from "./api"
import util from "../util/util"


Vue.use(Vuex);

const localStore = localStorage;
const sessionStore = sessionStorage;
const stringify = JSON.stringify;

const saveStore = store => {
  store.subscribe((mutation, state)=>{
    if(mutation.type == login.LOGIN_SUCCESS||mutation.type == motion.NOTICE_UPDATE){
      //保存最新的state
      util.setStorage({key:constants.SAVE_STORE_KEY,data:state},true);
      if(mutation.type == login.LOGIN_SUCCESS){
        // 登陆成功保存必要信息
        sessionStore.setItem(constants.IS_LOGIN_KEY, true);
        sessionStore.setItem(constants.USER_ID_KEY, state.login.AdminID);
        sessionStore.setItem(constants.USER_TOKEN, state.login.UserToken);
        Vue.http.headers.common['UserToken'] = String(state.login.UserToken);
      }
    }
    else if(mutation.type == login.LOGOUT_SUCCESS){
      // 退出清空本地数据
      localStore.removeItem(constants.SAVE_STORE_KEY);
    }
  });
};
const state = {
  login:{
    isLogin:false,
    NikeName:'',
    SuperAdmin:false,
    UserID:'',
    AdminID:"",
    UserToken:'',
    loginTime:''
  },
  loginInfo:{
    isSuccess: false,
    msg:''
  },
  aesKey:"tanzi",
  fileUpload:fileUpload,
  statusTypes:[{l:"全部",v:"all"},{l:"未开始",v:"notstart"},{l:"进行中",v:"beginning"},{l:"已结束",v:"end"},{l:"启用",v:"open"},{l:"停用",v:"close"}],
  stateType:[{l:"开启",v:1},{l:"关闭",v:0}]
};
const store = new Vuex.Store({
  state,
  mutations,
  getters,
  actions,
  modules:{
    Game,
    Temp,
    Ver,
    Font,
    User,
    WeChat,
    Factory
  },
  plugins: [saveStore],
  strict:false
});
util.setStorage({key:constants.INIT_STATE,data:store.state},true);

export default store;
