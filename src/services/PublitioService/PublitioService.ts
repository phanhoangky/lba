import { CONSTANTS_PUBLITIO } from '../constantUrls';
import publitio from "./Publitio";

export type GetFilesParam = {
  limit?: number;
  offset?: number;
  folder?: string;   // folder ID or Path to list files from. Default is null (lists all files). Use / to list top (root) folder files.
  pageNumber: number;
  filter_privacy?: string;
  filter_type?: string;
  order?: string;
  id?: string;
  isDescending?: boolean;
}

export type GetFoldersParam = {
  parent_id?: string;
}

export type CreateFolderParam = {
  parent_id?: string;
  name?: string;
}

export type CreateFileParam = {
  file: any;
  folder: string; // folder_id
  privacy: number;
  title: string;
  description?: string;
  accountId: string;
  typeId: string;
  typeName: string;
  securityHash: string;
  url_preview: string;
  public_id: string;
  tags: string;
  fileId: string;
  isSigned: number;
  mediaSrcId: string;
  hash?: string;
}

export type UpdateFileParam = {
  id: string;
  title?: string; //
  description?: string; //
  privacy?: number | string;
  txHash?: string;
  docId?: string;
}

export type UpdateFolderParam = {
  id: string;
  name: string;
}


export async function CreateMedia(param: any) {

  const res = await publitio.uploadFile(param.file, "file", param).catch((error) => {
    return Promise.reject(new Error(error));
  });
  return res;
}

export async function GetFiles(param: GetFilesParam) {
  const data = await publitio.call(`${CONSTANTS_PUBLITIO.GET_FILES_URL}`, "GET", param);
  return data;
}

export async function DeleteFile(id: string) {
  const res = await publitio.call(`${CONSTANTS_PUBLITIO.DELETE_FILE_URL}/${id}`, "DELETE").catch((error) => {
    return Promise.reject(new Error(error));
  });
  return res;
}

export async function GetFolders(param: GetFoldersParam) {
  const data = await publitio.call(`${CONSTANTS_PUBLITIO.GET_FOLDERS_URL}`, "GET", param);
  return data;
}

export async function CreateFolder(param: CreateFolderParam) {
  const data = await publitio.call(`${CONSTANTS_PUBLITIO.CREATE_FOLDER_URL}`, "POST", param).catch((error) => {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
    return Promise.reject(new Error(error));
  });
  return data;
}

export async function UpdateFile(param: UpdateFileParam) {

  const res = await publitio.call(`${CONSTANTS_PUBLITIO.UPDATE_FILE_URL}/${param.id}`, "PUT", param).catch((error) => {
    return Promise.reject(new Error(error));
  });
  return res;
}

export async function RemoveFolder(id: string) {
  await publitio.call(`${CONSTANTS_PUBLITIO.REMOVE_FOLDER_URL}/${id}`, "DELETE").catch((error) => {
    return Promise.reject(new Error(error));
  });
}

export async function UpdateFolder(param: UpdateFolderParam) {
  await publitio.call(`${CONSTANTS_PUBLITIO.UPDATE_FOLDER_URL}/${param.id}`, "PUT", param).catch((error) => {
    return Promise.reject(new Error(error));
  });
}