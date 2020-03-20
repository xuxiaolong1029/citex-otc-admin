import Vue from "vue";
import Vuex from "vuex";
import {getMerchant,verifyTypeInfo,queryUserAsset,getCurrency,getContract,queryPaymentAll} from "../api/commonApi";
Vue.use(Vuex);
export default new Vuex.Store({
  state:{
    pageHeight:document.documentElement.clientHeight,
    userToken:localStorage.getItem('userToken')||'',
    verifyType:'',//验证类型（谷歌>邮箱>手机）
    otcAccount:{},
    contractAll:{},
    currencyAll:[],
    paymentAllList:[],//获取所有绑定方式
    initData:{} //首页面初始化信息
  },
  getters:{

  },
  mutations:{
    getInitData(state, data) {
      state.initData = data;
    },
    userToken(state, data) {
      state.userToken = data;
    },
    getVerifyType(state, data) {
      state.verifyType = data+'';
    },
    getOtcAccount(state, data) {
      if(Array.isArray(data)&&data.length>0){
        state.otcAccount = data[0];
      }else{
        state.otcAccount ={};
      }
    },
    getContractAll(state, data) {
      if(Array.isArray(data)&&data.length>0){
        state.contractAll = data[0];
      }else{
        state.contractAll ={};
      }
    },
    getCurrencyAll(state, data) {
      state.currencyAll = data;
    },
    getPaymentAllList(state, data) {
      state.paymentAllList = data;
    }
  },
  actions:{
    async getMerchantInfo({commit}) {
      await getMerchant().then(res => {
       commit("getInitData",res.data.USDT);
      });
    },
    async getVerifyTypeInfo({commit}) {
      await verifyTypeInfo().then(res => {
        localStorage.setItem('verifyType',res.data+'');
        commit("getVerifyType",res.data);
      });
    },
    async getOtcAccountInfo({commit}) {
      await queryUserAsset().then(res => {
        commit("getOtcAccount",res.data);
      });
    },
    async getContractAllInfo({commit}) {
      await getContract().then(res => {
        commit("getContractAll",res.data);
      });
    },
    async getCurrencyAllInfo({commit}) {
      await getCurrency().then(res => {
        commit("getCurrencyAll",res.data);
      });
    },
    async getPaymentAllInfo({commit}) {
      await queryPaymentAll().then(res => {
        commit("getPaymentAllList",res.data);
      });
    }
  }
});
