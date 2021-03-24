import { GetLinkTransfer } from "@/services/MomopaymentService";
import type { Effect, Reducer } from "umi";
import type { GetLinkTransferParam } from '@/services/MomopaymentService';

export type momo = {

}

export type MomoModelState = {
  amount?: number;
  linkTransferParam?: GetLinkTransferParam;
}

export type MomoStoreModel = {
  namespace: string;
  
  state: MomoModelState;

  effects: {
    getLinkTransfer: Effect;
  },

  reducers: {
    setAmountReducer: Reducer<MomoModelState>;

    setLinkTransferReducer: Reducer<MomoModelState>;

    setLinkTransferParamReducer: Reducer<MomoModelState>;
  }
}

const MomoStore: MomoStoreModel = {
  namespace: 'momo',
  
  state: {
    linkTransferParam: {
      amount: 0,
      orderInfo: ""
    }
  },


  effects: {
    *getLinkTransfer({payload}, { call, put }) {
      const res = yield call(GetLinkTransfer, payload);

      yield put({
        type: "setAmountReducer",
        payload: res
      })

      yield put({
        type: "setLinkTransferParamReducer",
        payload
      })
    }
  },

  reducers: {
    setAmountReducer(state, { payload }) {
      return {
        ...state,
        amount: payload
      }
    },

    setLinkTransferReducer(state, { payload }) {
      return {
        ...state,
        linkTransfer: payload
      }
    },

    setLinkTransferParamReducer(state, { payload }) {
      return {
        ...state,
        linkTransferParam: payload
      }
    }
  }
}

export default MomoStore;