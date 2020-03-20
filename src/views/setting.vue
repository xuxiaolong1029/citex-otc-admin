<template>
  <div class="page-setting">
    <div class="content-table">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="交易类型">
          <template slot-scope="scope">
            {{scope.row.type===1?'买入':'卖出'}}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价">
          <template slot-scope="scope">
            {{scope.row.price || '/'}}
          </template>
        </el-table-column>
        <el-table-column label="数量">
          <template slot-scope="scope">
            {{scope.row.quantity || '/'}}
          </template>
        </el-table-column>
        <el-table-column label="支付方式">
          <template slot-scope="scope">
            <label v-if="scope.row.alipay===1&&scope.row.wechat===1&&scope.row.bankCard===1">/</label>
            <label v-else>
              {{scope.row.alipay===0?'支付宝':''}}
              {{scope.row.wechat===0?'微信':''}}
              {{scope.row.bankCard===0?'银行卡':''}}
            </label>
          </template>
        </el-table-column>
        <el-table-column label="是否在线">
          <template slot-scope="scope">
            <el-switch
              @change='editEnableStatus(scope.row)'
              v-model="scope.row.enable===0?true:false"
              active-text="是"
              inactive-text="否">
            </el-switch>
           <!--  {{scope.row.enable===1?'离线':'在线'}} -->
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleSet(scope.row)">设置</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <setDailog :orderData="orderData" v-if="setDialog" @close-dialog ='closeDialog'></setDailog>
  </div>
</template>

<script>
  import { mapState,mapActions } from "vuex";
  import setDailog from './dialog/setDailog'
  export default {
    components:{
      setDailog
    },
    data(){
      return{
        setDialog:false,
        orderData:{},
        tableData: []
      }
    },
    computed: {
      ...mapState(["paymentAllList","userToken"])
    },
    mounted(){
      if(this.userToken){
        this.getQueryEntrust();
        this.getContractAllInfo({});
        this.getCurrencyAllInfo({});
        if(this.paymentAllList.length===0){
          this.getPaymentAllInfo({});
        }
      }
    },
    methods:{
      ...mapActions(["getContractAllInfo","getCurrencyAllInfo","getPaymentAllInfo"]),
      editEnableStatus(item){
        this.$confirm(item.enable===0?'设置为离线状态后，系统将不再进行接单。':'设置为在线状态后，系统将自动为你接单。', 
        item.enable===0?'关闭接单':'开启接单', {
          confirmButtonText:item.enable===0?'确定关闭':'确定开启',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let par = {
            entrusType:item.type,
            counterId:item.counterId,
            enable:item.enable===0?1:0
          };
          this.http.fetch("/otcM/entrust/whetherOnline",par,"post").then(res => {
            if(res.code===0){
              this.$message.success(res.msg);
              this.getQueryEntrust()
            }else{
              this.$message.error(res.msg);
            }
          });
        }).catch(() => {
                    
        });
      },
      handleSet(row){
        this.setDialog = true;
        this.orderData={
          entrusType:row.type,
          price:row.price,
          alipay:row.alipay===1?false:true,
          wechat:row.wechat===1?false:true,
          bankCard:row.bankCard===1?false:true,
          quantity:row.quantity,
          counterId:row.counterId||"",
          enable:row.enable===1?false:true
        };
      },
      closeDialog(val){
        if(val){
          //val存在 说明设置成功 需要重新刷新列表数据
          this.getQueryEntrust()
        }
        this.setDialog = false
      },
      getQueryEntrust(){
        let par = {
          pageNum:1,
          pageSize:10
        };
        this.http.fetch("/otcM/entrust/queryEntrust",par,"post").then(res => {
          if(res.code===0){
           this.tableData = res.data;
          }else{
            this.$message.error(res.msg);
          }
        });
      },
    }
  }
</script>

<style scoped lang="less">
  .page-setting{
    width: 100%;height: 100%;box-sizing: border-box;padding: 40px 30px;
    .content-table{
      width: 100%;background-color: #fff;height:100%;
    }
  }
</style>
