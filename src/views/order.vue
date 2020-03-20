<template>
  <div class="page-order">
    <ul class="order-type">
      <li @click="editOrderType(1)" :class="form.orderType===1?'menu-active':''">
        <el-badge :hidden="buyHandle===0?true:false" class="item" :value="buyHandle">买入</el-badge>
      </li>
      <li @click="editOrderType(2)" :class="form.orderType===2?'menu-active':''">
        <el-badge :hidden="sellHandle===0?true:false" class="item" :value="sellHandle">卖出</el-badge>
      </li>
    </ul>
    <div class="content-table">
      <el-form class="from-input" ref="form" :model="form">
        <el-form-item label="订单号" label-width="60px">
          <el-input size="small" style="width:120px" placeholder="订单号" v-model.trim="form.orderNo"></el-input>
        </el-form-item>
        <el-form-item label="时间" label-width="50px">
          <el-date-picker
            style="width: 240px;"
            v-model="form.orderTime"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            align="right">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" label-width="50px">
          <el-select size="small" style="min-width:100px" v-model="form.status" placeholder="请选择">
            <el-option label="已取消" :value="-1"></el-option>
            <el-option label="未付款" :value="1"></el-option>
            <el-option label="已付款" :value="2"></el-option>
            <el-option label="已完成" :value="3"></el-option>
            <el-option label="超时关闭" :value="4"></el-option>
            <el-option label="申诉中" :value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button style="margin-left:15px;" size="small" type="primary" @click.native="getOtcOrdersInfo()">查询</el-button>
          <el-button style="margin-left:15px;" size="small" type="primary" @click="resetForm()">重置</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" min-width="170px">
        </el-table-column>
        <el-table-column prop="createAt" label="时间" min-width="160px">
        </el-table-column>
        <el-table-column label="交易类型" min-width="80px">
          <template slot-scope="scope">
            {{scope.row.orderType===1?'买入':'卖出'}}
          </template>
        </el-table-column>
        <el-table-column label="数量(USDT)" min-width="95px">
          <template slot-scope="scope">
            {{scope.row.amount|filtersNum(4)}}
          </template>
        </el-table-column>
        <el-table-column label="价格(CNY)" min-width="90px">
           <template slot-scope="scope">
            {{scope.row.price|filtersNum(2)}}
          </template>
        </el-table-column>
        <el-table-column label="金额(CNY)" min-width="90px">
          <template slot-scope="scope">
            {{scope.row.totalMoney|filtersNum(2)}}
          </template>
        </el-table-column>
        <el-table-column label="手续费(USDT)" min-width="110px">
           <template slot-scope="scope">
            {{scope.row.fee|filtersNum(4)}}
          </template>
        </el-table-column>
        <el-table-column label="支付方式" min-width="80px">
          <template slot-scope="scope">
            {{scope.row.payType | filterPayType}}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="90px">
          <template slot-scope="scope">
            {{scope.row.status | filterStatus(scope.row.orderType)}}
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="60px">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click.native="handLook(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          v-if="totalPage>10"
          background small
          :current-page.sync="pageNum"
          @current-change="getOtcOrdersInfo"
          :page-size="10"
          layout="prev, pager, next"
          :total="totalPage">
        </el-pagination>
      </div>
    </div>
    <v-tip :title="dialogTitle" v-if="dialogTitle" :status="orderData.status" :orderType="orderData.orderType"  @close-dialog='dialogTitle=""'>
      <div slot="suffix">
        <div class="suffix-status" v-if="dialogTitle==='确认已付款'">
          <div>
            请务必确认您已经完成OTC转账再确认付款，恶意确认将会被
            禁止交易。
          </div>
          <p>
            <el-checkbox v-model="checkbox">我已确认完成OTC转账操作</el-checkbox>
          </p>
        </div>
        <div class="suffix-status" v-if="dialogTitle==='确认已收款'">
          <div>
            请再核实银行账户收到付款后再点击确认放行，否则将会钱币两空。
          </div>
          <p>
            <el-checkbox v-model="checkbox">我已确认收款并向对方放币</el-checkbox>
          </p>
        </div>
        <div class="suffix-status" v-if="dialogTitle==='取消订单'">
          <p>
            取消订单后，切勿再付款，如果已付款切勿撤销
          </p>
          <p>
            随意多次取消订单，将被冻结OTC交易
          </p>
        </div>
        <div class="suffix-button-order">
          <button @click="dialogTitle=''">{{dialogTitle==='确认已付款'?'取消':dialogTitle==='确认已收款'?'取消':'在想想'}}</button>
          <button @click="handleTrade(dialogTitle==='确认已付款'?'confirmTransfer':dialogTitle==='确认已收款'?'releaseCurrency':'cancelOrder')">{{dialogTitle==='确认已付款'?'确认已付款':dialogTitle==='确认已收款'?'确认已收款':'确定'}}</button>
        </div>
      </div>
    </v-tip>
    <v-status v-if="dialogShow === 'status'" :orderData="orderData" @close-dialog='dialogShow=""'>
      <div slot="suffix-order" class="suffix-order">
        <h3>
          <span>{{orderData.orderType===1?'对方收款方式':'您的收款方式'}}</span>
          <label v-if="orderData.payList.length===1">{{orderData.payList[0].payType|filterPayType}}</label>
        </h3>
        <p class="pay-list" v-if="orderData.payList.length>1">
          <button v-for="(item,index) in orderData.payList" @click="pay_type = item.payType" :key="index+'ss'" :class="pay_type===item.payType?'active':''">
            {{item.payType|filterPayType}}
          </button>
        </p>
        <div class="suffix-card-message">
          <ul v-if="pay_type===1">
            <li>姓名：{{payTypeObj.name}}<label v-clipboard:copy="payTypeObj.name" v-clipboard:success="onCopy">复制</label></li>
            <li>银行：{{payTypeObj.bankName}} <span>支行：{{payTypeObj.bankAddr}}</span></li>
            <li>卡号：{{payTypeObj.account}}<label v-clipboard:copy="payTypeObj.account" v-clipboard:success="onCopy">复制</label></li>
          </ul>
          <ul v-else>
            <li></li>
            <li>姓名：{{payTypeObj.name}}</li>
            <li>{{pay_type===2?'支付宝':'微信'}}号：{{payTypeObj.account}} </li>
          </ul>
          <p v-if="pay_type!==1" @click="bigImgSrc = payTypeObj.fileName">
            <img :src="payTypeObj.fileName" alt="">
          </p>
        </div>
        <div class="suffix-button-order" v-if="orderData.orderType===1">
          <div v-if="orderData.status===-1||orderData.status===3||orderData.status===6">
            <button class="bg2" @click="orderStep(orderData,'cancel')">{{btnText0}}</button>
          </div>
          <div v-else>
            <button :class="orderData.status!==1?'disabled':''" @click="orderStep(orderData,'cancel')">
              <img v-if="orderData.status===5" src="../assets/img/time.png" alt="" style="vertical-align:middle;width:16px;">
              {{btnText0}}
            </button>
            <button @click="orderStep(orderData,'sure')">{{btnText1}}</button>
          </div>
        </div>
        <div class="suffix-button-order" v-else>
          <div v-if="orderData.status===-1||orderData.status===1||orderData.status===3">
            <button class="bg2" @click="orderStep(orderData,'cancel')">{{btnText0}}</button>
          </div>
          <div v-else>
            <button :class="orderData.status===4||orderData.status===5||orderData.status===6?'disabled':''" @click="orderStep(orderData,'cancel')">
              <img v-if="orderData.status===5" src="../assets/img/time.png" alt="" style="vertical-align:middle;width:16px;">
              {{btnText0}}
            </button>
            <button @click="orderStep(orderData,'sure')">{{btnText1}}</button>
          </div>
        </div>
      </div>
    </v-status>
    <bigImg :bigImg="bigImgSrc" @close-dialog="bigImgSrc=''"></bigImg>
    <v-complain v-if="dialogShow==='complain'" :orderId="orderId+''" :orderType="form.orderType" @sureComplain="handleTrade()" :dialogShow="dialogShow" @close-dialog="dialogShow=''"></v-complain>
  </div>
</template>

<script>
  import bigDecimal from "js-big-decimal";
  import VStatus from './dialog/tradeStatus'
  import VComplain from "./dialog/complain"; //订单申诉
  import VTip from "./dialog/tipDialog"; //提示弹窗
  import bigImg from "./dialog/bigImg"; //显示大图
  export default {
    components:{
      VStatus,VComplain,VTip,bigImg
    },
    data(){
      return{
        dialogShow:'',
        pageNum:1,
        totalPage:0,
        orderData:{},
        tableData:[],
        form:{orderNo:'',orderTime:'',orderType:Number(sessionStorage.getItem('orderType'))||1,status:''},
        pay_type:1,
        payTypeObj:{},
        btnText0:'',
        btnText1:'',
        checkbox:false,
        dialogTitle:'',
        orderId:'',
        timer:null,
        bigImgSrc:'',
        buyHandle:0,
        sellHandle: 0
      }
    },
    watch:{
      pay_type(v){
        this.payTypeObj = this.orderData.payList.find(obj => obj.payType===v)
      },
      'form.orderType'(val){
        this.getOtcOrdersInfo()
      }
    },
    mounted(){
      this.getOtcOrdersInfo();
    },
    methods:{
      resetForm() {
        this.form={orderNo:'',orderTime:'',orderType:Number(sessionStorage.getItem('orderType'))||1,status:''};
      },
      editOrderType(value){
        this.form.orderType = value;
        sessionStorage.setItem('orderType',value)
      },
      onCopy(){
        this.$message.success('复制成功');
      },
      getOtcOrdersInfo(){
        let {orderTime,...params} = this.form;
        let par = {
          pageNum:this.pageNum,
          pageSize: 10,
          startTime:this.form.orderTime[0],
          endTime:this.form.orderTime[1],
          ...params
        };
        this.http.fetch("/otcM/order/getOtcOrdersList",par,"post").then(res => {
          if(res.code===0){
            this.timer = setTimeout(() => {
              this.getOtcOrdersInfo()
            },5000);
            const {list, total, sellHandle,buyHandle} = res.data
            this.tableData = list;
            this.totalPage = total;
            this.sellHandle = sellHandle
            this.buyHandle = buyHandle
          }else{
            clearTimeout(this.timer);//清理定时任务
            this.$message.error(res.msg);
          }
        }).catch(err=>{
          clearTimeout(this.timer) //清理定时任务
        });
      },
      handLook(row){
        this.checkbox = false;
        this.http.fetch("/otcM/order/getOtcOrdersDetails",{orderId:row.orderId},"post").then(res => {
          if(res.code===0){
            this.orderData = res.data;
            this.pay_type = res.data.payType
            this.payTypeObj = this.orderData.payList?this.orderData.payList.find(obj => obj.payType===this.pay_type):[];
            if(row.orderType===1){
              if(row.status===-1){
                this.btnText0 = '已取消';
              }else if(row.status===1){
                this.btnText0 = '取消订单';
                this.btnText1 = '确认已向对方打款'
              }else if(row.status===2){
                this.btnText0 = '等待对方确认收款并放币';
                this.btnText1 = '申诉订单'
              }else if(row.status===3){
                this.btnText0 = '已完成';
              }else if(row.status===4){
                this.btnText0 = '超时关闭';
                this.btnText1 = '申诉订单'
              }else{
                if(this.orderData.appealType===2){
                  this.orderData.status = 5;
                  this.btnText0 = '申诉中';
                  this.btnText1 = '撤销申诉'
                }else{
                  this.orderData.status = 6;
                  this.btnText0 = '对方申诉中';
                }
              }
            }else{
              if(row.status===-1){
                this.btnText0 = '已取消';
              }else if(row.status===1){
                this.btnText0 = '用户待支付';
              }else if(row.status===2){
                this.btnText0 = '确认收款并放币';
                this.btnText1 = '申诉订单'
              }else if(row.status===3){
                this.btnText0 = '已完成';
              }else if(row.status===4){
                this.btnText0 = '超时关闭';
                this.btnText1 = '申诉订单'
              }else{
                if(this.orderData.appealType===2){
                  this.btnText0 = '申诉中';
                  this.btnText1 = '撤销申诉'
                }else{
                  this.orderData.status = 6;
                  this.btnText0 = '对方申诉中';
                  this.btnText1 = '确认收款并放币';
                }
              }
            }
            this.dialogShow = 'status';
          }else{
            this.$message.error(res.msg);
          }
        });
      },
      handleTrade(api){
        if(api){
          if(api==='confirmTransfer'&&!this.checkbox){
            this.$message.error('请勾选OTC转账操作！');
            return
          }
          if(api==='releaseCurrency'&&!this.checkbox){
            this.$message.error('请勾选确认收款并向对方放币');
            return
          }
          this.http.fetch(`/otcM/order/${api}`,{orderId:this.orderId},"post").then(res => {
            if(res.code===0){
              let message={
                releaseCurrency:'确认收款并放币成功',
                confirmTransfer:'确认打款成功',
                cancelOrder:'订单取消成功',
                cancelAppealOrder:'撤销申诉成功'
              };
              this.$message({
                type: 'success',
                message:message[api]||res.msg
              });
              this.getOtcOrdersInfo();
              // this.getOrderNum();
            }else{
              this.$message.error(res.msg);
            }
          })
        }
        if(['confirmTransfer','cancelOrder','releaseCurrency'].includes(api)){
          this.dialogTitle = '';
        }
        this.dialogShow = '';
      },
      orderStep(order,type){
        this.orderId = order.orderId;
        if(this.form.orderType===1){
          if(order.status===1){
            if(type==='sure'){
              this.dialogTitle = '确认已付款'
            }else{
              this.dialogTitle = '取消订单';
            }
          }else if(order.status===2||order.status===4){
            if(type==='sure'){
              if(order.status===2&&((new Date(this.orderData.createAt).getTime()+10*60*1000)>new Date().getTime())){
                this.$message.error('付款10分钟后，方可发起申诉');
                return
              }
              this.dialogShow='complain';
            }
          }else if(order.status===5){
            if(type==='sure'){
              this.handleTrade('cancelAppealOrder');
            }
          }
        }else{
          if(order.status===2){
            if(type==='cancel'){
              this.dialogTitle = '确认已收款';
            }else{
              this.dialogShow='complain'
            }
          }else if(order.status===4){
            if(type==='sure'){
              this.dialogShow='complain';
            }
          }
          else if(order.status===5){
            if(type==='sure'){
              this.handleTrade('cancelAppealOrder');
            }
          }else if(order.status===6){
             if(type==='sure'){
              this.dialogTitle = '确认已收款'
            }
          }
        }
      }
    },
    destroyed(){
      clearTimeout(this.timer);//清理定时任务
    },
    filters:{
      filtersNum(val,len){
        return bigDecimal.round(val,len);
      },
      filterStatus(v,orderType){
        let obj = {
          '-1':'已取消','1':orderType===1?'请付款':'待用户支付','2':orderType===1?'待用户放行':'请放行',
          '3':'已完成','4':'已超时','5':'申诉中',
        };
        return obj[v]
      },
      filterPayType(v){
        let obj = {
          '1':'银行卡','2':'支付宝','3':'微信',
        };
        return obj[v]
      }
    }
  }
</script>

<style lang="less" scoped>
  .page-order{
    position: relative;
    width: 100%;height: 100%;box-sizing: border-box;padding:20px 30px;
    .order-type{
      height:50px;margin-top: 10px;line-height: 50px;position:absolute;
      display:flex;right: 0;justify-content: space-between;top:-60px;
      li{
        width: 70px;text-align: center;margin: 0 20px;cursor: pointer;
      }
      .menu-active{
        color:#409EFF;border-bottom: 1px solid #409EFF;
      }
    }
    .content-table{
      width: 100%;background-color: #fff;height:100%;
      .from-input{
        padding:15px 10px 0 10px;
        display: flex;
      }
      .pagination{
        float: right;margin-top: 20px;
      }
    }
    .suffix-order{
      padding-top:15px;padding-bottom:23px;
      h3{
        display: flex;justify-content: space-between;color:#333;font-size: 16px;
        label{
          color:#888;font-size: 14px;
        }
      }
      .pay-list{
        font-weight: normal;display: flex;margin-top:10px;
        button{
          cursor: pointer;font-size: 13px;text-align: center;width: 120px;
          height: 30px;line-height: 30px;border: 1px solid #186CFC;background-color: #fff;
          &:nth-of-type(1),&:nth-of-type(2){
            margin-right:25px;
          }
        }
        .active{
          background-color:#2B6CF6;color: #fff;
        }
      }
      .suffix-card-message{
        display: flex;justify-content: space-between;
        ul{
          color:#333;padding:10px 0;font-size: 15px;
          li{
            height:32px;line-height:32px;
            span{
              margin-left:20px;
            }
            label{
              color: #2B6CF6;margin-left: 5px;cursor: pointer;
            }
          }
        }
        p{
          width: 80px;height: 80px;margin-top: 15px;
          img{
            width: 100%;
          }
        }
      }
    }
    .suffix-button-order{
      width: 100%;
      button{
        width:205px;font-size: 14px;text-align: center;cursor: pointer;
        border:1px solid #2E6EF6;color:#2E6EF6;background-color: #fff;
        border-radius:2px;height: 40px;line-height: 40px;
        &:nth-of-type(2){
          margin-left: 15px;color: #fff;background-color:#2E6EF6;
        }
      }
      .bg1{
        background-color:#2E6EF6;
      }
      .bg2{
        background-color:#BFBFBF!important;
        border:1px solid #BFBFBF;
        color: #fff;width: 100%;
      }
      .disabled{
        background-color:#BFBFBF!important;
        border:1px solid #BFBFBF;
        color: #fff;
      }
    }
    .suffix-status{
      width:426px;
      div{
        height:70px;font-size:14px;box-sizing: border-box;
        padding:16px 20px;line-height: 24px;
        background:#F7F7F7;color:#666;
      }
      p{
        margin-top: 16px;margin-bottom: 24px;color: #333;font-size: 14px;
        .el-checkbox__input.is-checked+.el-checkbox__label{
          color: #333333!important;
        }
      }
    }
    .el-table::before {
      z-index: -1;
    }
  }
</style>
