import { GetLinkDeposit, GetLinkSendMoney } from "@/services/MomopaymentService";
import type { Effect, Reducer } from "umi";
import type { GetLinkTransferParam ,GetLinkSendMoneyParam} from '@/services/MomopaymentService';

export type momo = {

}

export type MomoModelState = {
  amount?: number;
  linkDepositParam?: GetLinkTransferParam;

  linkDepositMoney?: string;

  linkSendMoney?: string;

  linkSendMoneyParam?: GetLinkSendMoneyParam;
}

export type MomoStoreModel = {
  namespace: string;
  
  state: MomoModelState;

  effects: {
    getLinkDeposit: Effect;
    getLinkSendMoney: Effect;
  },

  reducers: {
    setAmountReducer: Reducer<MomoModelState>;

    setLinkTransferReducer: Reducer<MomoModelState>;

    setLinkDepositParamReducer: Reducer<MomoModelState>;
    setLinkDepositMoneyReducer: Reducer<MomoModelState>;
    setLinkSendMoneyReducer: Reducer<MomoModelState>;
    setLinkSendMoneyParamReducer: Reducer<MomoModelState>;
  }
}

const MomoStore: MomoStoreModel = {
  namespace: 'momo',
  
  state: {
    linkDepositParam: {
      amount: 0,
      orderInfo: ""
    },
  },


  effects: {
    *getLinkDeposit({payload}, { call, put }) {
      const res = yield call(GetLinkDeposit, payload);

      yield put({
        type: "setLinkDepositMoneyReducer",
        payload: res.result
      })

      yield put({
        type: "setLinkDepositParamReducer",
        payload
      })
    },

    *getLinkSendMoney({ payload }, {put, call }) {
      const res = yield call(GetLinkSendMoney, payload);

      yield put({
        type: "setLinkSendMoneyReducer",
        payload: res.result
      })

      yield put({
        type: "setLinkSendMoneyParamReducer",
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

    setLinkDepositParamReducer(state, { payload }) {
      return {
        ...state,
        linkDepositParam: payload
      }
    },

    setLinkDepositMoneyReducer(state, { payload }) {
      return {
        ...state,
        linkDepositMoney: payload
      }
    },

    setLinkSendMoneyReducer(state, { payload }) {
      return {
        ...state,
        linkSendMoney: payload
      }
    },

    setLinkSendMoneyParamReducer(state, { payload }) {
      return {
        ...state,
        linkSendMoneyParam: payload
      }
    }
  }
}

export default MomoStore;