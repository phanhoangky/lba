import {  AddNewMediaSource, EditMediaSource, GetListMediaFromFiledId, GetListMediaSource, GetListMediaSourceTypes, GetMediaSourceById, RemoveAllMediaInFolder, RemoveMediaSource } from '@/services/MediaSourceService';
import type {AddNewMediaParam, EditMediaParam, GetMediaSourcesParam} from '@/services/MediaSourceService'
import { CreateFolder, CreateMedia, DeleteFile, GetFiles, GetFolders, RemoveFolder, UpdateFolder } from '@/services/PublitioService/PublitioService';
import type { UpdateFileParam } from '@/services/PublitioService/PublitioService';
import type { CreateFileParam, CreateFolderParam, GetFilesParam, GetFoldersParam } from '@/services/PublitioService/PublitioService';
import  { Effect, Reducer } from 'umi';



export type FolderType = {
  id: string;
  name: string;
  path: string;
  parent_id: string;
  created_at?: string;
  updated_at?: string;
}

export type FileType = {
  id: string;
  folder_id?: null;
  title?: string;
  description?: string;
  type: {
    id: string;
    name: string;
    description: string;
  }
  extension: string;
  size: number;
  width: number;
  height: number;
  privacy: string;
  option_download: string;
  option_ad: string;
  option_transform: string;
  wm_id: string;
  urlPreview: string;
  url_thumbnail: string;
  url_download: string;
  versions: number;
  hits: number;
  created_at: string;
  updated_at: string;
  isSelected?: boolean;
  isSigned: number;
  securityHash: string;
  fileId: string;
}

export type MediaSourceTypeModel = {
  id: string;
  name: string;
  description: string;
}

export type MediaType = {
  id: string;
  name: string;
  description: string;
}

export type MediaSourceModelState = {
  listMedia?: any[];
  listFolder?: any[];
  listLoading?: boolean;
  totalItem?: number;
  breadScrumb?: FolderType[];
  getListFileParam?: GetFilesParam;
  searchListMediaParam?: GetMediaSourcesParam;
  getListFolderParam?: GetFoldersParam;
  createFolderParam?: CreateFolderParam;
  createFileParam?: CreateFileParam;
  updateFileParam?: EditMediaParam;
  addNewFolderModal?: {
    visible: boolean,
    isLoading: boolean,
  },

  addNewFileModal?: {
    visible: boolean;
    isLoading: boolean;
    fileList: any;
  };

  editFileDrawer?: {
    visible: boolean,
    isLoading: boolean,
    removeConfirmVisible: boolean;
    
  },

  selectedFile?: FileType,
  listMediaType?: MediaType[],

  renameFolderModal?: {
    visible: boolean;
    isLoading: boolean;
  },

  viewMediaDetailComponent?: {
    isLoading: boolean;
    visible: boolean;
  }
}


export type MediaSourceModel = {
  namespace: string;

  state: MediaSourceModelState;

  effects: {
    getListMediaFromFileId: Effect;
    searchListMedia: Effect;
    getListFolder: Effect;
    getListMediaType: Effect;
    createFile: Effect;
    createFolder: Effect;
    updateFile: Effect;
    removeMedia: Effect;
    removeFolder: Effect;
    updateFolder: Effect;
    checkFolderHaveAnySubfolders: Effect;
  },

  reducers: {
    setListMediaReducer: Reducer<MediaSourceModelState>;
    setListFolderReducer: Reducer<MediaSourceModelState>;
    setBreadScrumbReducer: Reducer<MediaSourceModelState>;
    setGetListFileParamReducer: Reducer<MediaSourceModelState>;
    setSearchListMediaParamReducer: Reducer<MediaSourceModelState>;
    setGetListFolderParamReducer: Reducer<MediaSourceModelState>;
    setCreateFolderParamReducer: Reducer<MediaSourceModelState>;
    setCreateFileParamReducer: Reducer<MediaSourceModelState>;
    setUpdateFileParamReducer: Reducer<MediaSourceModelState>;
    setTotalItemReducer: Reducer<MediaSourceModelState>;
    setListLoadingReducer: Reducer<MediaSourceModelState>;
    setAddNewFolderModalReducer: Reducer<MediaSourceModelState>;
    setAddNewFileModalReducer: Reducer<MediaSourceModelState>;
    setListMediaTypeReducer: Reducer<MediaSourceModelState>;
    clearAddNewFileNodalFileList: Reducer<MediaSourceModelState>;
    clearCreateNewFolderParamReducer: Reducer<MediaSourceModelState>;
    setEditFileDrawerReducer: Reducer<MediaSourceModelState>;
    setSelectedFileReducer: Reducer<MediaSourceModelState>;
    clearCreateFileParamReducer: Reducer<MediaSourceModelState>;
    clearSearchListMediaParamReducer: Reducer<MediaSourceModelState>;
    setRenameFolderModalReducer: Reducer<MediaSourceModelState>;
    setViewMediaDetailComponentReducer: Reducer<MediaSourceModelState>;
  }
}


const MediaSourceStore: MediaSourceModel = {
  namespace: "media",
  
  state: {
    listFolder: [],
    listMedia: [],
    breadScrumb: [],
    createFileParam: {
      file: "",
      folder: "",
      privacy: 1,
      title: "",
      description: "",
      accountId: "",
      securityHash: "",
      typeId: "",
      typeName: "",
      url_preview: "",
      public_id: "",
      tags: "",
      fileId: "",
      isSigned: 0,
      mediaSrcId: "",
    },

    createFolderParam: {
      name: "",
      parent_id: ""
    },

    getListFileParam: {
      filter_privacy: "public",
      limit: 10,
      offset: 0,
      folder: "/",
      pageNumber: 0,
      order: "date",
      isDescending: false
    },

    searchListMediaParam: {
      isDescending: false,
      isPaging: true,
      isSort: false,
      orderBy: "",
      pageLimitItem: 10,
      pageNumber: 0,
      title: "",
    },

    getListFolderParam: {
      parent_id: ""
    },
    updateFileParam: {
      id: "",
      title: "",
      description: "",
      typeId: "",
      isSigned: 0,
    },

    listLoading: false,
    totalItem: 0,

    addNewFolderModal: {
      visible: false,
      isLoading: false,
    },

    addNewFileModal: {
      visible: false,
      isLoading: false,
      fileList: []
    },

    editFileDrawer: {
      isLoading: false,
      visible: false,
      removeConfirmVisible: false
    },

    // selectedFile: {
    //   securityHash: "",
    //   id: "",
    //   folder_id: null,
    //   title: "",
    //   description: "",
    //   type: {
    //     id: "",
    //     description: "",
    //     name: ""
    //   },
    //   extension: "",
    //   size: 0,
    //   width: 0,
    //   height: 0,
    //   privacy: "",
    //   option_download: "",
    //   option_ad: "",
    //   option_transform: "",
    //   wm_id: "",
    //   urlPreview: "",
    //   url_thumbnail: "",
    //   url_download: "",
    //   versions: 0,
    //   hits: 0,
    //   created_at: "",
    //   updated_at: "",
    //   isSigned: 0
    // },
    listMediaType: []
    
  },

  effects: {
    *getListMediaFromFileId({ payload }, { call, put }) {
      let data: any = [];
      if (payload.id) {
        const {result} = yield call(GetMediaSourceById, payload.id);
        if (result) {
          data.push(result);
          yield put({
            type: "setListMediaReducer",
            payload: data
          })
        }
      } else {
        const listFile = yield call(GetFiles, {
          ...payload,
          order: `${payload.order}:${payload.isDescending ? 'desc' : 'asc'}`
        });
        const listId = listFile.files.map((file: any) => {
          return file.id
        })
        data = yield call(GetListMediaFromFiledId, listId, payload.isSigned);
        
        yield put({
          type: "setTotalItemReducer",
          payload: listFile.files_total
        })

        yield put({
          type: "setListMediaReducer",
          payload: data.data.result.data.map((item: any) => {
            return {
              ...item,
              isSelected: false
            }
          })
        })
      }
      

      yield put({
        type: "setGetListFileParamReducer",
        payload
      })

      
      
    },
    *searchListMedia({ payload }, { call, put }) {
      const { data } = yield call(GetListMediaSource, payload);
      
      yield put({
        type: "setListMediaReducer",
        payload: data.result.data
      })

      yield put({
        type: "setTotalItemReducer",
        payload: data.result.totalItem
      })

      yield put({
        type: "setSearchListMediaParamReducer",
        payload
      })
    },
    *getListFolder({ payload }, { call, put }) {
      
      const result = yield call(GetFolders, payload);

      yield put({
        type: "setListFolderReducer",
        payload: result.folders.map((folder: any) => {
          return {
            ...folder,
            isSelected: false
          }
        })
      })

      yield put({
        type: "setGetListFolderParamReducer",
        payload
      })
    },

    *getListMediaType(_, { call, put }) {
      const {data} = yield call(GetListMediaSourceTypes);

      yield put({
        type: "setListMediaTypeReducer",
        payload: data.result.data
      })
    },

    *createFile({ payload }, { call }) {
      const res = yield call(CreateMedia, payload);

      const newParam: AddNewMediaParam = {
        url_preview: res.url_preview,
        fileId: res.id,
        accountId: payload.accountId,
        title: payload.title,
        description: payload.description,
        hash: payload.hash,
        typeId: payload.typeId,
        securityHash: payload.securityHash,
        isSigned: payload.isSigned,
        mediaSrcId: payload.mediaSrcId,
      }
      
      yield call(AddNewMediaSource, newParam);
    },

    *createFolder({ payload }, { call, put }) {
      try {
        const res = yield call(CreateFolder, payload);

        yield put({
          type: "clearCreateNewFolderParamReducer"
        })
      
        return res;
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *updateFile({ payload }, { call }) {
      // const res = yield call(UpdateFile, payload);
      try {
        return yield call(EditMediaSource, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *removeMedia({ payload }, { call }) {
      try {
          const updateParam: UpdateFileParam = {
            id: payload.fileId,
            title: payload.title,
            description: payload.description,
            privacy: 0,
            // txHash: payload.hash,
            docId: payload.id
          }
          // yield call(UpdateFile, updateParam);
          yield call(DeleteFile, payload.fileId);
        yield call(RemoveMediaSource, updateParam);
        return true;
      } catch (error) {
        return Promise.reject(error);  
      }
    },

    *removeFolder({ payload }, { call }) {
      // const listFiles = yield call(GetFiles, { folder: payload.id });

      try {
        yield call(RemoveAllMediaInFolder, payload.path);
        yield call(RemoveFolder, payload.id);
        return true;
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *updateFolder({ payload }, { call }) {
      try {
        return yield call(UpdateFolder, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *checkFolderHaveAnySubfolders({ payload }, { call }) {
      const res = yield call(GetFolders, payload);
      console.log('====================================');
      console.log("SubFolder >>>>>", res);
      console.log('====================================');
      if (res.folders_count > 0) {
        return false;
      }
      return true;
    }
  },

  reducers: {
    setListMediaReducer(state, { payload }) {
      return {
        ...state,
        listMedia: payload
      }
    },

    setListFolderReducer(state, { payload }) {
      return {
        ...state,
        listFolder: payload
      }
    },

    setBreadScrumbReducer(state, { payload }) {
      return {
        ...state,
        breadScrumb: payload
      }
    },

    setCreateFileParamReducer(state, { payload }) {
      return {
        ...state,
        createFileParam: {
          ...state?.createFileParam,
          ...payload
        }
      }
    },

    setCreateFolderParamReducer(state, { payload }) {
      return {
        ...state,
        createFolderParam: {
          ...state?.createFolderParam,
          ...payload
        }
      }
    },

    setGetListFileParamReducer(state, { payload }) {
      return {
        ...state,
        getListFileParam: {
          ...state?.getListFileParam,
          ...payload
        }
      }
    },

    setGetListFolderParamReducer(state, { payload }) {
      return {
        ...state,
        getListFolderParam: {
          ...state?.getListFolderParam,
          ...payload
        }
      }
    },

    setListLoadingReducer(state, { payload }) {
      return {
        ...state,
        listLoading: payload
      }
    },

    setTotalItemReducer(state, { payload }) {
      return {
        ...state,
        totalItem: payload
      }
    },

    setUpdateFileParamReducer(state, { payload }) {
      return {
        ...state,
        updateFileParam: {
          ...state?.updateFileParam,
          ...payload
        }
      }
    },

    setAddNewFileModalReducer(state, { payload }) {
      return {
        ...state,
        addNewFileModal: {
          ...state?.addNewFileModal,
          ...payload
        }
      }
    },

    setAddNewFolderModalReducer(state, { payload }) {
      return {
        ...state,
        addNewFolderModal: payload
      }
    },

    setListMediaTypeReducer(state, { payload }) {
      return {
        ...state,
        listMediaType: payload
      }
    },

    clearAddNewFileNodalFileList(state) {
      return {
        ...state,
        addNewFileModal: {
          fileList: [],
          isLoading: false,
          visible: false
        }
      }
    },
    
    clearCreateNewFolderParamReducer(state) {
      return {
        ...state,
        createFolderParam: {
          ...state?.createFolderParam,
          name: "",
        }
      }
    },

    setEditFileDrawerReducer(state, { payload }) {
      return {
        ...state,
        editFileDrawer: {
          ...state?.editFileDrawer,
          ...payload
        }
      }
    },

    setSelectedFileReducer(state, { payload }) {
      return {
        ...state,
        selectedFile: {
          ...state?.selectedFile,
          ...payload
        }
      }
    },

    clearCreateFileParamReducer(state) {
      return {
        ...state,
        createFileParam: {
          file: "",
          privacy: 1,
          securityHash: "",
          title: "",
          typeId: "",
          url_preview: "",
          description: "",
          accountId: "",
          fileId: "",
          folder: "",
          isSigned: -1,
          mediaSrcId: "",
          public_id: "",
          tags: "",
          typeName: "",
        }
      }
    },

    setSearchListMediaParamReducer(state, { payload }) {
      return {
        ...state,
        searchListMediaParam: {
          ...state?.searchListMediaParam,
          ...payload
        }
      }
    },

    clearSearchListMediaParamReducer(state) {
      return {
        ...state,
        searchListMediaParam: {
          isDescending: false,
          isPaging: true,
          isSort: false,
          orderBy: "",
          pageLimitItem: 10,
          pageNumber: 0,
          title: "",
          isSigned: -1
        }
      }
    },

    setRenameFolderModalReducer(state, { payload }) {
      return {
        ...state,
        renameFolderModal: payload
      }
    },

    setViewMediaDetailComponentReducer(state, { payload }) {
      return {
        ...state,
        viewMediaDetailComponent: payload
      }
    }
  }
}

export default MediaSourceStore;