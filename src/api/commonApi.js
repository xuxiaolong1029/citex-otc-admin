import http from "../http/fetch";
//初始化信息
export const getMerchant = () => http.fetch("/otcM/merchant/getMerchantInfo", "", "post");
//logout
export const logout = () => http.fetch("/otcM/user/logout", "", "get");
//获取验证类型
export const verifyTypeInfo = () => http.fetch("/otcM/payment/getCheckWays", "", "post");
//获取用户资产
export const queryUserAsset = () => http.fetch("/otcM/transfer/queryUserAsset", "", "post");
//获取所有币种
export const getCurrency = () => http.fetch("/otcM/common/getCurrency", "", "post");
//获取所有交易对
export const getContract = () => http.fetch("/otcM/common/getContract", "", "post");
//获取所有绑定的支付方式
export const queryPaymentAll = () => http.fetch("/otcM/payment/queryPaymentAll", "", "post");
