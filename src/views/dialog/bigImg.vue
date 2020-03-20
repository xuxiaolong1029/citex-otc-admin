<template>
  <div class="message-box" v-if="bigImg">
    <div class="mask" @click="closeMack"></div>
    <div class="message-content">
        <p><img class="big-img" :src="bigImg" alt="" /></p>
        <img @click="closeMack" class="close" src="../../assets/img/img-close.png" alt="">
    </div> 
  </div>

</template>

<script>
  export default {
    props: {
      bigImg: {
        type: String,
        default:()=>''
      }
    },
    mounted(){

    },
    methods:{
      closeMack(){
        this.$emit("close-dialog");
      }
    }
  }
</script>
<style scoped lang="less">
  .message-box {
  position: relative;
  .mask {
    width: 100%;height:100%;position: fixed;left: 0;top: 0;background: rgba(0, 0, 0, 0.6);z-index:502;
  }
  .message-content {
    position:fixed;box-sizing:border-box;left:50%;top:50%;z-index:601;
    transform:translate(-50%,-50%);border-radius:5px;margin:auto;text-align: center;
    .big-img{
      max-height: 800px;min-height: 200px;background-color:#000;
    }
    .close{
      width: 32px;height: 32px;margin-top:20px;
    }
  }
 
}
</style>
