import ApiHelper from "@/apis/LBA_API"
import { CONSTANTS_LBA } from "../constantUrls"

export type GetLinkTransferParam = {
  amount: number;
  orderInfo?: string;
}

export async function GetLinkTransfer(param: GetLinkTransferParam) {
  console.log('====================================');
  console.log(param);
  console.log('====================================');
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.MOMO_PAYMENT_URL}`, { params: { ...param } });
  return data;
}