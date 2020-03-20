<template>
  <div class="card-all">
    <el-tabs v-model="activeName">
      <el-tab-pane label="银行卡" name="1">
        <Card :realName="realName" @close-dialog="closeDialog"></Card>
      </el-tab-pane>
      <el-tab-pane label="支付宝" name="2">
        <AliPay :realName="realName" @close-dialog="closeDialog"></AliPay>
      </el-tab-pane>
      <el-tab-pane label="微信" name="3">
        <WX :realName="realName" @close-dialog="closeDialog"></WX>
      </el-tab-pane>
    </el-tabs>
  </div>

</template>

<script>
  import Card from './card';
  import WX from './wx';
  import AliPay from './alipay';
  export default {
    components:{
      Card,WX,AliPay
    },
    props:{
      realName:{
        type:String,
        default:''
      }
    },
    data() {
      return{
        activeName:'1'
      }
    },
    mounted(){

    },
    methods:{
      closeDialog(val){
        this.$emit("close-dialog",val);
      }
    }
  }
</script>

<style lang="less">
  .get-code{
    position: absolute;top:10px;left: 245px;color:#409EFF;background-color: #fff;border: 1px solid #fff;
  }
  .dialog-footer-add-card{
    text-align: center;
  }
</style>
