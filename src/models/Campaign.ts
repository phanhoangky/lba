import type { BaseGetRequest } from "@/services/BaseRequest";
import { createCampaign, deleteCampaign, getCampaignById, getListCampaigns, updateCampaign } from "@/services/CampaignService/CampaignService";
import type { CreateCampaignParam } from '@/services/CampaignService/CampaignService';
import moment from "moment";
import type { Effect, Reducer } from "umi";
import { GetFees } from "@/services/FeeService";

export type Campaign = {
  id: string;
  budget: number;
  description: string;
  location: string;
  maxBid: number;
  startDate: string;
  endDate: string;
  dateFilter: string;
  timeFilter: string;
  radius: number;
  status: number;
  modifyBy?: string;
  createBy?: string;
  createTime?: string;
  modifyTime?: string;
  isActive: boolean;
  address: string;
  types: any[];
  name: string;
  isLoading?: boolean;
  percentMoneyUsed?: number;
  percentWin?: number;
  campaignDeviceTypes?: any[],
};

export type CampaignModelState = {
  listCampaign?: Campaign[];
  campaignsTableLoading?: boolean;
  totalCampaigns?: number; 
  selectedCampaign?: Campaign;
  
  getListCampaignParam?: BaseGetRequest & {mail: string, id?: string};

  createCampaignParam?: CreateCampaignParam;

  addNewCampaignModal?: {
    visible: boolean;
    isLoading: boolean;
    address: string;
    currentStep: number;
    previewScenarioModal?: {
      visible: boolean;
      isLoading: boolean;
    },
    fees?: any;
  };
  
  fees?: any;

  editCampaignDrawer?: {
    visible: boolean;
    isLoading: boolean;
  },

  viewCampaignDetailComponent?: {
    visible: boolean;
    isLoading: boolean;
  }
};

export type CampaignModelStore = {
  namespace: string;

  state: CampaignModelState;

  effects: {
    getListCampaigns: Effect;
    createCampaign: Effect;
    deleteCampaign: Effect;
    getListFee: Effect;
    updateCampaign: Effect;
  };

  reducers: {
    setListCampaignReducer: Reducer<CampaignModelState>;
    setTotalCampaignReducer: Reducer<CampaignModelState>;
    setCampaignTableLoadingReducer: Reducer<CampaignModelState>;
    setGetListCampaignParamReducer: Reducer<CampaignModelState>;

    setCreateCampaignParamReducer: Reducer<CampaignModelState>; //
    clearCreateCampaignParamReducer: Reducer<CampaignModelState>;

    setAddNewCampaignModalReducer: Reducer<CampaignModelState>;
    
    setSelectedCampaignReducer: Reducer<CampaignModelState>;

    setEditCampaignReducer: Reducer<CampaignModelState>;

    setViewCampaignDetailComponentReducer: Reducer<CampaignModelState>;

    setFeesReducer: Reducer<CampaignModelState>;
  }
};

const CampaignStore: CampaignModelStore = {
  namespace: "campaign",

  state: {
    listCampaign: [],
    campaignsTableLoading: false,
    totalCampaigns: 0,

    selectedCampaign: {
      name: "",
      id: "",
      budget: 0,
      description: "",
      location: "",
      maxBid: 0,
      endDate: moment().format('YYYY/MM/DD'),
      startDate: moment().format('YYYY/MM/DD'),
      dateFilter: "0000000",
      timeFilter: "000000000000000000000000",
      radius: 0,
      isActive: true,
      status: 0,
      address: "",
      types: []
    },

    
    createCampaignParam: {
      budget: 0,
      dateFilter: "0000000",
      timeFilter: "000000000000000000000000",
      description: "",
      endDate: moment().format('YYYY/MM/DD'),
      startDate: moment().format('YYYY/MM/DD'),
      location: "",
      maxBid: 0,
      radius: 0,
      scenarioId: "",
      typeIds: [],
      address: "",
      name: ""
    },

    getListCampaignParam: {
      isDescending: false,
      isPaging: true,
      isSort: false,
      orderBy: "",
      pageLimitItem: 5,
      pageNumber: 0,
      mail: ""
    },

    addNewCampaignModal: {
      visible: false,
      isLoading: false,
      address: "",
      currentStep: 1,
      previewScenarioModal: {
        isLoading: false,
        visible :false
      }
    },

    editCampaignDrawer: {
      isLoading: false,
      visible: false,
    },

    viewCampaignDetailComponent: {
      visible: false,
      isLoading: false,
    },
    
  },

  effects: {
    *getListCampaigns({ payload }, { call, put }) {

      let list: any = [];
      if (payload.id) {
        const campaign = yield call(getCampaignById, payload.id);
        list.push(campaign.result);
      } else {
        const { data } = yield call(getListCampaigns, payload);
        list = data.result.data;
      }
      yield put({
        type: "setListCampaignReducer",
        payload: list.map((c: any) => {
          return {
            key: c.id,
            ...c,
          }
        })
      })

      yield put({
        type: "setTotalCampaignReducer",
        payload: list.length
      })

      yield put({
        type: "setGetListCampaignParamReducer",
        payload
      })
    },

    *createCampaign({ payload }, { call }) {
      yield call(createCampaign, payload);
    },

    *deleteCampaign({ payload }, { call }) {
      yield call(deleteCampaign, payload);
    },

    *getListFee({ payload }, { call, put }) {
      const res = yield call(GetFees, payload);
      console.log('====================================');
      console.log(res);
      console.log('====================================');
      yield put({
        type: "setFeesReducer",
        payload: res.result
      })
      return res;
    },

    *updateCampaign({ payload }, { call }) {
      yield call(updateCampaign, payload);
    }
  },

  reducers: {
    setListCampaignReducer(state, { payload }) {
      return {
        ...state,
        listCampaign: payload
      }
    },

    setGetListCampaignParamReducer(state, { payload }) {
      return {
        ...state,
        getListCampaignParam: {
          ...state?.getListCampaignParam,
          ...payload
        }
      }
    },
    
    setCampaignTableLoadingReducer(state, { payload }) {
      return {
        ...state,
        campaignsTableLoading: payload
      }
    },

    setTotalCampaignReducer(state, { payload }) {
      return {
        ...state,
        totalCampaigns: payload
      }
    },

    setAddNewCampaignModalReducer(state, { payload }) {
      return {
        ...state,
        addNewCampaignModal: {
          ...state?.addNewCampaignModal,
          ...payload
        }
      }
    },

    setCreateCampaignParamReducer(state, { payload }) {
      return {
        ...state,
        createCampaignParam: payload
      }
    },

    clearCreateCampaignParamReducer(state) {
      return {
        ...state,
        createCampaignParam: {
          budget: 0,
          dateFilter: "0000000",
          timeFilter: "000000000000000000000000",
          description: "",
          endDate: moment().format('YYYY/MM/DD'),
          startDate: moment().format('YYYY/MM/DD'),
          location: "",
          maxBid: 0,
          radius: 0,
          scenarioId: "",
          typeIds: [],
          name: "",
          address: ""
        }
      }
    },

    setSelectedCampaignReducer(state, { payload }) {
      return {
        ...state,
        selectedCampaign: {
          ...state?.selectedCampaign,
          ...payload
        }
      }
    },

    setEditCampaignReducer(state, { payload }) {
      return {
        ...state,
        editCampaignDrawer: {
          ...state?.editCampaignDrawer,
          ...payload
        }
      }
    },

    setViewCampaignDetailComponentReducer(state, { payload }) {
      return {
        ...state,
        viewCampaignDetailComponent: payload
      }
    },

    setFeesReducer(state, { payload }) {
      return {
        ...state,
        fees: payload
      }
    }
   }
}


export default CampaignStore;