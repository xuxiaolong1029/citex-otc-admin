<template>
  <div class="message-box" style="width: 300px">
    <div class="mask" @click="closeMack"></div>
    <div class="message-content">
      <img src="../../assets/img/close-icon.png" class="icon" @click="closeMack" alt="" />
      <h3 class="title">
        <span>{{orderData.entrusType===1?'买入':'卖出'}}设置</span>
      </h3>
      <div class="dialog-content">
        <ul class="dialog-message">
          <li>
            币种<label>{{contractAll.contractName?contractAll.contractName.split('-')[0]:'USDT'}}</label>
          </li>
          <li>
            参考价格<label>{{orderData.entrusType===1?contractAll.buyPrice:contractAll.sellPrice}}{{contractAll.contractName?contractAll.contractName.split('-')[1]:'CNY'}}</label>
          </li>
          <li>
            价格CNY<label>
            <el-input-number :precision='2' :step="0.01" controls-position="right" v-model.trim="form.price"
                             :min="(Math.floor((this.orderData.entrusType===1?this.contractAll.buyPrice:this.contractAll.sellPrice)*100)-3)/100"
                             :max="(Math.floor((this.orderData.entrusType===1?this.contractAll.buyPrice:this.contractAll.sellPrice)*100)+3)/100" size="mini">
            </el-input-number>
          </label>
          </li>
          <li>
            数量
            <label>
              <el-input style="width: 130px;" size="small" :placeholder="`请输入${orderData.entrusType===1?'买入':'卖出'}数量`" v-model.trim="form.quantity"></el-input>&nbsp; USDT
            </label>
          </li>
          <li v-if="orderData.entrusType!==1" class="dialog-message-fr">
            <label></label><label>可用：{{otcAccount.availableQty}}{{contractAll.contractName?contractAll.contractName.split('-')[0]:'USDT'}}<span @click="transferDialog=true">划转</span></label>
          </li>
          <li>
            收款方式<label>
            <el-checkbox v-if="paymentList.find((obj) => obj.payType===2)" v-model="form.alipay" label="支付宝"></el-checkbox>
            <el-checkbox v-if="paymentList.find((obj) => obj.payType===3)" v-model="form.wechat" label="微信"></el-checkbox>
            <el-checkbox v-if="paymentList.find((obj) => obj.payType===1)" v-model="form.bankCard" label="银行卡"></el-checkbox>
          </label>
          </li>
          <li style="position: relative;">
            {{verifyType==='1'?'谷歌验证码':verifyType==='2'?'邮箱验证码':'手机验证码'}}
            <label>
              <el-input :style="{marginRight:verifyType==='1'?'0px':'105px'}" style="width: 170px;" size="small" :placeholder="`请输入${verifyType==='1'?'谷歌':verifyType==='2'?'邮箱':'手机'}验证码`" v-model.trim="form.code"></el-input>
              <button v-if="verifyType!=='1'" class="get-code" @click="sendCode" :disabled="conutDisabled">{{defultTxt}}</button>
            </label>
          </li>
         <!--  <li>
            是否在线
            <label>
              <el-switch v-model="form.enable" active-text="是" inactive-text="否"></el-switch>
            </label>
          </li> -->
        </ul>
        <div class="suffix-button">
          <button @click="keepSet">发布广告</button>
        </div>
      </div>
    </div>
    <Transfer :transferDialog="transferDialog" @close-dialog ='transferDialog=false'></Transfer>
  </div>
</template>

<script>
  import { mapActions,mapState } from "vuex";
  import Transfer from './transferAssets'
  export default {
    components:{
      Transfer
    },
    props: {
      orderData:{
        type: Object,
        default:{}
      }
    },
    data(){
      return{
        verifyType:'',
        transferDialog:false,
        defultTxt:'发送验证码',
        conutDisabled:false,
        timer:null,
        form:{},
        paymentList:[]
      }
    },
    computed: {
      ...mapState([
        "otcAccount","contractAll","currencyAll","paymentAllList"
      ])
    },
    created(){
      if(Object.keys(this.otcAccount).length===0){
        this.getOtcAccountInfo({});
      }
    },
    mounted() {
      this.paymentList = this.paymentAllList.filter(item => item.enable===0)
      this.verifyType = localStorage.getItem('verifyType');
      this.form = {...this.orderData};
      this.form.price = this.orderData.entrusType===1?this.contractAll.buyPrice:this.contractAll.sellPrice;
    },
    methods: {
      ...mapActions(["getOtcAccountInfo","getMerchantInfo"]),
      //倒计时
      countDown() {
        let count = 60;
        let that = this;
        that.conutDisabled = true;
        that.defultTxt = count + "s后重新发送";
        that.timer = setInterval(() => {
          count--;
          if (count <= 0) {
            clearInterval(that.timer);
            that.defultTxt = "再次发送";
            that.conutDisabled = false;
            return;
          }
          that.defultTxt = count + "s后重新发送";
        },1000);
      },
      sendCode(){
        let URL = this.verifyType==='2'?'/otcM/payment/getEmailVerifyCode':'otcM/payment/getPhoneVerifyCode';
        this.http.fetch(URL,{}, "post").then(data => {
          if(data.code===0){
            this.$message.success('发送成功，请注意查收');
            this.countDown()
          }else{
            this.$message.error(data.msg);
          }
        });
      },
      keepInputErr(amt,label){
        let compare = label==='最小'?this.form.quantity<amt:this.form.quantity>amt;
        if(compare){
          this.$message.error(`${label}${this.orderData.entrusType===1?'买入':'卖出'}数量为${amt}`);
          return false
        }else{
          return true
        }
      },
      keepSet(){
        this.form.alipay=this.form.alipay===true?0:1;
        this.form.wechat=this.form.wechat===true?0:1;
        this.form.bankCard=this.form.bankCard===true?0:1;
        this.form.enable=this.form.enable===true?0:1;
        let par = {
          contractId:this.contractAll.contractId,
          ...this.form,
          type:this.verifyType
        };
        if(this.form.quantity>=0){
          this.http.fetch("/otcM/entrust/werben",par,"post").then(res => {
            if(res.code===0){
              this.$message.success(res.msg);
              this.getMerchantInfo({});
              this.$emit("close-dialog",'1');
            }else{
              this.$message.error(res.msg);
            }
          });
        }else{
          this.$message.error(`请输入正确的${this.orderData.entrusType===1?'买入':'卖出'}数量`);
        }
      },
      closeMack(){
        this.$emit("close-dialog");
      }
    }
  }
</script>
<style scoped lang="less">
  @import './dialog.less';
  .dialog-content{
    padding:20px 25px;
    .dialog-message{
      color: #999;
      li{
        display: flex;justify-content: space-between;height: 45px;line-height: 45px;
        label{
          color: #333;
        }
        .get-code{
          margin-left:0;margin-top: 3px;left:325px;
        }
      }
      .dialog-message-fr{
        height: 39px;line-height:30px;width: 100%;font-size: 13px;
        label{
          color: #555;
          span{
            color: #2E6EF6;margin-left:50px;cursor: pointer;margin-right: 10px;
          }
        }
      }
    }
  }
</style>
