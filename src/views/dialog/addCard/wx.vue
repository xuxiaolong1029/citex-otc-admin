<template>
  <div style="margin-top: 20px">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
      <el-form-item label="姓名">
        <el-input style="width:240px" :placeholder="realName" disabled></el-input>
      </el-form-item>
      <el-form-item label="微信号" prop="account">
        <el-input style="width:240px" placeholder="请输入微信账号" v-model.trim="ruleForm.account"></el-input>
      </el-form-item>
      <el-form-item label="二维码" class="pay-otc-list" prop="fileName">
        <el-upload class="avatar-uploader" action="/otcM/upload"
                   name="multipartFile"
                   :show-file-list="false"
                   :on-success="handleUploadSuccess"
                   :before-upload="beforeApplyUpload">
          <img v-if="qrcode_url" :src="qrcode_url" alt="" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item prop="verifiyCode" :label="`${verifyType==='1'?'谷歌':verifyType==='2'?'邮箱':'手机'}验证码`" style="position: relative;">
        <el-input style="width:240px" maxleng="6" v-model.trim="ruleForm.verifiyCode" :placeholder="`请输入${verifyType==='1'?'谷歌':verifyType==='2'?'邮箱':'手机'}验证码`" ></el-input>
        <button v-if="verifyType!=='1'" class="get-code" @click.prevent="sendCode" :disabled="conutDisabled">{{defultTxt}}</button>
      </el-form-item>
      <el-form-item>
        <el-button @click="closeDialog('ruleForm')">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import Mixin from './mixin';
  let mixin = new Mixin({
    payType:3
  });
  export default {
    mixins:[mixin]
  }
</script>
<style lang="less">
  @import "./upload";
</style>
