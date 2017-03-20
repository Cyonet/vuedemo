/**
 * Created by wenruo on 2016/12/15.
 */
var _ = require('lodash');
import {motion, formAction, constants,gameTypes} from "../types";
import {gameVersionsApi, gameVersionApi, gameVersionStateApi} from "../api";
import http from '../http';
import util from "util/util"

const prefix = "version";
const state = {
  Status:"all",
  InitItem:{
    AdminID:1,
    EndTime:"",
    FactoryName:"",
    GameID:"",
    GameToken:"",
    JoinNum:"",
    MaxJoinNum:0,
    StartTime:"",
    NickName:"",
    VersionsID:0,
    GameUrl:"",
    VersionsName:"",
    State:1
  },
  Item:{},
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
  vLength(state){
    return state.List.length || 0;
  },
  vGetPage:(state)=>{
    return {
      Num:state.Page.Num,
      Page:state.Page.Page,
      Status:state.Status,
      Search:state.Search
    }
  },
  vGetGameId:(state)=>{
    return state.InitItem.GameID
  }
};

const actions = {
  [prefix+motion.LOADING_DATA]({commit,getters}){
    return http.get(gameVersionsApi,Object.assign({},getters.vGetPage, {GameID:getters.vGetGameId}),function (data) {
      commit(prefix+motion.LOADING_DATA,data);
    });
  },
  [prefix+motion.ADD_DATA]({commit, state},payload){
    if(state.Item.VersionsID){//edit
      const v = state.Item;
      if (!_.isEqual(v, payload||{})){
        v.StartTime = util.formatDate.format(v.StartTime);
        v.EndTime = util.formatDate.format(v.EndTime);
        return http.put(gameVersionApi, v, ()=> {
          commit(prefix + motion.EDIT_DATA, v);
        });
      }
      return new Promise((resolve, reject)=> {
        reject({errmsg: constants.NO_MODIFY})
      })
    }
    state.Item.StartTime = util.formatDate.format(state.Item.StartTime);
    state.Item.EndTime = util.formatDate.format(state.Item.EndTime);
    return http.post(gameVersionApi,state.Item,(data) => {
      commit(prefix+motion.ADD_DATA,data);
    });

  },
  [prefix+motion.DELETE_DATA]({commit,getters}, payload){
    return http.delete(gameVersionApi,{GameID: getters.vGetGameId,VersionsID:[payload]} , () => {
      commit(motion.DELETE_DATA, payload);
    });
  },
  [prefix+motion.INIT_DATA]({commit,getters}, payload){
    return http.get(gameVersionApi,{GameID: getters.vGetGameId,VersionsID:payload} , (data) => {
      commit(motion.INIT_DATA, data);
    });
  },

  [prefix+motion.CHANGE_STATE]({commit,getters}, payload){
    return http.put(gameVersionStateApi,{GameID: getters.vGetGameId,VersionsID:payload} , (data) => {
      commit(prefix+motion.CHANGE_STATE,Object.assign({"VersionsID": payload}, data));
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
  [prefix+gameTypes.LOAD_FACTORY](state, payload){
    state.FPage.AllCount = payload.AllCount;
    state.FPage.Num = payload.Num;
    state.FPage.AllPage = payload.AllPage;
    state.FPage.Page = payload.Page;
    state.FList = payload.List;
  },
  [prefix+motion.INIT_DATA](state, payload){
    state.Item = payload;
  },
  [prefix+motion.EDIT_DATA](state, payload){
    console.info(util.findIndex(state.List,'VersionsID', payload.VersionsID));
    state.List.splice(util.findIndex(state.List,'VersionsID', payload.VersionsID), 1, payload);
  },
  [prefix+motion.ADD_DATA](state,payload){
    state.Item.VersionsID = payload.VersionsID;
    state.List.unshift(state.Item);
  },
  [prefix+motion.DELETE_DATA](state,payload){
    state.List.splice(util.findIndex(state.List,'VersionsID', payload), 1);
  },
  [prefix+formAction.REST_FORM](state){
    state.Item = _.cloneDeep(state.InitItem);
  },
  [prefix+formAction.UPDATE_FORM](state, payload){
    state.Item = payload;
  },
  [prefix+motion.CHANGE_STATE](state, payload){
    const Item = util.find(state.List,'VersionsID', payload.VersionsID);
    Item.State = payload.nowState;
  },
};

export default {
  state,
  getters,
  actions,
  mutations
}


