const path = require('path');
const base=require('./webpack.config.base');
const merge=require('webpack-merge');
const webpack=require('webpack');

module.exports=merge(base,{
    // 设置source map,方便debugger
    devtool: "inline-source-map",
    module:{
        rules:[
            {
                test: /\.(less|css)$/,
                use: ['vue-style-loader', 'css-loader','less-loader','postcss-loader']
            }
        ]
    },
    devServer:{
        contentBase: path.join(__dirname, "src"),
        historyApiFallback:{
            rewrites:[
                {from:/./,to:'/404.html'}
            ]
        },
        overlay: {
            errors: true  // 在浏览器窗口出口错误的提示层
        },
        hot: true,
        inline: true,
        port:8088,
       // host:'10.10.0.89',
        open:true,
        proxy: {
            '/otcM':{
                target: 'http://10.1.1.61:8090', // 接口的域名
                secure: false, // 如果是https接口，需要配置这个参数
                changeOrigin: true // 如果接口跨域，需要进行这个参数配置
            }
        }
    },
    plugins:[
        new webpack.HotModuleReplacementPlugin()
    ]
});
