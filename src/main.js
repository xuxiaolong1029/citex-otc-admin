import "babel-polyfill"
import Vue from 'vue'
import app from './App.vue'
import router from './router'
import store from './store'
import './assets/css/reset.less';
import "./utils/element-config"
import VueClipboard from "vue-clipboard2";
import md5 from "js-md5";
import http from "./http/fetch";
import axiosConfig from './http/axios.config';
Vue.prototype.$md5 = md5;
Vue.prototype.http = http;
Vue.use(VueClipboard);
Vue.config.productionTip = false;
axiosConfig.axiosConfig();
new Vue({
    el:'#app',
    store,
    router,
    render:(h)=>h(app)
});
router.beforeEach((to, from, next) => {
    let AUTH_TOKEN = localStorage.getItem('userToken');
    if (to.meta.requireAuth) {
        if(AUTH_TOKEN){
            next()
        }else{
            next({
                path: "/login",
                query: { redirect: to.fullPath } // 将跳转的路由path作为参数，登录成功后跳转到该路由
            });
        }
    }else{
        next()
    }
});
