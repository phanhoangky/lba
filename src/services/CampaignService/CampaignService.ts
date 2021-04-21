import ApiHelper from "@/apis/LBA_API"
import type { BaseGetRequest } from "../BaseRequest";
import { CONSTANTS_LBA } from "../constantUrls"

export type CreateCampaignParam = {
  scenarioId: string;
  budget: number;
  totalMoney: number;
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

export type GetAllLocationInBoundParam = {
  northWestLatitude: number;
  northWestLongitude: number;
  southEastLatitude: number;
  southEastLongitude: number;
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

export async function getCampaignById(id: string) {
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.CAMPAIGN_URL}/${id}`);
  return data;
}

export async function createCampaign(param: CreateCampaignParam) {
  const { data } = await ApiHelper.post(`${CONSTANTS_LBA.CAMPAIGN_URL}`, param).catch((error) => {
    return Promise.reject(new Error(error));
  });

  return data;
}

export async function deleteCampaign(param: DeleteCampaignParam) {
  const { data } = await ApiHelper.delete(`${CONSTANTS_LBA.CAMPAIGN_URL}/${param.id}`, { params: { ...param } }).catch((error) => {
    return Promise.reject(new Error(error));
  });
  return data;
}

export async function updateCampaign(param: UpdateCampaignParam) {
  const { data } = await ApiHelper.put(`${CONSTANTS_LBA.CAMPAIGN_URL}/${param.id}`, param).catch((error) => {
    return Promise.reject(new Error(error));
  });
  return data;
}

export async function getAllLocationInBound(param: GetAllLocationInBoundParam) {
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.CAMPAIGN_URL}/locations`, { params: { ...param } });
  return data;
}