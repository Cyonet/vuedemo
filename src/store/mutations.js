
import Vue from 'vue';
import * as _ from "lodash";
import {login, constants,motion} from './types'

export default {
  [login.LOGIN_SUCCESS](state,info){
    state.login.isLogin = true;
    state.login.UserToken = info.UserToken;
    state.login.NikeName = info.NikeName;
    state.login.SuperAdmin = info.SuperAdmin;
    state.login.loginTime = Date.now();
    state.login.AdminID = info.AdminID;
  },
  [login.LOGIN_FAIL](state,info){
    state.loginInfo.isSuccess = true;
    state.loginInfo.msg = info.errmsg;
  },
  [login.LOGOUT_SUCCESS](){
    sessionStorage.setItem(constants.IS_LOGIN_KEY, false);
    sessionStorage.setItem(constants.USER_ID_KEY, "");
    Vue.http.headers.common['UserToken'] = "";
  },
  [login.REST_STATE](state){
    Object.assign(state,constants.INIT_STATE);
    state = JSON.parse(localStorage.getItem(constants.INIT_STATE)||"{}");
  },
  [motion.NOTICE_UPDATE](state, payload){
    if(_.isArray(payload.key)){
      let temp = state;
      const lastKey = payload.key.pop();
      _.each(payload.key,function (key) {
        temp = temp[key];
      });
      temp[lastKey] = payload.value;
    }
    else{
      state[payload.key] = payload.value;
    }

  }
};
