import ApiHelper from "@/apis/LBA_API";
import type { BaseGetRequest } from "../BaseRequest";
import { CONSTANTS_LBA } from "../constantUrls";

export type GetLocationParam = BaseGetRequest & {
  id?: string;
};

export type CreateLocationParam = {
  name: string;
  description: string;
  longitude: string;
  latitude: string;
  typeId: string;
  address: string;
}

export type UpdateLocationParam = {
  id: string;
  name: string;
  description: string;
  longitude: string;
  latitude: string;
  isApprove: boolean;
  isActive: boolean;
  typeId: string;
  brandId: string;
}

export async function GetLocations(param: GetLocationParam) {
  const response = await ApiHelper.get(`${CONSTANTS_LBA.LOCATION_URL}`, { params: { ...param } }).catch((error) => {
    return Promise.reject(error);
  });;
  return response;
}

export async function CreateLocation(param: CreateLocationParam) {
  const { data } = await ApiHelper.post(`${CONSTANTS_LBA.LOCATION_URL}`, param).catch((error) => {
    
    return Promise.reject(new Error(error));
  });
  const { code } = data;
  if (code === 401) {
    return Promise.reject(new Error("Your account is disabled"));
  }
  return data;
}

export async function UpdateLocation(param: UpdateLocationParam) {
  const {data} = await ApiHelper.put(`${CONSTANTS_LBA.LOCATION_URL}/${param.id}`, param).catch((error) => {
    return Promise.reject(error);
  });
  const { code } = data;
  if (code === 401) {
    return Promise.reject(new Error("Your account is disabled"));
  }
  return data;
}

export async function DeleteLocation(id: string) {
  const { data } = await ApiHelper.delete(`${CONSTANTS_LBA.LOCATION_URL}/${id}`).catch((error) => {
    return Promise.reject(error);
  });
  const { code } = data;
  if (code === 401) {
    return Promise.reject(new Error("Your account is disabled"));
  }
  return data;
}