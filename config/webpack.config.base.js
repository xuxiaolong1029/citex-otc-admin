const path = require('path');
const {VueLoaderPlugin} = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const utils = require('./utils');
function resolve(dir) {
    return path.join(__dirname, "..", dir);
}
module.exports={
    stats:{children:false},
    //输入
    mode: process.env.NODE_ENV,
    entry:{
        path:['babel-polyfill', './src/main.js']
    },
    //输出
    output:{
        path:path.join(__dirname,'../citex-otc-admin-pc'),
        filename:'bundle.js'
    },
    resolve: {
        alias:{
            'vue$':'vue/dist/vue.esm.js'//配置别名 确保webpack可以找到.vue文件
        },
        extensions: ['*', '.js', '.vue','.jsx','.json']
    },
    module:{
        rules:[
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src'), resolve('test'),resolve('/node_modules/element-ui/src'),resolve('/node_modules/element-ui/packages')]
            },{
                test:/\.vue$/,
                use:'vue-loader'
            },
            {
                test: /\.(jpg|jpeg|png|gif|svg)$/,
                loader: 'url-loader',
                options: {
                    esModule:false,
                    limit:100000,
                    publicPath: '../',
                    name: utils.assetsPath('images/[name].[hash:7].[ext]')
                }
            },{
                test: /\.(eot|ttf|woff|woff2)(\?\S*)?$/,
                loader: 'url-loader',
                options: {
                    esModule:false,
                    limit: 10000,
                    publicPath: '../',
                    name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
                }
            }
        ]
    },
    plugins:[
        new VueLoaderPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV':JSON.stringify(process.env.NODE_ENV),
        }),
        new HtmlWebpackPlugin({
            template:'./public/index.html',
            favicon: './public/icon.ico',
            inject: 'body',
            minify: {
                removeComments: true
            }
        })
    ]
};
