import {GetListMediaNotBelongToPlaylist, GetPlaylistItemByPlaylistId, UpdatePlaylistItemsByPlaylistId } from "@/services/PlaylistPageService/PlaylistItemService"
import type {AddNewPlaylistItemParam, GetPlaylistItemByPlaylistIdParam} from "@/services/PlaylistPageService/PlaylistItemService"
import { AddNewPlaylist, GetListPlaylist, RemovePlaylist, UpdatePlaylist } from "@/services/PlaylistPageService/PlaylistService";
import type {AddNewPlaylistParam, GetListPlaylistParam} from "@/services/PlaylistPageService/PlaylistService";
import { Effect, FileType, Reducer } from "umi";
import type { GetMediaSourcesParam } from "@/services/MediaSourceService";
import moment from "moment";

export type PlaylistItem = {
  key: string;
  id: string;
  mediaSrcId: string;
  mediaSrc?: any;
  playlistId: string;
  displayOrder: number;
  duration: number;
  modifyBy?: string;
  createBy?: string;
  createTime?: string;
  modifyTime?: string;
  isActive: true;
  url: string;
  title: string;
  typeName: string;
  index: number;
  isSelected?: boolean;
}

export type Playlist = {
  key: string;
  id: string;
  title: string;
  description: string;
  accountId: string;
  isSelected?: boolean;
  playlistItems: PlaylistItem[];
  isLoading?: boolean;
}

export type PlayListModelState = {
  listPlaylist?: Playlist[];
  getPlaylistParam?: GetListPlaylistParam;
  selectedPlaylist?: Playlist;
  selectedPlaylistItems?: PlaylistItem[];
  addNewPlaylistModal?: {
    isLoading: boolean;
    visible: boolean;
    playingUrl?: string;
    playlingMediaType?: string;
    currentStep: number;
  },

  tableLoading?: boolean;
  currentPage?: number;
  totalItem?: number;
  addNewPlaylistParam?: AddNewPlaylistParam;

  getItemsByPlaylistIdParam?: GetPlaylistItemByPlaylistIdParam;

  editPlaylistDrawer?: {
    visible: boolean;
    isLoading: boolean
    currentPage: number;
    totalItem: number;
    playingUrl?: string;
    playlingMediaType?: string;
  },

  viewPlaylistDetailComponent?: {
    visible: boolean,
    isLoading: boolean,
    currentPage: number,
    totalItem: number,
    playingUrl?: string;
    playlingMediaType?: string;
  }
  minDuration?: number,
  maxDuration?: number,
  totalDuration?: number,
  currentNewItemDuration?: number,

  addNewPlaylistItemsDrawer?: {
    visible: boolean,
    isLoading: boolean,
    currentPage: number,
    totalItem: number,
  },

  listMediaNotBelongToPlaylist?: any[],

  getListMediaParam?: GetMediaSourcesParam & {playlistId: string},

  selectedMedia?: FileType,

  newPlaylistItemParam?: AddNewPlaylistItemParam,

  selectMediaModal?: {
    visible: boolean;
    isLoading: boolean;
  }
}

export type PlaylistModel = {
  namespace: string,
  
  state: PlayListModelState

  effects: {
    getListPlaylist: Effect;
    addNewPlaylist: Effect;
    getItemsByPlaylist: Effect;
    getMediaNotBelongToPlaylist: Effect;
    updatePlaylist: Effect;
    removePlaylist: Effect;
    UpdatePlaylistStatus: Effect;
  },

  reducers: {
    setlistPlaylistReducer: Reducer<PlayListModelState>,
    setSelectedPlaylistReducer: Reducer<PlayListModelState>,
    clearSelectedPlaylistReducer: Reducer<PlayListModelState>,
    setGetPlaylistParamReducer: Reducer<PlayListModelState>,
    setAddNewPlaylistItemsDrawerReducer: Reducer<PlayListModelState>,
    setAddNewPlaylistModalReducer: Reducer<PlayListModelState>,
    setAddNewPlaylistParamReducer: Reducer<PlayListModelState>,
    setTableLoadingReducer: Reducer<PlayListModelState>,
    clearAddNewPlaylistParamReducer: Reducer<PlayListModelState>,
    setTotalItemReducer: Reducer<PlayListModelState>,
    setEditPlaylistDrawerReducer: Reducer<PlayListModelState>,
    setSelectedPlaylistItemsReducer: Reducer<PlayListModelState>,
    setListMediaNotBelongToPlaylistReducer: Reducer<PlayListModelState>,
    setGetListMediaParamReducer: Reducer<PlayListModelState>,
    setSelectedMediaReducer: Reducer<PlayListModelState>,
    setTotalDurationReducer: Reducer<PlayListModelState>,
    clearAddNewPlaylistItemParamReducer: Reducer<PlayListModelState>,
    setCurrentDurationReducer: Reducer<PlayListModelState>;
    setViewPlaylistDetailComponentReducer: Reducer<PlayListModelState>;
    selectMediaModalReducer: Reducer<PlayListModelState>;
  }
}

const PlaylistStore: PlaylistModel = {
  namespace: "playlists",

  state: {
    listPlaylist: [],
    tableLoading: false,
    totalItem: 0,
    currentPage: 0,
    selectedPlaylist: {
      key: "",
      title: "",
      id: "",
      accountId: "",
      description: "",
      playlistItems: []
    },
    selectedPlaylistItems: [],
    getPlaylistParam: {
      isDescending: false,
      isPaging: true,
      isSort: false,
      orderBy: "",
      pageLimitItem: 10,
      pageNumber: 0
    },

    getItemsByPlaylistIdParam: {
      id: "",
      isDescending: false,
      isPaging: true,
      isSort: false,
      orderBy: "",
      pageLimitItem: 10,
      pageNumber: 0
    },

    addNewPlaylistModal: {
      visible: false,
      isLoading: false,
      currentStep: 0,
    },

    addNewPlaylistParam: {
      accountId: "",
      description: "",
      title: "",
      playlistItems: []
    },

    editPlaylistDrawer: {
      visible: false,
      isLoading: false,
      currentPage: 0,
      totalItem: 0,
    },

    addNewPlaylistItemsDrawer: {
      currentPage: 0,
      isLoading: false,
      totalItem: 0,
      visible: false
    },

    
    viewPlaylistDetailComponent: {
      currentPage: 0,
      isLoading: false,
      totalItem: 0,
      visible: false,
    },

    listMediaNotBelongToPlaylist: [],
    
    selectedMedia: {
      id: "",
      folder_id: null,
      title: "",
      description: "",
      type: {
        id: "",
        description: "",
        name: ""
      },
      extension: "",
      size: 0,
      width: 0,
      height: 0,
      privacy: "",
      option_download: "",
      option_ad: "",
      option_transform: "",
      wm_id: "",
      urlPreview: "",
      url_thumbnail: "",
      url_download: "",
      versions: 0,
      hits: 0,
      created_at: "",
      updated_at: "",
      isSelected: false,
      isSigned: 0,
      fileId: "",
      securityHash: ""
    },

    getListMediaParam: {
      isDescending: false,
      isPaging: true,
      isSort: false,
      orderBy: "",
      pageNumber: 0,
      isSigned: -1,
      pageLimitItem: 10,
      title: "",
      playlistId: ""
    },

    newPlaylistItemParam: {
      displayOrder: 0,
      duration: 1,
      mediaSrcId: "",
      id: "",
    },

    totalDuration: 0,
    minDuration: 10,
    maxDuration: 60 * 4,
    currentNewItemDuration: 10,

  },

  effects: {
    *getListPlaylist({ payload }, { call, put }) {
      const { data } = yield call(GetListPlaylist, payload);

      yield put({
        type: "setlistPlaylistReducer",
        payload: data.result.data.map((playlist: any) => {
          return {
            ...playlist,
            key: playlist.id,
            createTime: moment(playlist.createTime).format("YYYY-MM-DD"),
            modifyTime: moment(playlist.modify).format("YYYY-MM-DD"),
            playlistItems: playlist.playlistItems.map((playlistItem: any, index: any) => {
              return {
                ...playlistItem,
                key: playlistItem.id,
                index
              }
            })
          }
        }),
      })


      yield put({
        type: "setGetPlaylistParamReducer",
        payload
      })

      yield put({
        type: "setTotalItemReducer",
        payload: data.result.totalItem
      })
    },


    *addNewPlaylist({ payload }, { call }) {
      try {
        return yield call(AddNewPlaylist, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },


    *getItemsByPlaylist({ payload }, { call, put }) {
      const { data } = yield call(GetPlaylistItemByPlaylistId, payload);

      yield put({
        type: "setSelectedPlaylistItemsReducer",
        payload: data.result ? data.result.data.map((item: any, index: number) => {
          return {
            key: item.id,
            ...item,
            url: item.mediaSrc.urlPreview,
            title: item.mediaSrc.title,
            typeName: item.mediaSrc.type.name,
            index,
            displayOrder: index
          }
        }): []
      })

    },

    *getMediaNotBelongToPlaylist({ payload }, { call, put }) {
      const { data } = yield call(GetListMediaNotBelongToPlaylist, payload);
      
      yield put({
        type: "setListMediaNotBelongToPlaylistReducer",
        payload: data.result.data.map((item: any) => {
          return {
            ...item,
            key: item.id
          }
        })
      })
      
      yield put({
        type: "setAddNewPlaylistItemsDrawerReducer",
        payload: {
          totalItem: data.result.totalItem
        }
      })

      yield put({
        type: "setGetListMediaParamReducer",
        payload
      })
    },

    *updatePlaylist({ payload }, { call }) {
      try {
        return yield call(UpdatePlaylistItemsByPlaylistId, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *UpdatePlaylistStatus({ payload }, { call }) {
      try {
        return yield call(UpdatePlaylist, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *removePlaylist({ payload }, { call }) {
      try {
        return yield call(RemovePlaylist, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    }
  },

  reducers: {
    setlistPlaylistReducer(state, { payload }) {
      return {
        ...state,
        listPlaylist: payload
      }
    },

    setSelectedPlaylistItemsReducer(state, { payload }) {
      return {
        ...state,
        selectedPlaylistItems: payload
      }
    },

    setTableLoadingReducer(state, { payload }) {
      return {
        ...state,
        tableLoading: payload
      }
    },
    
    setGetPlaylistParamReducer(state, { payload }) {
      return {
        ...state,
        getPlaylistParam: payload
      }
    },

    setAddNewPlaylistModalReducer(state, { payload }) {
      return {
        ...state,
        addNewPlaylistModal: payload
      }
    },
    
    setAddNewPlaylistParamReducer(state, { payload }) {
      return {
        ...state,
        addNewPlaylistParam: payload
      }
    },

    setSelectedPlaylistReducer(state, { payload }) {
      return {
        ...state,
        selectedPlaylist: payload
      }
    },

    clearAddNewPlaylistParamReducer(state) {
      return {
        ...state,
        addNewPlaylistParam: {
          accountId: "",
          description: "",
          title: "",
          playlistItems: []
        }
      }
    },

    setTotalItemReducer(state, { payload }) {
      return {
        ...state,
        totalItem: payload
      }
    },

    setEditPlaylistDrawerReducer(state, { payload }) {
      return {
        ...state,
        editPlaylistDrawer: payload
      }
    },

    setAddNewPlaylistItemsDrawerReducer(state, { payload }) {
      return {
        ...state,
        addNewPlaylistItemsDrawer: {
          ...state?.addNewPlaylistItemsDrawer,
          ...payload
        }
      }
    },

    setListMediaNotBelongToPlaylistReducer(state, { payload }) {
      return {
        ...state,
        listMediaNotBelongToPlaylist: payload
      }
    },

    setGetListMediaParamReducer(state, { payload }) {
      return {
        ...state,
        getListMediaParam: {
          ...state?.getListMediaParam,
          ...payload
        }
      }
    },

    setSelectedMediaReducer(state, { payload }) {
      return {
        ...state,
        selectedMedia: {
          ...state?.selectedMedia,
          ...payload
        }
      }
    },

    setTotalDurationReducer(state, { payload }) {
      return {
        ...state,
        totalDuration: payload
      }
    },
    clearAddNewPlaylistItemParamReducer(state) {
      return {
        ...state,
        newPlaylistItemParam: {
          id: "",
          duration: 0,
          displayOrder: 0,
          mediaSrcId: "",
        }
      }
    },

    setCurrentDurationReducer(state, { payload }) {
      return {
        ...state,
        currentNewItemDuration: payload
      }
    },

    clearSelectedPlaylistReducer(state) {
      return {
        ...state,
        selectedPlaylist: {
          key: "",
          title: "",
          id: "",
          accountId: "",
          description: "",
          playlistItems: []
        }
      }
    },

    setViewPlaylistDetailComponentReducer(state, { payload }) {
      return {
        ...state,
        viewPlaylistDetailComponent: payload
      }
    },

    selectMediaModalReducer(state, { payload }) {
      return {
        ...state,
        selectMediaModal: payload
      }
    }
  }
}


export default PlaylistStore;