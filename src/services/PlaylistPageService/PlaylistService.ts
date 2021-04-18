import { CONSTANTS_LBA } from '../constantUrls';
import ApiHelper from "@/apis/LBA_API"
import type { BaseGetRequest } from '../BaseRequest';

export type GetListPlaylistParam = BaseGetRequest

export type AddNewPlaylistParam = {
  title: string,
  description: string;
  accountId: string;
}


export type UpdatePlaylistParam = {
  title: string;
  description: string;
}


export async function GetListPlaylist(params: GetListPlaylistParam) {
  const res = await ApiHelper.get(`${CONSTANTS_LBA.PLAYLIST_URL}`, { params: { ...params} });
  return res;
  // const res = await request.get(`${CONSTANTS_LBA.PLAYLIST_URL}`, { params: { ...params }, });
}

export async function AddNewPlaylist(params: AddNewPlaylistParam) {
  const { data } = await ApiHelper.post(`${CONSTANTS_LBA.PLAYLIST_URL}`, params).catch((error) => {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return Promise.reject(new Error(error));
  });
  return data;
}


export async function UpdatePlaylist(params: UpdatePlaylistParam) {
  const { data} = await ApiHelper.put(`${CONSTANTS_LBA.PLAYLIST_URL}`, params).catch((error) => {
    return Promise.reject(new Error(error));
  });
  return data;
}

export async function RemovePlaylist(id: string) {
const {data} =  await ApiHelper.delete(`${CONSTANTS_LBA.PLAYLIST_URL}/${id}`).catch((error) => {
    return Promise.reject(new Error(error));
  });

  return data;
}

