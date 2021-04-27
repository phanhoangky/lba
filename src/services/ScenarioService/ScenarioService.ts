import type { BaseGetRequest } from './../BaseRequest';
import { CONSTANTS_LBA } from '../constantUrls';
import ApiHelper from '@/apis/LBA_API';
import type { Layout, Playlist } from 'umi';
import qs from 'qs';

export type GetListScenariosParam = BaseGetRequest;

export type PostScenarioParam = {
  id: string;
  layoutId: string;
  title: string;
  description: string;
  layout?: Layout;
  scenarioItems?: ScenarioItemPost[];
};

export type ScenarioItemPost = {
  id: string;
  displayOrder: number;
  playlistId: string;
  playlist: Playlist;
  scenarioId: string;
  areaId: string;
  isActive: boolean;
  audioArea: boolean;
  isSelected?: boolean;
};

export type UpdateScenarioParam = {
  id: string;
  layoutId: string;
  title: string;
  description: string;
  scenarioItems: UpdateScenarioItem[];
};

export type UpdateScenarioItem = {
  id?: string;
  displayOrder?: number;
  playlistId?: string;
  scenarioId?: string;
  areaId?: string;
  isActive?: boolean;
  audioArea?: boolean;
};

export async function GetListScenarios(param: GetListScenariosParam) {
  const res = await ApiHelper.get(`${CONSTANTS_LBA.SCENARIO_URL}`, { params: { ...param } });
  return res;
}

export async function CreateNewScenario(param: PostScenarioParam) {
  const { data } = await ApiHelper.post(`${CONSTANTS_LBA.SCENARIO_URL}`, param, {
    paramsSerializer: (params) => {
      return qs.stringify(params);
    },
  }).catch((error) => {
    return Promise.reject(new Error(error));
  });
  return data;
}

export async function UpdateScenario(param: UpdateScenarioParam) {
  const { data } = await ApiHelper.put(`${CONSTANTS_LBA.SCENARIO_URL}/${param.id}`, param).catch(
    (error) => {
      return Promise.reject(new Error(error));
    },
  );
  return data;
}

export async function RemoveScenario(id: string) {
  const { data } = await ApiHelper.delete(`${CONSTANTS_LBA.SCENARIO_URL}/${id}`).catch((error) => {
    return Promise.reject(new Error(error));
  });
  return data;
}
