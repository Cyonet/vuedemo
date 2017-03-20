/**
 * @desc 游戏列表模块
 * Created by wenruo on 2016/12/15.
 */
import * as _ from 'lodash';
import {motion, formAction, gameTypes, constants} from "../types";
import {templateEApi, templatesApi, templateApi} from "../api";
import http from "../http";
import util from "util/util"

const prefix = "temp";

const state = {
  Status:"all",
  previewImg:'',
  prevStr:"",
  upload_list:[],
  Option:{
    Content:"",
    Font:"",
    FontSize:"",
    FontColor:"",
    Type:"",
    Width:undefined,
    Height:undefined,
    r:undefined,
    x:undefined,
    y:undefined
  },
  FileList:[],
  InitItem:{
    Data:{
      Background:{Path:""},
      Option:[]
    },
    EndTime:"",
    GameID:"",
    MaxJoinNum:0,
    StartTime:"",
    State:0,
    TemplateID:"",
    TemplateName:"",
    GameUrl:"",
    VersionsID:""
  },
  Item:{},
  Page:{
    Num:12,
    Page:1,
    AllCount:0,
    AllPage:0
  },
  List:[],
  Search:""
};
const getters = {
   tGetPage:(state)=>{
     return {
       Num:state.Page.Num,
       Page:state.Page.Page,
       Status:state.Status,
       Search:state.Search
     }
   },
   tGetCommon:(state)=>{
     return {
       GameID:state.InitItem.GameID,
       VersionsID:state.InitItem.VersionsID
     }
   },
   tPreViewImg:(state)=>{
     return state.previewImg+(state.prevStr?"?timestr="+Date.now()+"Name="+state.prevStr:"?timestr="+Date.now());
   }
};
const actions = {
  [prefix+motion.LOADING_DATA]({commit,getters}){
    return http.get(templatesApi,Object.assign({},getters.tGetPage,getters.tGetCommon),(data)=>{
      commit(prefix+motion.INIT_DATA,data);
    });
  },
  [prefix+motion.INIT_DATA]({commit,getters},payload){
    return http.get(templateApi,Object.assign({},getters.tGetCommon,{TemplateID:payload}),(data)=>{
      commit(prefix+formAction.UPDATE_FORM,data);
    });
  },
  [prefix+motion.ADD_DATA]({commit, state}, payload){
    if(state.Item.TemplateID){//edit
      const Temp = state.Item;
      if (!_.isEqual(Temp, payload||{})){
        Temp.StartTime = util.formatDate.format(Temp.StartTime);
        Temp.EndTime = util.formatDate.format(Temp.EndTime);
        return http.post(templateEApi, Temp, ()=> {
          commit(prefix + motion.EDIT_DATA);
        });
      }
      return new Promise((resolve, reject)=> {
        reject({errorCode: constants.NO_MODIFY})
      })
    }
    state.Item.StartTime = util.formatDate.format(state.Item.StartTime);
    state.Item.EndTime = util.formatDate.format(state.Item.EndTime);
    return http.post(templateApi,state.Item,(data) => {
      commit(prefix+motion.ADD_DATA,data);
    });
  },
  [prefix+motion.DELETE_DATA]({commit,getters},payload){
    return http.delete(templateApi,Object.assign({},getters.tGetCommon,{TemplateID:[payload]}),() =>{
      commit(prefix+motion.DELETE_DATA,payload);
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
  [prefix+motion.ADD_DATA](state, payload){
    const item = state.Item;
    item['TemplateID'] = payload.TemplateID;
    state.List.unshift(item);
  },
  [prefix+motion.EDIT_DATA](state){
     const index = util.findIndex(state.List,'TemplateID', state.Item.TemplateID);
     if(index !== -1){
       state.List.splice(index,1, state.Item);
     }
  },
  [prefix+motion.DELETE_DATA](state,payload){
    const index = util.findIndex(state.List,'TemplateID', payload);
    if(index !== -1){
      state.List.splice(index,1);
    }
  },
  [prefix+formAction.REST_FORM](state){
    state.Item = _.cloneDeep(state.InitItem);
    state.FileList = [];
  },
  [prefix+formAction.UPDATE_FORM](state, payload){
    state.Item = payload;
    state.FileList = [{url:payload.Data&&payload.Data.Background.Path}]
  },
  [prefix+gameTypes.ADD_FEATURE](state){
    state.Item.Data.Option.push(_.cloneDeep(state.Option))
  },
  [prefix+gameTypes.DEL_FEATURE](state, payload){
    state.Item.Data.Option.splice(payload,1);
  },
  [prefix+gameTypes.INIT_TEMP](state, payload){
    state.Item = payload || _.cloneDeep(state.InitItem);
    state.FileList = [];

  }
};
export  default{
  state,
  getters,
  actions,
  mutations
};
