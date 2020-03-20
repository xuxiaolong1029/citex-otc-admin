<template>
  <div class="message-box">
    <div class="mask" @click="closeMack"></div>
    <div class="message-content">
      <img src="../../assets/img/close-icon.png" class="icon" @click="closeMack" alt="" />
      <h3 class="title">
        订单详情&nbsp;
        <span :style="{color:orderData.orderType===1?'#0DA88B':'#EF5656'}">{{orderData.orderType===1?'买入':'卖出'}}</span>
      </h3>
      <div class="dialog-content">
        <ul class="order-message">
          <li>
            <label>订单号</label><span>{{orderData.orderNo}}</span>
          </li>
          <li>
            <label>订单状态</label><span>{{orderData.status | filterStatus(orderData.orderType)}}</span>
          </li>
          <li>
            <label>订单金额(CNY)</label><span>{{orderData.totalMoney}}({{orderData.price}}*{{orderData.amount}})</span>
          </li>
          <li>
            <label>{{orderData.status|filtersTitleStatue}}</label><span>{{orderData.createAt}}</span>
          </li>
          <li>
            <label>{{orderData.orderType===2?'买方':'卖方'}}实名</label><span>{{orderData.oppositeName}} 
              <i @click="isShow=true" v-if='[2,5,4,6].includes(orderData.status)'>
                <em v-if='!isShow'>查看手机号</em>
                <em class='phone-show' v-if='isShow'>{{orderData.phone}}</em>
                <em v-if='isShow' v-clipboard:copy="orderData.phone" v-clipboard:success="onCopy">&nbsp;复制</em></i>
              </span>
          </li>
        </ul>
        <slot name="suffix-order"></slot>
        <div class="order-rule" v-if="orderData.orderType===1">
          <p>1.请按提示信息向该商家汇款</p>
          <p>2.商家均通过实名认证，并在平台抵押相应数字资产，请放心兑换</p>
          <p>2.承兑商家确认收款后，相应币种系统自动划转到账，订单自动完成。</p>
          <p>3.不支持信用卡充值，建议通过银行网银、支付宝、微信转账。</p>
          <p>4.请在15分钟向承兑商家付款，超时订单将自动取消。</p>
          <p>5.任何其他问题请向CITEX客服反馈解决。</p>
        </div>
        <div class="order-rule" v-else>
          <p>1.商家将通过您绑定收款信息给您转账支付</p>
          <p>2.任何其他问题请反馈CITEX客服反馈解决</p>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  export default {
    props: {
      maskClosed:{
        type: Boolean,
        default:true
      },
      orderData:{
        type: Object,
        default:{}
      }
    },
    data(){
      return{
        isShow:false
      }
    },
    mounted(){
      
    },
    methods:{
      closeMack(){
        this.$emit("close-dialog");
      },
      onCopy(){
        this.$message.success('复制成功');
      }
    },
    filters:{
      filtersTitleStatue(val){
        switch(val){
          case -1:return '取消时间';break;
          case 1:return '创建时间';break;
          case 2:return '付款时间';break;
          case 3:return '完成时间';break;
          case 4:return '超时时间';break;
          case 5:return '申诉时间';break;
          case 6:return '申诉时间';break;
          default : return ''; break;
        }
      },
      filterStatus(v,orderType){
        switch(v){
          case -1:return '已取消';break;
          case 1:return orderType===1?'请付款':'待用户支付';break;
          case 2:return orderType===1?'已付款':'请放行';break;
          case 3:return '已完成';break;
          case 4:return '已超时';break;
          case 5:return '申诉中';break;
          case 6:return '对方申诉中';break;
          default : return ''; break;
        }
      },
    }
  }
</script>
<style scoped lang="less">
  @import './dialog.less';
  .dialog-content{
    padding:20px 25px!important;
    .order-message{
      width:100%;color: #333333;
      border:1px solid rgba(238,238,238,1);
      li{
        height: 40px;line-height: 40px;border-top:1px solid rgba(238,238,238,1);
        &:nth-of-type(1){
          border-top:none;
        }
        label{
          height: 39px;padding-left: 20px;color: #333;font-size: 12px;
          display: inline-block;width: 130px;background-color:#F7F7F7;border-right: 1px solid #eee;
        }
        span{
          display: inline-block;padding-left: 25px;font-size: 14px;
          i{
             background: url('../../assets/img/phone.png') no-repeat left center;
            background-size:18px 20px; padding-left:20px;cursor: pointer;
            font:12px normal;margin-left: 4px;color:#2B6CF6;
            .phone-show{
              color:#333;font-size: 14px;margin-right:5px;
            }
          }
        }
      }
    }
    .order-rule{
      width:100%;height:auto;padding: 15px 12px;box-sizing: border-box;
      background-color:rgba(247,247,247,1);
      p{
        font-size: 13px;line-height: 24px;color: #666;
      }
    }
  }
</style>
