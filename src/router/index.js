import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router);
import Home from '../views/home'
import NotFound from '../views/404'
//登录
import Login from '../views/login'
import Verify from '../views/verify'
//内容页面
import Index from '../views/index';
import Order from '../views/order';
import Setting from '../views/setting'
export default new Router({
    routes:[
        {
            path: '/',
            component: Home,
            redirect:'/index',
            name: '公共',
            meta:{
                requireAuth:true
            },
            children: [
                {
                    path: '/index',
                    index:'1',
                    icon:'el-icon-s-home',
                    component:Index,
                    name: '首页',
                    meta:{
                        requireAuth:true
                    },
                },
                {
                    path: '/order',
                    index:'2',
                    icon:'el-icon-s-order',
                    component:Order,
                    name: '我的订单',
                    meta:{
                        requireAuth:true
                    },
                },
                {
                    path: '/setting',
                    index:'3',
                    icon:'el-icon-setting',
                    component:Setting,
                    name: '交易设置',
                    meta:{
                        requireAuth:true
                    },
                }
            ]
        },{
            path:'/login',
            name:'Login',
            meta:{
                requireAuth:false
            },
            component:Login
        },{
            path:'/verify',
            name:'verify',
            meta:{
                requireAuth:false
            },
            component:Verify
        },{
            path: '*',
            component: NotFound,
            meta:{
                requireAuth:false
            },
            name: '网络出错',
            hidden: true
        }, {
            path: '*',
            component: NotFound,
            meta:{
                requireAuth:false
            },
            hidden: true,
            redirect: { path: '/404' }
        }
    ]
})

