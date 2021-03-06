import { CONSTANTS_LBA } from './constantUrls';
import  ApiHelper  from '@/apis/LBA_API';
import qs from 'qs';
import type { UpdateFileParam } from './PublitioService/PublitioService';

export type GetMediaSourcesParam = {
  isSort: boolean;
  isDescending: boolean;
  isPaging: boolean;
  pageNumber: number;
  pageLimitItem: number;
  orderBy: string;
  title: string; //
  isSigned?: number;
  isApproved?: boolean;
}

export type AddNewMediaParam = {
  accountId: string;
  typeId: string;
  url_preview: string;
  title: string;
  description: string;
  securityHash?: string;
  fileId: string;
  isSigned: number;
  mediaSrcId: string;
  hash: string;
}

export type EditMediaParam = {
  id: string;
  title: string;
  typeId: string;
  description: string;
  isSigned: number;
  txHash?: string;
}

export async function GetListMediaSource(param: GetMediaSourcesParam) {

  const res = await ApiHelper.get(CONSTANTS_LBA.MEDIA_SRC_URL, { params: { ...param } });
  return res;
}

export async function GetMediaSourceById(id: string) {
  const { data } = await ApiHelper.get(`${CONSTANTS_LBA.MEDIA_SRC_URL}/${id}`);
  return data;
}

export async function GetListMediaFromFiledId(listId: any, isSigned?: number) {
  console.log('====================================');
  console.log(listId);
  console.log('====================================');

  const res = ApiHelper.get(`${CONSTANTS_LBA.MEDIA_SRC_URL}/list`, {
    params: {
      listFileId: listId,
      isSigned
    },
    paramsSerializer: params => {
      return qs.stringify(params);
    }
  });
  return res;
}

export async function GetListMediaSourceTypes() {
  const res = ApiHelper.get(CONSTANTS_LBA.MEDIA_SRC_TYPE_URL);
  return res;
}

export async function AddNewMediaSource(param: AddNewMediaParam) {
  console.log('====================================');
  console.log("AddNewMediaSource>>>>", param);
  console.log('====================================');
  const { data } = await ApiHelper.post(CONSTANTS_LBA.MEDIA_SRC_URL, param).catch((error) => {
    return Promise.reject(error);
  });

  return data;
}

export async function EditMediaSource(param: EditMediaParam) {
  const { data } = await ApiHelper.put(`${CONSTANTS_LBA.MEDIA_SRC_URL}/${param.id}`, param).catch((error) => {
    return Promise.reject(error);
  });
  return data;
}


export async function RemoveMediaSource(param: UpdateFileParam) {
  console.log('====================================');
  console.log("Param >>>", param);
  console.log('====================================');
  // await ApiHelper.delete(`${CONSTANTS_LBA.MEDIA_SRC_URL}/${param.docId}`, { params: { txHash: param.txHash }});
  const { data } = await ApiHelper.delete(`${CONSTANTS_LBA.MEDIA_SRC_URL}/${param.docId}`).catch((error) => {
    return Promise.reject(error);
  });

  return data;
}

export async function RemoveAllMediaInFolder(path: string) {
  const { data } = await ApiHelper.delete(`${CONSTANTS_LBA.MEDIA_SRC_URL}/folder`, { params: { path } }).catch((error) => {
    return Promise.reject(error);
  });
  
  return data;
}
