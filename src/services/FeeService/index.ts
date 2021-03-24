import  ApiHelper from '@/apis/LBA_API';
import type { BaseGetRequest } from "../BaseRequest";
import { CONSTANTS_LBA } from '../constantUrls';

export type GetFeeParam = BaseGetRequest;

export async function GetFees(param: GetFeeParam) {
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.FEE_URL}`, { params: { ...param } });
  return data;
}