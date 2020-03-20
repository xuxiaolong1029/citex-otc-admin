const path = require('path');
const base=require('./webpack.config.base');
const merge=require('webpack-merge');
const MiniCssExtractPlugin =require('mini-css-extract-plugin');
const {CleanWebpackPlugin}=require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports=merge(base,{
    devtool: '#source-map',
    output:{
        publicPath:'./',
        filename:'js/[name][hash].js',
        chunkFilename:'js/vendor[id][hash].js'
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true
                },
                vendor:{
                    test: /node_modules/,
                    name: 'vendor',
                    chunks:'all'
                }
            }
        }
    },
    module:{
        rules:[
            {
                test: /\.(less|css)$/,
                use:[
                    {loader:MiniCssExtractPlugin.loader},'css-loader', 'less-loader'
                ]
            }
        ]
    },
    plugins:[
        new MiniCssExtractPlugin({filename:'assets/[hash].css'}),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin([
            {
                //拷贝package文件到打包dist文件夹中
                from: path.resolve(__dirname, '../public/gt.js'),
                to:path.resolve(__dirname, '../citex-otc-admin-pc')
            },
        ])
    ]
});
