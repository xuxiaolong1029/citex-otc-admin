<template>
  <div class="page-index">
    <div class="page-index-top">
      <el-card class="box-card"  shadow="never">
        <div slot="header" class="clearfix">
          <span>基本信息</span>
        </div>
        <div class="shopper-message">
          <p><label>商户名称：</label>{{initData.merchName}}</p>
          <p><label>缴纳保证金：</label>{{initData.margin}}USDT</p>
          <p><label>今日已出售USDT：</label>{{initData.todaySellQty}}</p>
          <p><label>今日已收购USDT：</label>{{initData.todayBuyQty}}</p>
          <p><label>手续费比例：</label>
            {{initData.buyFeeRate}}%<span>(买入)</span>&nbsp;
            {{initData.sellFeeRate}}%<span>(卖出)</span>
          </p>
        </div>
      </el-card>
      <el-card class="box-card" shadow="never">
        <div slot="header" class="clearfix">
          <span>钱包信息</span>
          <el-button style="float: right; padding: 3px 0" @click="transferDialog=true" type="text">资金划转</el-button>
        </div>
        <div class="shopper-money">
          <div>
            <h3>● 币币钱包</h3>
            <p><label>可用：</label>{{initData.cashAvailableQty|filtersNum(4)}}USDT </p>
            <p><label>冻结：</label>{{initData.cashFronzenQty|filtersNum(4)}}USDT </p>
          </div>
          <div>
            <h3>● OTC钱包</h3>
            <p><label>可用：</label>{{initData.otcAvailableQty|filtersNum(4)}}USDT </p>
            <p><label>冻结：</label>{{initData.otcFronzenQty|filtersNum(4)}}USDT </p>
          </div>
        </div>
      </el-card>
    </div>
    <div class="page-index-bottom">
      <el-card shadow="never">
        <div slot="header" class="clearfix">
          <span>支付管理</span>
          <el-button style="float: right;" @click="formObj = {};dialogFormVisible = true;" size="small" type="primary">添加</el-button>
        </div>
        <ul class="pay-list">
          <li @click="activePayTypes = item.id" v-for="item in payTypes" :id='item.id' :key="item.id">
            <span :class="activePayTypes === item.id?'active':''" >{{item.name}}</span>
          </li>
        </ul>
        <el-table :data="paymentAllList.filter(item => item.payType===activePayTypes)" style="width: 100%;max-height:220px;overflow:auto">
          <el-table-column label="收款方式" min-width="150">
            <template slot-scope="scope">
              <div class="card-img">
                <img :src="require(`../assets/img/payType${scope.row.payType}.png`)" alt=""/>
                <span>{{scope.row.payType | filterType}}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="账号" min-width="260">
            <template slot-scope="scope">
              {{scope.row.account}} <span v-if="scope.row.payType===1">({{scope.row.bankName}}&nbsp;{{scope.row.bankAddr}})</span>
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="二维码">
            <template slot-scope="scope">
              <div class="er-code-img" @click="bigImgSrc=scope.row.fileName">
                <img v-if="scope.row.payType!==1" style="width:35px;height: 35px" :src="scope.row.fileName" alt=""/>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="fileName" label="开启状态">
            <template slot-scope="scope">
              <el-switch
                @change='editIndexStatus(scope.row)'
                v-model="scope.row.enable===0?true:false"
                active-text="是"
                inactive-text="否">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="handleLook(scope.row)">编辑</el-button>
              <el-button type="text" size="small" @click="deleteData(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <el-dialog style="width:1200px;margin:auto" :title="formObj?'修改支付方式':'添加支付方式'" :visible.sync="dialogFormVisible">
      <div style="margin-left:30px;">
        <All :realName="initData.realName" v-if="Object.keys(formObj).length===0" @close-dialog="closeDialog"></All>
        <Card :realName="initData.realName" :formObj="formObj" v-if="formObj.payType===1" @close-dialog="closeDialog"></Card>
        <AliPay :realName="initData.realName" :formObj="formObj" v-if="formObj.payType===2" @close-dialog="closeDialog"></AliPay>
        <WX :realName="initData.realName" :formObj="formObj" v-if="formObj.payType===3" @close-dialog="closeDialog"></WX>
      </div>
    </el-dialog>
     <bigImg :bigImg="bigImgSrc" @close-dialog="bigImgSrc=''"></bigImg>
    <Transfer :transferDialog="transferDialog" @close-dialog ='transferDialog=false'></Transfer>
  </div>
</template>
<script>
  import bigDecimal from "js-big-decimal";
  import { mapActions,mapState } from "vuex";
  import Transfer from './dialog/transferAssets'
  import All from './dialog/addCard/index';
  import Card from './dialog/addCard/card';
  import WX from './dialog/addCard/wx';
  import AliPay from './dialog/addCard/alipay';
  import bigImg from "./dialog/bigImg"; //显示大图
  export default {
    components:{
      All,Transfer,Card,WX,AliPay,bigImg
    },
    data(){
      return{
        dialogFormVisible:false,
        transferDialog:false,//划转弹窗
        formObj:{},
        bigImgSrc:'',
        payTypes:[
          {name:'银行卡',id:1},
          {name:'支付宝',id:2},
          {name:'微信',id:3}
        ],
        activePayTypes:1
      }
    },
    watch:{
      dialogFormVisible(val){
        if(!val){
          this.formObj = {}
        }
      }
    },
    computed: {
      ...mapState(["verifyType","initData","paymentAllList","userToken"])
    },
    mounted(){
      if(this.userToken){
        this.getPaymentAllInfo({});
        this.getVerifyTypeInfo({});
        this.getOtcAccountInfo({});
        this.getMerchantInfo({})
      }
    },
    methods:{
      ...mapActions(["getVerifyTypeInfo","getOtcAccountInfo","getPaymentAllInfo","getMerchantInfo"]),
      editIndexStatus(item){
        let payBlone = this.paymentAllList.find(obj => obj.payType === item.payType&&obj.enable===0);
        this.$confirm(!payBlone?`确认开启当前${item.payType===1?'银行卡':item.payType===2?'支付宝':'微信'}账号？`:item.enable===0?`确认关闭当前${item.payType===1?'银行卡':item.payType===2?'支付宝':'微信'}账号？`
        :'当前收款方式已开启其他账号，请先关闭其他账号，再进行操作。', 
        '温馨提示', {
          confirmButtonText:'确定',
          cancelButtonText:'取消',
          type: 'warning'
        }).then(() => {
          let par = {
            payId:item.payId,
            enable:item.enable===0?1:0
          };
          this.http.fetch("/otcM/payment/updatePyamentStatus",par,"post").then(res => {
            if(res.code===0){
              this.$message.success(res.msg);
              this.getPaymentAllInfo({});
            }else{
              this.$message.error(res.msg);
            }
          });
        }).catch(() => {
                    
        });
      },
      closeDialog(val){
        if(val==='1'){
          this.getPaymentAllInfo({});
        }
        this.dialogFormVisible = false
      },
      handleLook(row){
        this.formObj = row;
        this.dialogFormVisible = true;
      },
      deleteData(row){
        let typeName = row.payType===1?'银行卡':row.payType===2?'支付宝':'微信';
        this.$confirm(`是否确认删除“${typeName}”收款信息?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          //删除支付某一支付方式
          this.http.fetch(`/otcM/payment/deletePayment/${row.payId}`,{},"post").then(data => {
            if(data.code===0){
              this.getPaymentAllInfo({});
              this.$message({type: 'success', message: '删除成功!'});
            }else{
              this.$message.error(data.msg);
            }
          });
        }).catch(() => {
          this.$message({type: 'info', message: '已取消删除'});
        });
      }
    },
    filters:{
      filtersNum(val,len){
        return bigDecimal.round(val,len);
      },
      filterType(type){
        return type===1?'银行卡':type===2?'支付宝':'微信'
      }
    }
  }
</script>
<style lang="less" scoped>
  .page-index{
    width: 100%;padding:50px 100px;box-sizing: border-box;
    .page-index-top{
      display: flex;justify-content: space-between;
      .box-card{
        width: 43%;cursor: pointer;
        .shopper-message{
          color: #333;
          p{
            line-height:40px;
            label{
              font-size: 14px;color: #999;
            }
            span{
              font-size:12px;color: #ccc;
            }
          }
        }
        .shopper-money{
          color: #333;
          h3{
            color:#409EFF;line-height: 30px;
          }
          p{
            line-height:35px;
            label{
              font-size: 14px;color: #999;
            }
          }
        }
      }
    }
    .page-index-bottom{
      margin-top:40px;
      .er-code-img{
        position: relative;cursor: pointer;
        &:hover{
          span{
            display: block;position: absolute;left: 0;top: 0;
            background: rgba(0, 0, 0, 0.6);
          }
        }
        span{
          display: none;color: #fff;text-align: center;width:50px;height:50px;line-height: 50px;
          font-size: 12px;
        }
      }
      .pay-list{
        display: flex;justify-content: flex-start;border-bottom: 1px solid #EBEEF5;
        
        li{
          margin-right: 30px;height:40px;line-height:40px;cursor: pointer;padding-top:5px;
          span{
            display: inline-block;height:40px;line-height:40px;
          }
          .active{
            color:#409EFF;border-bottom: 1px solid #409EFF;
          }
        }
      }
      .card-img{
        img{
          width: 35px;vertical-align: middle;margin-right: 10px;max-height: 40px;
        }
      }
    }
    .big-img{
      max-height: 800px;min-height: 200px;
    }
  }
</style>
