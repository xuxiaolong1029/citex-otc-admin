<template>
  <div style="margin-top: 20px">
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
      <el-form-item label="姓名">
        <el-input style="width:240px" :placeholder="realName" disabled></el-input>
      </el-form-item>
      <el-form-item label="卡号" prop="account">
        <el-input style="width:240px" placeholder="请输入银行卡账户" maxLength="25" v-model.trim="ruleForm.account"></el-input>
      </el-form-item>
      <el-form-item label="银行" prop="bankName">
        <el-input style="width:240px" placeholder="请输入开户银行" v-model.trim="ruleForm.bankName"></el-input>
      </el-form-item>
      <el-form-item label="开户支行" prop="bankAddr">
        <el-input style="width:240px" placeholder="请输入开户支行" v-model.trim="ruleForm.bankAddr"></el-input>
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
  export default {
    props:{
      formObj:{
        type:Object,
        default:()=>{}
      },
      realName:{
        type:String,
        default:''
      }
    },
    data(){
      return{
        defultTxt:'发送验证码',
        conutDisabled:false,
        verifyType:this.$store.state.verifyType,
        ruleForm:{
          account:'',bankName:'',bankAddr:'',verifiyCode:''
        },
        rules: {
          account: [
            { required: true, message: '请输入账号', trigger: 'change' }
          ],
          bankName: [
            { required: true, message: '请输入开户银行', trigger: 'change' }
          ],
          bankAddr: [
            { required: true, message: '请输入开户支行', trigger: 'change' }
          ],
          verifiyCode: [
            { required: true, message: '请输入验证码', trigger: 'change' }
          ]
        }
      }
    },
    mounted(){
      if(this.formObj){
        this.ruleForm = {...this.formObj}
      }
    },
    methods:{
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.bindCard()
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      bindCard(){
        let data={
          type:this.verifyType,
          name:this.realName,
          payType:1,
          ...this.ruleForm
        };
        let URL = this.formObj?'/otcM/payment/updatePayment':'/otcM/payment/bindPayment';
        this.http.fetch(URL,data, "post").then(res => {
          if (res.code === 0) {
            this.$message({
              message:`银行卡${this.formObj?'修改':'绑定'}成功!`,
              type: 'success'
            });
            this.$emit("close-dialog",'1');
          }else{
            this.$message.error(res.msg);
          }
        });
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
      closeDialog(formName){
        this.$refs[formName].resetFields();
        this.$emit("close-dialog");
      }
    }
  }
</script>

<style lang="less" scoped>
</style>
