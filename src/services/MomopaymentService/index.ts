import ApiHelper from "@/apis/LBA_API"
import { CONSTANTS_LBA } from "../constantUrls"

export type GetLinkTransferParam = {
  amount: number;
  orderInfo?: string;
}
export type GetLinkSendMoneyParam = {

}

export async function GetLinkDeposit(param: GetLinkTransferParam) {
  console.log('====================================');
  console.log(param);
  console.log('====================================');
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.MOMO_PAYMENT_URL}`, { params: { ...param } });
  return data;
}

export async function GetLinkSendMoney(param: GetLinkSendMoneyParam) {
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.MOMO_PAYMENT_URL}`, { params: { ...param } });
  return data;
}