/**
 * Created by wenruo on 2016/12/19.
 */

import {motion, constants} from "../types";
import {editAPwsApi,editPwsApi,changeAStateApi,usersApi,userApi} from "../api";
import http from '../http';
import util from "util/util";

const prefix = "user";

const state = {
   Info:{AdminID:"",Account:"",Email:"",NickName:"",PassWord:"",Phone:""},
   List:[],
   EPwd:{AdminID:"",newPassword_1:"",newPassword_2:"",oldPassword:"",Account:""},
   Page:{
    Num:10,
    Page:1,
    AllCount:0,
    AllPage:0
   },
   Status:"all",
   Search:"",
   Users:[]
};
const getters = {
  uGetPage:(state)=>{
    return {
      Num:state.Page.Num,
      Page:state.Page.Page,
      Status:state.Status,
      Search:state.Search
    }
  },
  hasUsers:(state) =>{
    return state.Users.length;
  },
  Users:(state) =>{
    return state.Users;
  },
};
const actions = {
  //users list
  [prefix+motion.INIT_DATA]({commit,getters}){
    if(getters.isAdmin){
      return http.get(usersApi, getters.uGetPage, function (data) {
         commit(prefix+motion.INIT_DATA, data);
      });
    }
    return new Promise((resolve, reject) => { reject({errcode: 1,errmsg: constants.NO_PERMIS});});
  },
  [motion.LOAD_USERS]({commit}){
    return http.get(usersApi,function (data) {
      commit(motion.LOAD_USERS, data);
    });
  },
  //add user
  [prefix+motion.ADD_DATA]({commit,getters,state}){
    if(getters.isAdmin){
      return http.post(userApi,state.Info, function (data) {
        commit(prefix+motion.ADD_DATA, data);
      });
    }
    return new Promise((resolve, reject) => { reject({errcode: 1,errmsg: constants.NO_PERMIS});});
  },
  //delete user
  [prefix+motion.DELETE_DATA]({commit,getters}, payload){
    if(getters.isAdmin){
      return http.delete(userApi,{AdminID:[payload]}, function () {
        commit(prefix+motion.DELETE_DATA, [payload]);
      });
    }
    return new Promise((resolve, reject) => { reject({errcode: 1,errmsg: constants.NO_PERMIS});});
  },
  //change state
  [prefix+motion.CHANGE_STATE]({commit,getters}, payload){
    if(getters.isAdmin){
      return http.put(changeAStateApi,{AdminID:payload}, function (data) {
        commit(prefix+motion.CHANGE_STATE, {AdminID:payload,State:data.nowState});
      });
    }
    return new Promise((resolve, reject) => { reject({errcode: 1,errmsg: constants.NO_PERMIS});});
  },
  //admin edit Password
  [prefix+motion.CHANGE_A_PSW]({commit,getters, state}){
    if(getters.isAdmin){
      return http.put(editAPwsApi,state.EPwd, function () {
        commit(prefix+motion.CHANGE_A_PSW);
      });
    }
    return new Promise((resolve, reject) => { reject({errcode: 1,errmsg: constants.NO_PERMIS});});
  },
  //edit Password
  [prefix+motion.CHANGE_PSW]({commit, state}){
      return http.put(editPwsApi,state.EPwd, function () {
        commit(prefix+motion.REST_STATE);
      });
  },
  //edit info
  [prefix+motion.EDIT_DATA]({state}){
    return http.put(userApi,state.Info);
  },
  [prefix+motion.LOADING_DATA]({commit, getters}){
     return http.put(userApi,{AdminID:getters.getUserId},function (data) {
        commit(prefix+motion.EDIT_DATA, data);
     });
  }
};
const mutations = {
  [prefix+motion.INIT_DATA](state, payload){
    state.Page.AllCount = payload.AllCount;
    state.Page.Num = payload.Num;
    state.Page.AllPage = payload.AllPage;
    state.Page.Page = payload.Page;
    state.List = payload.List;
  },
  [motion.LOAD_USERS](state, payload){
    state.Users = payload.List;
  },
  [prefix+motion.ADD_DATA](state, payload){
    state.List.push(Object.assign({}, state.Info,payload));
    util.restObject(state.Info);
  },
  [prefix+motion.DELETE_DATA](state, payload){
    for(let i=0,len=payload.length;i<len;i++){
      state.List.splice(util.findIndex(state.List,'AdminID', payload[i]), 1);
    }
  },
  [prefix+motion.CHANGE_STATE](state, payload){
    const Item = util.find(state.List,'AdminID', payload.AdminID);
    Item.State = payload.State;
  },
  [prefix+motion.REST_STATE](state){
    util.restObject(state.Info);
  },
  [prefix+motion.CHANGE_A_PSW](state, payload){
    if(payload){
      state.EPwd = Object.assign({},state.EPwd,payload);
    }
    else{
      util.restObject(state.EPwd);
    }
  },
  [prefix+motion.EDIT_DATA](state, payload){
    if(payload){
      state.Info = Object.assign({},state.Info,payload);
    }
    else{
      util.restObject(state.Info);
    }

  }
};

export default {state, getters, actions, mutations}

