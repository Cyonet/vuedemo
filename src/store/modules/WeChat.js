/**
 * Created by wenruo on 2016/12/15.
 */

import * as _ from "lodash";
import {motion, formAction, constants, gameTypes} from "../types";
import {wApi, wJsApi, wListApi} from "../api";
import http from '../http';
import util from "util/util"

const prefix = "wechat";

const state = {
  Status:"all",
  Item:{
    AdminID: 1,
    AppID: undefined,
    AppSecret: undefined,
    NickName: undefined,
    Qrcode: undefined,
    WechatName: undefined
  },
  JsSign:{
    appId: undefined,
    nonceStr: undefined,
    signature: undefined,
    timestamp: undefined
  },
  Page:{
    Num:10,
    Page:1,
    AllCount:0,
    AllPage:0
  },
  List:[],
  Search:""
};

const getters = {
  wLength(state){
    return state.List.length || 0;
  },
  wGetPage:(state)=>{
    return {
      Num:state.Page.Num,
      Page:state.Page.Page,
      Status:state.Status,
      Search:state.Search
    }
  }
};

const actions = {
  [prefix+motion.LOADING_DATA]({commit,getters}){
    return http.get(wListApi,getters.wGetPage,function (data) {
      commit(prefix+motion.LOADING_DATA,data);
    });
  },
  [prefix+motion.ADD_DATA]({commit, state}){

    return http.post(wApi,util.assign(true,state.Item,{AdminID:sessionStorage.getItem(constants.USER_ID_KEY)}),(data) => {
      commit(prefix+motion.ADD_DATA,data);
    });
  },
  [prefix+motion.DELETE_DATA]({commit}, payload){
    return http.delete(wApi,payload , () => {
      commit(prefix+motion.DELETE_DATA, payload);
    });
  },
  [prefix+motion.INIT_DATA]({commit}, payload){
    return http.get(wApi,payload, (data) => {
      commit(motion.INIT_DATA, data);
    });
  },
  [prefix+motion.CHANGE_STATE]({commit}, payload){
    return http.put(wJsApi,payload, (data) => {
      commit(prefix+motion.CHANGE_STATE,data);
    });
  },
};

const mutations = {
  [prefix+motion.LOADING_DATA](state, payload){
    state.Page.AllCount = payload.AllCount;
    state.Page.Num = payload.Num;
    state.Page.AllPage = payload.AllPage;
    state.Page.Page = payload.Page;
    state.List = payload.List;
  },
  [prefix+motion.INIT_DATA](state, payload){
    state.Item = Object.assign({},state.Item, payload);
  },

  [prefix+motion.ADD_DATA](state){
    state.List.unshift(state.Item);
  },
  [prefix+motion.DELETE_DATA](state,payload){
    for(let i= state.List.length -1;i>=0;i--){
      if((state.List[i]).AppID == payload.AppID && (state.List[i]).AdminID == payload.AdminID){
        state.List.splice(i, 1);
        break;
      }
    }

  },
  [prefix+motion.CHANGE_STATE](state, payload){
    state.JsSign = Object.assign({},state.JsSign, payload);
  },
  [prefix+formAction.REST_FORM](state){
    util.restObject(state.Item);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
}

