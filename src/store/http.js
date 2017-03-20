/**
 * @desc 对vue-resource http 简单包装返回一个Promise对象
 * Created by wenruo on 2016/12/19.
 */

import Vue from 'vue'
import * as _ from 'lodash'
import util from "util/util"
import {constants} from "./types"

function commonDeal(promise, success, fail) {
  if(!_.isFunction(success)){
    success = Empty;
  }
  if(!_.isFunction(fail)){
    fail = Empty;
  }
  return new Promise((resolve, reject) => {
    const jsonReg = /\{.+\}/;
    promise.then(({body})=>{
      let data = _.isString(body)? (jsonReg.test(body)?util.toJSON(body):{'errmsg': body}): body;
      if(data.errcode == 0){
        if(data.resultData){
          data = data.resultData;
        }
        else{
          data = true;
        }
        success(data);
        resolve(data);
      }
      else{
        fail(data);
        reject(data);
      }

    },({body}) =>{
      const data = _.isString(body)? (jsonReg.test(body)?util.toJSON(body):{'errmsg': body}): body;
      fail(data);
      reject(data);
    })
  })
}

function Empty() {

}

const http = {};
(['get', 'head', 'jsonp', 'delete'].forEach((method) => {
  http[method]  = function (url, data, opt,success,fail) {
    const settings = {params:{AdminID:sessionStorage.getItem(constants.USER_ID_KEY)}};
    if(_.isFunction(data)){
      success = data;
      fail = opt;
      opt = {};
      opt.params = {};

    }
    else if(_.isFunction(opt)){
      fail = success;
      success = opt;
      opt = {params:data};
    }
    else if(_.isEmpty(data)){
      opt = {};
      opt.params = {};
    }
    else{
      opt.params = data;
    }

    return commonDeal(Vue.http[method](url, util.assign(true,settings,opt)), success, fail);
  }
}));
(['post', 'put', 'patch'].forEach((method) => {
  http[method]  = function (url, data, opt,success,fail) {
    const settings = {AdminID:sessionStorage.getItem(constants.USER_ID_KEY)};
    if(_.isFunction(opt)){
      fail = success;
      success = opt;
      opt = {};
    }
    return commonDeal(Vue.http[method](url,util.assign(true,settings, data),opt), success, fail)
  }
}));

export default http;
