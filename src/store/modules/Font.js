/**
 * Created by wenruo on 2016/12/15.
 */
var _ = require('lodash');
import {motion, formAction} from "../types";
import {fontApi} from "../api";
import http from '../http';
import util from "util/util";

const prefix = "font";
const state = {
  InitItem:{
    FontID:'',
    Name:"",
    Path:"",
  },
  Item:{
    FontID:'',
    Name:"",
    Path:""
  },
  Page:{
    Num:10,
    Page:1,
    AllCount:0,
    AllPage:0
  },
  Fonts:[],
  List:[]
};

const getters = {
  fGetPage:(state)=>{
    return {
      Num:state.Page.Num,
      Page:state.Page.Page
    }
  },
  Fonts:(state)=>{return state.Fonts;},
  hasFonts:(state)=>{return state.Fonts.length;}
};

const actions = {
  [prefix+motion.LOADING_DATA]({commit,getters}){
    return http.get(fontApi,getters.fGetPage,function (data) {
      commit(prefix+motion.LOADING_DATA,data);
    });
  },
  [prefix+motion.ADD_DATA]({commit, state}){
    return http.post(fontApi,state.Item,(data) => {
      commit(prefix+motion.ADD_DATA,data);
    });

  },
  [prefix+motion.DELETE_DATA]({commit}, payload){
    return http.delete(fontApi,{FontID:[payload]} , () => {
      commit(prefix+motion.DELETE_DATA, payload);
    });
  },
  [motion.LOAD_FONTS]({commit}){
    return http.get(fontApi,function (data) {
      commit(motion.LOAD_FONTS, data);
    });
  }
};

const mutations = {
  [prefix+motion.LOADING_DATA](state, payload){
    state.Page.AllCount = payload.AllCount;
    state.Page.Num = payload.Num;
    state.Page.AllPage = payload.AllPage;
    state.Page.Page = payload.Page;
    state.List = payload.List;
  },
  [prefix+motion.ADD_DATA](state,payload){
    state.Item.FontID = payload.FontID;
    state.List.unshift(_.cloneDeep(state.Item));
  },
  [prefix+motion.DELETE_DATA](state,payload){
    state.List.splice(util.findIndex(state.List,'FontID', payload), 1);
  },
  [prefix+formAction.REST_FORM](state){
    state.Item = _.cloneDeep(state.InitItem);
  },
  [prefix+formAction.UPDATE_FORM](state, payload){
    state.Item = payload;
  },
  [motion.LOAD_FONTS](state, payload){
    state.Fonts = payload.List;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
}


