<template>
  <div class="page-login">
    <div class="login-content">
      <h2>CITEX 商户管理后台</h2>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="rule-form">
        <el-form-item prop="verify" :label="fromLabel">
          <el-input size="medium" placeholder="请输入验证码"  v-model.trim="ruleForm.verify"></el-input>
        </el-form-item>
        <el-form-item style="position: relative;">
          <el-button class="button" :loading="buttonLoading" type="primary"  @click="submitForm('ruleForm')">下一步</el-button>
          <a href="https://citex.zendesk.com/hc/zh-cn/requests/new">遇到问题？提交工单</a>
          <button v-if="verifyType!=='1'" @click="sendCode" :disabled="conutDisabled" class="get-verify-code">{{defultTxt}}</button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import { mapState } from "vuex";
  export default {
    data() {
      return {
        imgHeight:document.documentElement.clientHeight-3,
        buttonLoading:false,
        fromLabel:'验证码',
        verifyType:'1',
        defultTxt:'发送验证码',
        conutDisabled:false,
        ruleForm: {
          verify: '',
        },
        rules: {
          verify: [
            { required: true, message: '请输入验证码', trigger: 'blur' },
            { min:6, max:6, message: '验证码为6位数字', trigger: 'blur' }
          ]
        }
      };
    },
    computed: {
      ...mapState([
        "userToken",
      ])
    },
    mounted(){
      if(this.userToken){
        this.verifyType = this.$route.query.verify;
        this.fromLabel = this.verifyType==='1'?'谷歌验证码':this.verifyType==='2'?'邮箱验证码':'手机验证码';
        if(this.verifyType!=='1'){
          this.sendCode()
        }
      }else{
        this.$router.push({path:'/login'})
      }
    },
    methods: {
      sendCode(){
        let URL = this.verifyType==='2'?'/otcM/user/sendVerifycode/email':'/otcM/user/sendVerifycode/phone';
        this.http.fetch(URL,{username:this.userToken.username}, "post").then(data => {
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
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.verify()
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      verify() {
        if(this.userToken){
          let par = {
            type:this.verifyType,
            verifyCode:this.ruleForm.verify,
            ...this.userToken
          };
          this.buttonLoading = true;
          this.http.fetch("/otcM/user/loginVerification",par,"post").then(data => {
            this.buttonLoading = false;
            if (data.code === 0) {
              localStorage.setItem("userToken",JSON.stringify(data.data));
              this.$router.push({ path: "/index" });
            } else {
              this.$message.error(data.msg);
            }
          }).catch((err)=>{
            this.$message.error(err);
          })
        }else{
          this.$router.push({path:'/login'})
        }

      },
    }
  }

</script>
<style scoped lang="less">
  .page-login{
    background:#1abc9c;
    width:100%;
    height: 100%;
    .login-content{
      margin:auto;
      vertical-align: middle;
      width: 560px;
      height: 280px;
      background-color: #fff;
      position: relative;
      top: calc(50% - 190px);
      h2{
        padding: 50px 0 30px 0; font-size:20px;text-align: center;
      }
      .rule-form{
        width:350px;
        margin-left:60px;
        .button{
          width: 100%;margin-top:10px;
        }
        a{
          text-align: center;cursor: pointer;display: inline-block;text-underline: none;
          &:hover{
            color:#409EFF;
          }
        }
        .get-verify-code{
          position: absolute;left:250px;z-index:10;top:-55px;color:#409EFF;
          cursor: pointer;background-color: #fff;border: 1px solid #fff;
          display: inline-block;width:120px;
        }
      }
    }
  }
</style>
