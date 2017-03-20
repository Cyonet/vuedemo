/**
 * Created by wenruo on 2016/11/25.
 */

import {login} from './types';

import {loginApi, logoutApi, checkToken} from './api';
import http from './http';

export default {
  [login.LOGIN]({commit}, user){
    return http.post(loginApi, user, function (data) {
      commit(login.LOGIN_SUCCESS, data);
    }, function (data) {
      commit(login.LOGIN_FAIL, data);
    });
  },
  [login.LOGOUT]({commit}){
    return http.get(logoutApi, {}, function (data) {
      commit(login.LOGOUT_SUCCESS, data);
    }, function () {
    })
  },
  [login.REST_STATE]({commit}){
    commit(login.REST_STATE);
  },
  [login.CHECK_TOKEN](){
    return http.get(checkToken);
  }
};
