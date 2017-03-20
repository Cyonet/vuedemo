/**
 * @desc 工厂模块
 * Created by wenruo on 2016/12/15.
 */
import {factory,motion} from "../types";
import {fAuthListApi, fAuthInfoApi,fListApi,fUserAuthApi} from "../api";
import http from "../http";
import util from "util/util"

const prefix = "fact";
const state = {
  Factory:{
    List:[],
    Page:{
      Num:10,
      Page:1,
      AllCount:0,
      AllPage:0
    },
    Search:"",
    Status:"all"

  },
  AuthFactory:{
    FactoryName: undefined,
    NickName: undefined,
    AdminID: 1,
    EndTime: Date.now(),
    GameToken: 1,
    MaxGameNum: 0,
    MaxJoinNum: 0,
    StartTime: Date.now(),
    Trial: true
  },
  AuthInfo:{
    AdminID: 1,
    EndTime: Date.now(),
    FactoryName: undefined,
    GameID: 1,
    GameToken: 1,
    MaxGameNum: 0,
    MaxJoinNum: 0,
    NickName: undefined,
    StartTime: undefined,
    Trial: 1
  },
  Auth:{
    List:[],
    Page:{
      Num:10,
      Page:1,
      AllCount:0,
      AllPage:0
    },
    Search:"",
    Status:"all"
  },
  Factories:[]

};
const getters = {
  factPage:(state)=>{
    return {
      Num:state.Factory.Page.Num,
      Page:state.Factory.Page.Page,
      Status:state.Factory.Status,
      Search:state.Factory.Search
    }
  },
  authFPage:(state) => {
    return {
      Num:state.Auth.Page.Num,
      Page:state.Auth.Page.Page,
      Status:state.Auth.Status,
      Search:state.Auth.Search,
    }
  },
  Factories:(state) => {
    return state.Factories;
  },
  hasFactories:(state) =>{
    return state.Factories.length;
  }
};
const actions = {
  [prefix+factory.LOAD_FACTORY]({commit, getters}){
    return http.get(fListApi, getters.factPage, (data)=>{
      commit(prefix+factory.LOAD_FACTORY, data);
    })
  },
  [factory.LOAD_FACTORY_ALL]({commit}){
    return http.get(fListApi, (data)=>{
      commit(factory.LOAD_FACTORY_ALL, data);
    })
  },
  [prefix+factory.LOAD_AUTH]({commit, getters}){
    return http.get(fAuthListApi, getters.authFPage, (data)=>{
      commit(prefix+factory.LOAD_AUTH, data);
    })
  },
  [prefix+factory.CANCEL_AUTH]({commit}, payload){
    return http.delete(fUserAuthApi, payload, ()=>{
      commit(prefix+factory.CANCEL_AUTH, payload);
    })
  },
  [prefix+factory.AUTH_USER]({state,commit}){
    state.AuthFactory.StartTime = util.formatDate.format(state.AuthFactory.StartTime);
    state.AuthFactory.EndTime = util.formatDate.format(state.AuthFactory.EndTime);
    return http.post(fUserAuthApi, state.AuthFactory,()=>{commit(prefix+motion.REST_STATE)})
  },
  [prefix+factory.LOAD_AUTH_INFO]({commit},payload){
    return http.post(fAuthInfoApi, payload, (data)=>{
      commit(prefix+factory.LOAD_AUTH_INFO,data);
    })
  }
};
const mutations = {
  [prefix+factory.LOAD_FACTORY](state, payload){
    state.Factory.List = payload.List;
    state.Factory.Page.AllCount = parseInt(payload.AllCount);
    state.Factory.Page.Num = parseInt(payload.Num);
    state.Factory.Page.AllPage = parseInt(payload.AllPage);
    state.Factory.Page.Page = parseInt(payload.Page);
  },
  [factory.LOAD_FACTORY_ALL](state, payload){
    state.Factories = payload.List;
  },
  [prefix+factory.LOAD_AUTH](state,payload){
    state.Auth.List = payload.List;
    state.Auth.Page.AllCount = parseInt(payload.AllCount);
    state.Auth.Page.Num = parseInt(payload.Num);
    state.Auth.Page.AllPage = parseInt(payload.AllPage);
    state.Auth.Page.Page = parseInt(payload.Page);
  },
  [prefix+factory.CANCEL_AUTH](state, payload){
    const auties = state.Auth.List;
    for(let i= auties.length -1;i>=0;i--){
      if((auties[i]).AdminID == payload.AdminID && (auties[i]).GameToken == payload.GameToken){
        auties.splice(i, 1);
        break;
      }
    }
  },
  [prefix+factory.LOAD_AUTH_INFO](state,payload){
    state.AuthInfo = Object.assign({}, state.AuthInfo, payload);
  },
  [prefix+motion.REST_STATE](state){
    util.restObject(state.AuthFactory);
  }

};
export  default{
  state,
  getters,
  actions,
  mutations
};
