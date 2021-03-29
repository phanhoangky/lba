import ApiHelper from "@/apis/LBA_API"
import type { BaseGetRequest } from "../BaseRequest";
import { CONSTANTS_LBA } from "../constantUrls"

export type CreateCampaignParam = {
  scenarioId: string;
  budget: number;
  description: string;
  location: string;
  typeIds: string[];
  maxBid: number,
  startDate: string;
  endDate: string;
  dateFilter: string;
  timeFilter: string;
  radius: number;
  address?: string;
  hash?: string;
  name: string;
}

export type UpdateCampaignParam = {
  id: string;
  status: number;
  isActive: boolean;
  name: string;
}

export type DeleteCampaignParam = {
  id: string;
  hash: string;
  value: number;
}

export enum CAMPAIGN_STATUS {
  CREATE = 0,
  PAUSE = 1,
  STOP = 2
}

export async function getListCampaigns(param: BaseGetRequest) {
  const res = await ApiHelper.get(`${CONSTANTS_LBA.CAMPAIGN_URL}`, { params: { ...param } });
  return res;
}

export async function createCampaign(param: CreateCampaignParam) {
  await ApiHelper.post(`${CONSTANTS_LBA.CAMPAIGN_URL}`, param);
}

export async function deleteCampaign(param: DeleteCampaignParam) {
  await ApiHelper.delete(`${CONSTANTS_LBA.CAMPAIGN_URL}/${param.id}`, { params: { ...param }});
}

export async function updateCampaign(param: UpdateCampaignParam) {
  await ApiHelper.put(`${CONSTANTS_LBA.CAMPAIGN_URL}/${param.id}`, param);
}