import { GetListPlaylist } from '@/services/PlaylistPageService/PlaylistService';
import type { GetListPlaylistParam } from '@/services/PlaylistPageService/PlaylistService';
import {
  CreateNewScenario,
  GetListScenarios,
  RemoveScenario,
  UpdateScenario,
} from '@/services/ScenarioService/ScenarioService';
import type {
  GetListScenariosParam,
  PostScenarioParam,
} from '@/services/ScenarioService/ScenarioService';
import type { Area, Effect, Layout, Playlist, PlaylistItem, Reducer } from 'umi';

export type Scenario = {
  key: string;
  id: string;
  layoutId: string;
  title: string;
  description: string;
  modifyBy: string;
  createBy: string;
  createTime: string;
  modifyTime: string;
  isActive: boolean;
  playlists: Playlist[];
  scenarioItems: ScenarioItem[];
  layout: Layout;
  isSelected?: boolean;
};

export type ScenarioItem = {
  id: string;
  displayOrder?: number;
  audioArea?: boolean;
  isActive?: boolean;
  playlist?: Playlist;
  area?: Area;
  scenario?: Scenario;
  isHover?: boolean;
  isSelected?: boolean;
};

export type ScenarioModelState = {
  listScenario?: Scenario[];
  selectedSenario?: Scenario;
  getListScenarioParam?: GetListScenariosParam;
  tableLoading?: boolean;
  totalItem?: number;
  addNewScenarioModal?: {
    isLoading: boolean;
    visible: boolean;
    currentStep: number;
    listPlaylist: Playlist[];
    totalItem: number;
    urlPreview?: string;
    mediaType?: string;
    progress: number;
  };

  createScenarioParam?: PostScenarioParam;

  editScenarioDrawer?: {
    visible: boolean;
    isLoading: boolean;
    playlistLoading: boolean;
  };

  viewScenarioDetailComponent?: {
    visible: boolean;
    isLoading: boolean;
    playlistLoading: boolean;
  };

  selectedArea?: Area;

  playlistsDrawer?: {
    visible: boolean;
    isLoading: boolean;
    totalItem: number;
    listPlaylists: Playlist[];
    urlPreview?: string;
    mediaType?: string;
  };

  getListPlaylistParam?: GetListPlaylistParam;

  selectedPlaylist?: Playlist;
  selectedPlaylistItems?: PlaylistItem[];
};

export type ScenarioStoreModel = {
  namespace: string;

  state: ScenarioModelState;

  effects: {
    getListScenarios: Effect;
    createScenario: Effect;
    getListPlaylist: Effect;
    updateScenario: Effect;
    removeScenario: Effect;
  };

  reducers: {
    setListScenarioReducer: Reducer<ScenarioModelState>;
    setSelectedScenarioReducer: Reducer<ScenarioModelState>;
    setGetListScenarioParamReducer: Reducer<ScenarioModelState>;
    setTotalItemReducer: Reducer<ScenarioModelState>;
    setTableLoadingReducer: Reducer<ScenarioModelState>;
    setAddNewScenarioModalReducer: Reducer<ScenarioModelState>;
    setCreateScenarioParamReducer: Reducer<ScenarioModelState>;
    clearCreateScenarioParamReducer: Reducer<ScenarioModelState>;
    setEditScenarioDrawerReducer: Reducer<ScenarioModelState>;
    setPlaylistsDrawerReducer: Reducer<ScenarioModelState>;
    setGetListPlaylistParamReducer: Reducer<ScenarioModelState>;
    setSelectedAreaReducer: Reducer<ScenarioModelState>;
    setSelectedPlaylistReducer: Reducer<ScenarioModelState>;
    setSelectedPlaylistItemsReducer: Reducer<ScenarioModelState>;

    setViewScenarioDetailComponentReducer: Reducer<ScenarioModelState>;
  };
};

const ScenarioStore: ScenarioStoreModel = {
  namespace: 'scenarios',

  state: {
    getListScenarioParam: {
      isDescending: false,
      isPaging: true,
      isSort: false,
      orderBy: '',
      pageLimitItem: 10,
      pageNumber: 0,
    },
    selectedArea: {
      height: 0,
      width: 0,
      id: '',
      x: 0,
      y: 0,
    },
    tableLoading: false,
    totalItem: 0,
    listScenario: [],
    selectedSenario: {
      key: '',
      createBy: '',
      createTime: '',
      description: '',
      id: '',
      isActive: true,
      layout: {
        description: '',
        id: '',
        isHorizontal: true,
        layoutUrl: '',
        title: '',
        isSelected: false,
        areas: [],
      },
      scenarioItems: [],
      layoutId: '',
      modifyBy: '',
      modifyTime: '',
      playlists: [],
      title: '',
      isSelected: false,
    },

    addNewScenarioModal: {
      isLoading: false,
      visible: false,
      currentStep: 0,
      listPlaylist: [],
      totalItem: 0,
      progress: 0,
    },

    createScenarioParam: {
      id: '',
      description: '',
      layoutId: '',
      title: '',
      scenarioItems: [],
    },

    editScenarioDrawer: {
      isLoading: false,
      visible: false,
      playlistLoading: false,
    },

    playlistsDrawer: {
      isLoading: false,
      visible: false,
      totalItem: 0,
      listPlaylists: [],
    },

    getListPlaylistParam: {
      isDescending: false,
      isPaging: true,
      isSort: false,
      orderBy: '',
      pageLimitItem: 10,
      pageNumber: 0,
    },

    selectedPlaylist: {
      id: '',
      accountId: '',
      description: '',
      key: '',
      playlistItems: [],
      title: '',
      isSelected: false,
    },

    selectedPlaylistItems: [],

    viewScenarioDetailComponent: {
      visible: false,
      isLoading: false,
      playlistLoading: false,
    },
  },

  effects: {
    *getListScenarios({ payload }, { call, put }) {
      const { data } = yield call(GetListScenarios, payload);
      if (data) {
        yield put({
          type: 'setListScenarioReducer',
          payload: data.result.data.map((item: any) => {
            return {
              key: item.id,
              ...item,
              isSelected: false,
            };
          }),
        });
        yield put({
          type: 'setTotalItemReducer',
          payload: data.result.totalItem,
        });
        yield put({
          type: 'setGetListScenarioParamReducer',
          payload,
        });
      }
    },

    *createScenario({ payload }, { call, put }) {
      try {
        const data = yield call(CreateNewScenario, payload);
        yield put({
          type: 'clearCreateScenarioParamReducer',
        });
        return data;
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *getListPlaylist({ payload }, { call, put }) {
      const { data } = yield call(GetListPlaylist, payload);

      const newList = data.result.data
        .map((item: any) => {
          return {
            ...item,
            isSelected: false,
          };
        })
        .filter((s: any) => s.playlistItems.length > 0);

      yield put({
        type: 'setPlaylistsDrawerReducer',
        payload: {
          listPlaylists: newList,
        },
      });

      yield put({
        type: 'setAddNewScenarioModalReducer',
        payload: {
          totalItem: data.result.totalItem,
          listPlaylist: newList,
        },
      });

      yield put({
        type: 'setPlaylistsDrawerReducer',
        payload: {
          totalItem: data.result.totalItem,
        },
      });

      yield put({
        type: 'setGetListPlaylistParamReducer',
        payload,
      });
    },

    *updateScenario({ payload }, { call }) {
      try {
        return yield call(UpdateScenario, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *removeScenario({ payload }, { call }) {
      try {
        return yield call(RemoveScenario, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    setListScenarioReducer(state, { payload }) {
      return {
        ...state,
        listScenario: payload,
      };
    },

    setGetListScenarioParamReducer(state, { payload }) {
      return {
        ...state,
        getListScenarioParam: {
          ...state?.getListScenarioParam,
          ...payload,
        },
      };
    },

    setSelectedScenarioReducer(state, { payload }) {
      return {
        ...state,
        selectedSenario: {
          ...state?.selectedSenario,
          ...payload,
        },
      };
    },

    setTotalItemReducer(state, { payload }) {
      return {
        ...state,
        totalItem: payload,
      };
    },

    setTableLoadingReducer(state, { payload }) {
      return {
        ...state,
        tableLoading: payload,
      };
    },

    setAddNewScenarioModalReducer(state, { payload }) {
      return {
        ...state,
        addNewScenarioModal: {
          ...state?.addNewScenarioModal,
          ...payload,
        },
      };
    },

    setCreateScenarioParamReducer(state, { payload }) {
      return {
        ...state,
        createScenarioParam: {
          ...state?.createScenarioParam,
          ...payload,
        },
      };
    },

    clearCreateScenarioParamReducer(state) {
      return {
        ...state,
        createScenarioParam: {
          description: '',
          layoutId: '',
          title: '',
          id: '',
          scenarioItems: [],
        },
      };
    },

    setEditScenarioDrawerReducer(state, { payload }) {
      return {
        ...state,
        editScenarioDrawer: {
          ...state?.editScenarioDrawer,
          ...payload,
        },
      };
    },

    setPlaylistsDrawerReducer(state, { payload }) {
      return {
        ...state,
        playlistsDrawer: {
          ...state?.playlistsDrawer,
          ...payload,
        },
      };
    },

    setGetListPlaylistParamReducer(state, { payload }) {
      return {
        ...state,
        getListPlaylistParam: {
          ...state?.getListPlaylistParam,
          ...payload,
        },
      };
    },

    setSelectedAreaReducer(state, { payload }) {
      return {
        ...state,
        selectedArea: payload,
      };
    },

    setSelectedPlaylistReducer(state, { payload }) {
      return {
        ...state,
        selectedPlaylist: {
          ...state?.selectedPlaylist,
          ...payload,
        },
      };
    },

    setSelectedPlaylistItemsReducer(state, { payload }) {
      return {
        ...state,
        selectedPlaylistItems: payload,
      };
    },

    setViewScenarioDetailComponentReducer(state, { payload }) {
      return {
        ...state,
        viewScenarioDetailComponent: payload,
      };
    },
  },
};

export default ScenarioStore;
