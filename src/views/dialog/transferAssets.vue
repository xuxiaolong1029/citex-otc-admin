<template>
  <div class="game-assets-otc" v-if="transferDialog">
    <div class="dialog-box">
      <!-- 活动账户资产 -->
      <p class="dialog-title">OTC账户</p>
      <div class="tab-items">
        <div class="item" :class="tabIndex==='0'?'active':''" @click="tabIndex='0'">资产划转</div>
        <div class="item" :class="tabIndex==='1'?'active':''" @click="tabIndex='1'">划转记录</div>
      </div>
      <div class="content">
        <div class="first-content" v-show="tabIndex==='0'">
          <div class="switch-assets">
            <div class="left-box">
              <div class="left-box-div">
                <div>
                  <span class="lable">从</span><!-- 从 -->
                  <span>{{accountType===1?'币币账户':'OTC账户'}}</span><!-- 币币账户> 节点账户-->
                </div>
                <div>
                  <span class="lable">到</span> <!-- 到 -->
                  <span>{{accountType===-1?'币币账户':'OTC账户'}}</span><!-- 币币账户 >节点账户-->
                </div>
              </div>
            </div>
            <div class="right-box">
              <div>
                <div class="rotate-icon" @click="rotate">
                  <div :class="addAnimation?'rotate':''"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="input-num">
            <!-- 请输入划转数量 (\.\d{1,3})?$-->
            <input type="text" @keyup="inputData" v-model.trim="modelNumber" placeholder="请输入划转数量" />
            <el-select v-model.trim="currencySymbol" size="small">
              <el-option key="3" label="USDT" value="USDT"></el-option>
            </el-select>
          </div>
          <div class="account-num">
            <!-- 币币账户 ||  节点账户 || 可用余额：-->
            <label>{{accountType===1?'币币账户可用':'OTC账户可用'}} : <span>{{accountType===1?otcAccount.accountBalance:otcAccount.availableQty | filtersNum}} {{currencySymbol}}</span></label>
            <label>{{accountType===1?'OTC账户可用':'冻结'}} : <span>{{accountType===1?otcAccount.availableQty:otcAccount.frozenQty | filtersNum}} {{currencySymbol}}</span></label>
          </div>
          <div class="slider-otc">
            <el-slider v-model="sliderValue" @input="sliderComputed" :marks="marks" :format-tooltip="formatTooltip"></el-slider>
          </div>
          <div class="transfer-otc">
            <!-- 划转 -->
            <button @click="transfer" type="button" :disabled="isDisabled">划转</button>
          </div>
        </div>
        <div class="second-content" v-show="tabIndex==='1'">
          <ul class="second-content-head">
            <!-- 时间 -->
            <li style="flex: 1.9;">时间</li>
            <!-- 币种 -->
            <li>币种</li>
            <!-- 数量 -->
            <li>数量</li>
            <!-- 类型 -->
            <li style="flex: 2.3;">类型</li>
          </ul>
          <ul class="second-content-body">
            <li v-for="(item,index) in transferList" :key="index">
              <div style="flex: 1.9;">{{item.createTime | filterTime}}</div>
              <div>{{item.currencyName}}</div>
              <div>{{item.tradeQty | filtersNum}}</div>
              <div style="flex:2.3;">{{item.tradeType===1?'币币账户->法币账户':'法币账户->币币账户'}}</div>
            </li>
          </ul>
          <div class="pagination">
            <el-pagination v-if="totalSize>10" background small
              :current-page.sync="pageNum"
              @current-change="getTransferList"
              :page-size="10"
              layout="prev, pager, next"
              :total="totalSize">
            </el-pagination>
          </div>
          <div v-if="transferList.length===0" class="no-data">暂无数据</div>
        </div>
      </div>
      <div class="close-assets el-icon-close" @click="closeAssets"></div>
    </div>
  </div>
</template>

<script>
  import { mapActions,mapState } from "vuex";
  import { subStringNum,formatTime } from "../../utils/utils";
  import bigDecimal from "js-big-decimal";
  export default {
    data() {
      return {
        addAnimation: false,
        tabIndex: "0",
        marks:{0:'0', 25: '25%', 50:'50%', 75:'75%', 100:'100%'},
        // 账户类型 1币币账户到节点账户 -1聚变账户到币币账户
        accountType:1,
        balance:0,
        modelNumber: '',
        currencySymbol:'USDT',
        sliderValue:0,
        isDisabled:true,
        transferList:[],
        totalSize:0,
        pageNum:1
      };
    },
    watch: {
      tabIndex(val){
        if(val==='1'){
          this.getTransferList();
        }
      },
      modelNumber(val){
        if(val){
          this.isDisabled = false;
        }else{
          this.isDisabled = true;
        }
      }
    },
    props: {
      transferDialog: {
        type: Boolean,
        default:false
      }
    },
    computed: {
      ...mapState([
        "otcAccount",
      ])
    },
    methods: {
      ...mapActions(["getOtcAccountInfo","getMerchantInfo"]),
      inputData(){
        let ifNum = (this.modelNumber.toString()).split('.')[1];
        if(ifNum&&ifNum.length>4){
          this.modelNumber = Number(this.modelNumber.split('.')[0]+'.'+ifNum.substr(0,4));
        }
      },
      //划转记录
      getTransferList(){
        let par={
          pageNum:this.pageNum,
          pageSize: 10
        };
        this.http.fetch("/otcM/transfer/queryTransferRecord",par,"post").then(res => {
          if(res.code===0){
            this.transferList = res.data.list;
            this.totalSize = res.data.total
          }
        });
      },
      // 切换账户
      rotate() {
        this.addAnimation=true;
        // 账户类型 1币币账户到节点账户 -1节点账户到币币账户
        this.accountType = this.accountType===1?-1:1;
        this.modelNumber="";
        this.sliderValue = 0;
        setTimeout(() => {
          this.addAnimation=false;
        }, 400);
      },
      // 资金划转
      transfer() {
        if (!this.modelNumber) {
          this.$message.error('请输入划转数量');//请输入划转数量
          return;
        }
        if (this.modelNumber === 0) {
          this.$message.error('转账数量不能为0，请输入转账数量');//转账数量不能为0，请输入转账数量
          return;
        }
        if (isNaN(this.modelNumber)) {
          this.$message.error('请输入正确的数量');//请输入正确的数量
          return;
        }
        let parmas = {
          tradeType: this.accountType, //'操作方向：1入账;-1出账'
          amount: this.modelNumber, //划转数量
          currencyId:3
        };
        this.isDisabled = true;
        this.http.fetch("/otcM/transfer/transfer",parmas,"post").then(res => {
          this.isDisabled = false;
          this.modelNumber="";
          this.sliderValue=0;
          if (res && res.code === 0) {
            this.$message.success('划转成功');
            this.getMerchantInfo({});
            this.getOtcAccountInfo({});
          }else {
            this.$message.error(res.msg);
          }
        });
      },
      // 关闭弹框
      closeAssets() {
        this.tabIndex='0';
        this.modelNumber="";
        this.sliderValue = 0;
        this.$emit("close-dialog");
      },
      sliderComputed(val){
        let account  = this.accountType===1?this.otcAccount.accountBalance:this.otcAccount.availableQty;
        let num = subStringNum(bigDecimal.multiply(account,val/100),3);
        this.modelNumber=Number(num)===0?'':num;
      },
      formatTooltip(val){
        return val+'%'
      },
    },
    filters: {
      filterTime(time) {
        return formatTime(time, "/");
      },
      filtersNum(val){
        let value = Number(val) || 0;
        if(value%1!==0){
          return subStringNum(value,4);
        }else{
          return value
        }
      }
    }
  };
</script>
<style scoped lang="less">
  .game-assets-otc {
    width: 100%;height: 100%;position: fixed;
    background: rgba(0, 0, 0, 0.6);
    top: 0;left: 0;
    padding-top: 140px;
    z-index: 999;
    .dialog-box {
      width: 500px;margin: 0 auto;position: relative;background-color:#F8FBFF;
      overflow: hidden;border-radius: 5px;height: 500px;
      .dialog-title {
        height: 50px;line-height:50px;padding-left:30px;text-align: left;
        background: #fff;border-bottom: 1px solid #eee;color: #333;
      }
      .tab-items {
        padding-top:10px;width: 100%;height:50px;display: flex;border-bottom: 1px solid #eee;
        .item {
          height: 100%;flex: 1;text-align: center;
          cursor: pointer;line-height: 50px;
          position: relative;font-size: 16px;color:#666;
        }
        .active {
          color: #388CFF;border-bottom: 2px solid #388CFF;
        }
      }
      .content {
        width: 100%;height: auto;
        .first-content {
          padding: 0 30px 0 30px;
          .switch-assets {
            height: 54px;
            position: relative;
            margin: 30px 0 0;
            border-radius: 10px;
            overflow: hidden;
            padding: 10px 0 0 15px;
            background: #F5F5F5;
            .left-box {
              .left-box-div {
                display: flex;color: #333;font-size: 16px;margin-top:12px;
                div {
                  flex: 1;
                  color: #333333;
                  font-size: 19px;
                  &:last-child{
                    margin-left: 85px;
                  }
                }
                .lable {
                  color:#999999;
                  font-size: 19px;
                  width: 30px;
                  margin-right: 15px;
                }
              }

            }
            .right-box {
              position: absolute;top: 10px;right: 200px;width: 54px;height: 34px;padding: 4px 0;
              > div {
                width: 100%;height: 100%;border-left: 1px solid #e2e2e2;
              }
              .rotate-icon {
                width: 54px;
                height: 34px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                > div {
                  width: 100%;
                  height: 100%;
                  background: url("../../assets/img/switch.png") no-repeat center;
                }
              }
              .rotate {
                transition: all 0.3s;
                animation: rrotate 0.3s linear;
              }
              .rotates {
                transition: all 0.3s;
                animation: rrrotate 0.3s linear;
              }
              @keyframes rrotate {
                from {
                  transform: rotate(0);
                }
                to {
                  transform: rotate(360deg);
                }
              }

              @keyframes rrrotate {
                from {
                  transform: rotate(360deg);
                }
                to {
                  transform: rotate(0);
                }
              }
            }
          }
          .input-num {
            width: 100%;
            height: 50px;
            border-radius: 5px;
            margin-top: 30px;
            background: #F5F5F5;
            input {
              width: 70%;
              height: 100%;
              line-height: 50px;
              box-shadow:0 0 0 0 #F5F5F5;
              margin-left: 18px;
              font-size: 18px;
              border: none;
              background: #F5F5F5;
            }
          }
          .account-num{
            margin-top: 10px;font-size: 13px;color: #666;display: flex;justify-content: space-between;

          }
          .transfer-otc {
            margin: 50px auto 0;
            button{
              width:100%;border: none;color: #fff;text-align: center;
              border-radius: 2px;background:rgba(56,140,255,1);cursor: pointer;
              font-size: 16px;height: 40px;line-height: 40px;
              &:disabled{
                background:rgba(56,140,255,.5);
                border-color: #a0cfff;
                cursor: no-drop;
              }
            }
          }
        }
        .second-content {
          height:390px;position: relative;overflow: hidden;
          .second-content-head{
            height: 40px;line-height: 40px;display: flex;color: #999;
            border-bottom: 1px solid #eee;
            li{
              flex: 1;text-align: center;
            }
          }
          .second-content-body{
            height: 300px;width: 100%;overflow-y: auto;
            li{
              display: flex;height: 40px;line-height:40px;border-bottom: 1px solid #f1f1f1;
              div{
                flex: 1;text-align: center;font-size: 14px;color: #333;
              }
            }
          }
          .pagination{
            float: right;margin-top:15px;
          }
          .no-data{
            font-size: 12px;
            color: #c5cfd5;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translateX(-50%) translateY(50%);
            border: 0 none !important;
          }
        }
      }
    }
    .close-assets {
      cursor: pointer;
      width: 19px;
      height: 20px;
      position: absolute;
      right:30px;
      top:18px;
      font-size: 18px;
      color: #333;
    }
  }
</style>
