import ApiHelper from "@/apis/LBA_API";
import type { BaseGetRequest } from "../BaseRequest";
import { CONSTANTS_LBA } from "../constantUrls";

export type GetListTransactionParam = BaseGetRequest;

export async function GetListTransactions(param: GetListTransactionParam) {
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.TRANSACTION_URL}`, { params: { ...param } });
  return data;
}