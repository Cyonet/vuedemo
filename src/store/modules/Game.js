/**
 * Created by wenruo on 2016/12/15.
 */

import * as _ from "lodash";
import {motion, formAction, constants, gameTypes} from "../types";
import {gameApi, gamesApi, gameStateApi, factoryListApi} from "../api";
import http from '../http';
import util from "util/util"

const prefix = "game";

const state = {
  Status:"all",
  InitItem:{
    AdminID:1,
    EndTime:"",
    GameID:"",
    GameIcon:"",
    GameName:"",
    GameToken:1,
    MaxJoinNum:0,
    StartTime:"",
    FactoryName:"",
    JoinNum:0,
    NickName:"",
    GameUrl:"",
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
  FList:[],
  Search:""
};

const getters = {
  gLength(state){
    return state.List.length || 0;
  },
  gGetPage:(state)=>{
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
    return http.get(gamesApi,getters.gGetPage,function (data) {
      commit(prefix+motion.LOADING_DATA,data);
    });
  },
  [prefix+motion.ADD_DATA]({commit, state},payload){
    if(state.Item.GameID){//edit
      const game = state.Item;
      if (!_.isEqual(game, payload||{})){
        game.StartTime = util.formatDate.format(game.StartTime);
        game.EndTime = util.formatDate.format(game.EndTime);
        return http.put(gameApi, game, ()=> {
          commit(prefix + motion.EDIT_DATA, game);
        });
      }
      return new Promise((resolve, reject)=> {
          reject({errorCode: constants.NO_MODIFY})
      })
    }
    state.Item.StartTime = util.formatDate.format(state.Item.StartTime);
    state.Item.EndTime = util.formatDate.format(state.Item.EndTime);
    return http.post(gameApi,state.Item,(data) => {
      commit(prefix+motion.ADD_DATA,data);
    });
  },
  [prefix+motion.DELETE_DATA]({commit}, payload){
    return http.delete(gameApi,{GameID: [payload]} , () => {
      commit(prefix+motion.DELETE_DATA, payload);
    });
  },
  [prefix+motion.INIT_DATA]({commit}, payload){
    return http.get(gamesApi,{GameID:payload}, (data) => {
      commit(motion.INIT_DATA, data);
    });
  },
  [prefix+gameTypes.LOAD_FACTORY]({commit}){
    return http.get(factoryListApi, (data) => {
      commit(prefix+gameTypes.LOAD_FACTORY, data);
    });
  },
  [prefix+motion.CHANGE_STATE]({commit}, payload){
    return http.put(gameStateApi,{"GameID": payload}, (data) => {
      commit(prefix+motion.CHANGE_STATE,Object.assign({"GameID": payload}, data));
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
    state.FList = payload.List;
  },
  [prefix+motion.INIT_DATA](state, payload){
    state.Item = payload;
  },
  [prefix+motion.EDIT_DATA](state, payload){
    state.List.splice(util.findIndex(state.List,'GameID', payload.GameID), 1, payload);
  },
  [prefix+motion.ADD_DATA](state,payload){
    state.Item.GameID = payload.GameID;
    state.List.unshift(state.Item);
  },
  [prefix+motion.DELETE_DATA](state,payload){
    state.List.splice(util.findIndex(state.List,'GameID', payload), 1);
  },
  [prefix+formAction.REST_FORM](state){
    state.Item = _.cloneDeep(state.InitItem);
  },
  [prefix+formAction.UPDATE_FORM](state, payload){
    state.Item = _.cloneDeep(payload);
  },
  [prefix+motion.CHANGE_STATE](state, payload){
    const Item = util.find(state.List,'GameID', payload.GameID);
    Item.State = payload.state;
  },
  [prefix+motion.NOTICE_UPDATE](state,payload){
    state.Item = payload
  }
};

export default {
  state,
  getters,
  actions,
  mutations
}

