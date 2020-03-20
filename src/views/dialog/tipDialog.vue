<template>
  <div class="message-box" v-if="title">
    <div class="mask" @click="closeMack"></div>
    <div class="message-content">
      <img src="../../assets/img/close-icon.png" class="icon" @click="closeMack" alt="" />
      <h3 class="title">
        <span v-if="!status" :style="{color:orderType===1?'#0DA88B':'#EF5656'}">{{orderType===1?'买入':'卖出'}}</span>{{title}}
      </h3>
      <div class="dialog-content">
        <slot name="suffix"></slot>
      </div>
    </div>
  </div>

</template>

<script>
  export default {
    props: {
      orderType:{
        type:Number,
        default:1
      },
      status:{
        type:Number,
        default:null
      },
      title: {
        type: String,
        default:''
      }
    },
    methods:{
      closeMack(){
        this.$emit("close-dialog");
      }
    }
  }
</script>
<style scoped lang="less">
  @import './dialog.less';
  .message-box {
    position: relative;
    .mask {
      z-index: 551;
    }
    .message-content {
      z-index: 552;
    }
  }
</style>
