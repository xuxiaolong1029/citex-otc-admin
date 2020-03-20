<template>
  <div class="message-box">
    <div class="mask" @click="closeMack"></div>
    <div class="message-content">
      <img src="../../assets/img/close-icon.png" class="icon" @click="closeMack" alt="" />
      <h3 class="title">
        {{title}}&nbsp;
      </h3>
      <div class="dialog-content upload-complain">
        <el-select style="width: 100%" v-model="form.reason" placeholder="选择申诉原因">
          <el-option
            v-for="(item,index) in options"
            :key="index+'c'"
            :label="item"
            :value="item">
          </el-option>
        </el-select>
        <el-input
          style="margin-top: 25px;"
          type="textarea"
          :autosize="{ minRows:4, maxRows:6}"
          maxlength="150"
          show-word-limit
          placeholder="请说明提报申诉的具体原因（150个字符以内）"
          v-model="form.complain">
        </el-input>
        <p class="upload-title"><label>上传附件(选填)</label> <span>上传的每个附件大小不超过5M</span></p>
        <el-upload
          style="margin-top: 20px"
          action="/otcM/upload"
          name="multipartFile"
          :limit="3"
          list-type="picture-card"
          :before-upload="beforeAvatarUpload"
          :on-success="handleUploadSuccess"
          :on-remove="handleRemove">
          <img src="../../assets/img/upload.png" style="width:36px;text-align: center;margin-bottom: 22px;" alt="" />
        </el-upload>
        <div class="button">
          <button @click="closeMack()">取消</button>
          <button @click="sureComplain()">确认</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  export default {
    props: {
      title:{
        type:String,
        default:'提起申诉'
      },
      orderType:{
        type:Number,
        default:1
      },
      orderId:{
        type:String,
        default:''
      }
    },
    data(){
      return{
        options: [],
        form:{},
        imageUrl:[],
        qrcode_url: "",
        uploadLoading:false,//二维码上传loading
      }
    },
    mounted(){
      if(this.orderType===1){
        this.options=['商户已付款，但用户不确认收款']
      }else{
        this.options=['未付款时，用户点击已付款','用户已付款，但付款金额错误','用户已付款，但付款账户与实名信息不一致']
      }
    },
    methods:{
      closeMack(){
        this.$emit("close-dialog");
      },
      sureComplain(){
        let par={
          orderId:Number(this.orderId),
          appealReason:this.form.reason,
          appealRemark:this.form.complain,
          imageUrl:this.imageUrl
        };
        this.http.fetch(`/otcM/order/appealOrder`,par,"post").then(res => {
          if(res.code===0){
            this.$message({
              type: 'success',
              message:'申诉发起成功'
            });
            this.$emit("close-dialog");
          }else{
            this.$message.error(res.msg);
          }
        });
      },
      handleRemove(file, fileList) {
        this.imageUrl.splice(this.imageUrl.findIndex(item => item=== file.response.data), 1)
      },
      // 上传二维码成功回调
      handleUploadSuccess(response) {
        this.imageUrl.push(response.data);
      },
      // 上传图片格式校验
      beforeAvatarUpload(file) {
        this.uploadLoading = true;
        //验证图片格式
        const isJPG =
          file.type === "image/jpg" ||
          file.type === "image/png" ||
          file.type === "image/jpeg";
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isJPG) {
          this.uploadLoading = false;
          this.$toast.error(this.$t("lang.pec064"));
        }
        if (!isLt5M) {
          this.uploadLoading = false;
          this.$toast.error(this.$t("lang.pec064"));
        }
        return isJPG && isLt5M;
      }
    }
  }
</script>
<style>
  .el-upload-list--picture-card .el-upload-list__item{
    width:80px!important;height:80px!important;
  }
</style>
<style scoped lang="less">
  @import './dialog.less';
  .dialog-content{
    padding:20px 25px!important;
    .upload-title{
      margin-top: 15px;display: flex;justify-content: space-between;
      label{
        font-weight: bold;
      }
    }
    .button{
      margin-top: 25px;
      button{
        width:205px;font-size: 14px;text-align: center;
        border:1px solid #2E6EF6;color:#2E6EF6;
        border-radius:2px;height: 45px;line-height: 45px;
        background-color: #fff;
        &:nth-of-type(2){
          margin-left: 15px;color: #fff;background-color:#2E6EF6;
        }
      }
    }
  }
</style>
