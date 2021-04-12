import ApiHelper from "@/apis/LBA_API";
import type { BaseGetRequest } from "../BaseRequest";
import { CONSTANTS_LBA } from "../constantUrls";

export type GetListTransactionParam = BaseGetRequest & { id?: string };

export type CreateTransactionParam = {
  receiverAddress: string;
  value: number;
  type: number;
  txHash: string;
}

export async function GetListTransactions(param: GetListTransactionParam) {
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.TRANSACTION_URL}`, { params: { ...param } });
  return data;
}

export async function CreateTransaction(param: CreateTransactionParam) {
  const { data } = await ApiHelper.post(`${CONSTANTS_LBA.TRANSACTION_URL}`, param).catch((error) => {
    return Promise.reject(error);
  });

  return data;
}