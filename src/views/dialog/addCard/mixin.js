export default function (config) {
  let { payType } = config;
  return {
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
        rules: {
          account: [
            { required: true, message: '请输入账号', trigger: 'change' }
          ],
          fileName: [
            { required: true, message: '请上传二维码', trigger: 'change' }
          ],
          verifiyCode: [
            { required: true, message: '请输入验证码', trigger: 'change' }
          ]
        },
        defultTxt:'发送验证码',
        conutDisabled:false,
        verifyType:this.$store.state.verifyType,
        qrcode_url:'',
        ruleForm:{
          account:'',verifiyCode:'',fileName:''
        }
      }
    },
    mounted(){
      if(this.formObj){
        this.ruleForm = {...this.formObj}
      }
      this.qrcode_url = this.ruleForm.fileName
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
          payType:payType,
          name:this.realName,
          ...this.ruleForm
        };
        let URL = this.formObj?'/otcM/payment/updatePayment':'/otcM/payment/bindPayment';
        this.http.fetch(URL,data, "post").then(res => {
          if (res.code === 0) {
            this.$message({
              message:`${payType===2?'支付宝':'微信'}账号${this.formObj?'修改':'绑定'}成功!`,
              type: 'success'
            });
            this.$emit("close-dialog",'1');
          }else{
            this.$message.error(res.msg);
            return
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
      sendCode(){
        let URL = this.verifyType==='2'?'/otcM/payment/getEmailVerifyCode':'otcM/payment/getPhoneVerifyCode'
        this.http.fetch(URL,{}, "post").then(res => {
          if(res.code===0){
            this.$message.success('发送成功，请注意查收');
            this.countDown()
          }else{
            this.$message.error(res.msg);
          }
        });
      },
      handleUploadSuccess(res,file) {
        this.qrcode_url = URL.createObjectURL(file.raw);
        this.ruleForm.fileName = res.data;
      },
      beforeApplyUpload(file) {
        let isJPG = ['image/jpeg','image/png','image/jpg'].includes(file.type);
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isJPG) {
          this.$message.error('请上传正确的图片格式！');
          return false
        }
        if (!isLt5M) {
          this.$message.error('上传图片大小不能超过 5MB!');
          return false
        }
      },
      closeDialog(){
        this.$emit("close-dialog");
      }
    }
  }
}
