/**
 * Created by wenruo on 2016/12/15.
 */

export default {
  accesToken: (state) =>{
    return state.login.UserToken
  },
  userName:(state) => {
    return state.login.NikeName;
  },
  isLogin:(state) => {
    return state.login.isLogin;
  },
  headers:(state) =>{
    return {UserToken: state.login.UserToken}
  },
  isAdmin:(state)=>{
    return Boolean(state.login.SuperAdmin);
  },
  getUserId:(state) => { return state.login.UserID;}
}
