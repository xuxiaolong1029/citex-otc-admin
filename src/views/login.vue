<template>
  <div class="page-login">
    <div class="login-content">
      <h2>CITEX 商户管理后台</h2>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="rule-form">
        <el-form-item prop="account" label="账户">
          <el-input size="medium" placeholder="请输入登录账号"  v-model.trim="ruleForm.account"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input size="medium" type="password" placeholder="请输入登录密码"  v-model.trim="ruleForm.password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button :loading="buttonLoading" class="button" type="primary"  @click="submitForm('ruleForm')">下一步</el-button>
          <a href="https://citex.zendesk.com/hc/zh-cn/requests/new">遇到问题？提交工单</a>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        buttonLoading:false,
        ruleForm: {
          account: '',
          password: ''
        },
        rules: {
          account: [
            { required: true, message: '请输入登录账号', trigger: 'blur' },
            { min:2, max:50, message: '账户长度在 2 到 50 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入登录密码', trigger: 'blur' },
            { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
          ]
        }
      };
    },
    mounted(){

    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$router.push({ path: "/verify" });
            this.loginBut()
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      loginBut() {
        let parmars = {
          locale:"zh_CN",
          username: this.ruleForm.account,
          password: this.$md5(this.ruleForm.password),
        };
        this.buttonLoading = true;
        this.http.fetch("/otcM/user/login",parmars,"post").then(data => {
          this.buttonLoading = false;
          if (data && data.code === 0) {
            this.$store.commit("userToken",parmars);
            this.ruleForm = {
              account:'',
              password:''
            }
            if(data.data.twoVerification === 1){
              this.$router.push({path:'/verify?verify=1'})
            }else{
              if(data.data.email){
                this.$router.push({path:'/verify?verify=2'})
              }else{
                this.$router.push({path:'/verify?verify=3'})
              }
            }
          }else {
            this.$message.error(data.msg);
          }
        });
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
      height: 380px;
      background-color: #fff;
      position: relative;
      top: calc(50% - 190px);
      h2{
        padding: 50px 0 30px 0; font-size:20px;text-align: center;
      }
      .rule-form{
        width:350px;
        margin-left:60px;
        .button{width: 100%;margin-top:20px;}
        a{
          text-align: center;cursor: pointer;display: inline-block;color:#333;
          &:hover{color:#1abc9c;}
        }
      }
    }
  }
</style>
