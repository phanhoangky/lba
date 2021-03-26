import { GetListTransactions } from "@/services/TOMOService";
import type { GetListTransactionParam } from '@/services/TOMOService';
import { diffTwoDate } from "@/utils/utils";
import moment from "moment";
import type { Effect, Reducer } from "umi";
import type { GetLinkTransferParam } from "@/services/MomopaymentService";

export type TransactionType = {
  address: string;
  blockHash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  value: string;
  valueNumber: number;
  symbol: string;
  decimals: string;
  blockTime: string;
}

export type ProfileWalletModelState = {
  listTransactions?: TransactionType[],
  getTransactionsParam?: GetListTransactionParam;
  balance?: number;
  totalTransaction?: number;
  transTableLoading?: boolean;
  QRModal?: {
    visible: boolean;
    isLoading: boolean; //
    dataQRCode?: string;
  },

  depositModal?: {
    visible: boolean;
    isLoading: boolean;
  },

  sendModal?: {
    visible: boolean;
    isLoading: boolean;
  },

  refreshBalanceLoading?: boolean,
}



export type WalletStoreType = {
  namespace: string,
  
  state: ProfileWalletModelState,

  effects: {
    setListTransactions: Effect
  },

  reducers: {
    setListTransactionsReducer: Reducer<ProfileWalletModelState>,
    setCallTransactionsParamReducer: Reducer<ProfileWalletModelState>,
    setBalance: Reducer<ProfileWalletModelState>,
    setTotalTransaction: Reducer<ProfileWalletModelState>;
    setTransTableLoadingReducer: Reducer<ProfileWalletModelState>;
    setQRModalReducer: Reducer<ProfileWalletModelState>;
    setDepositModalReducer: Reducer<ProfileWalletModelState>;
    setSendModalReducer: Reducer<ProfileWalletModelState>;
    setRefreshBalanceLoadingReducer: Reducer<ProfileWalletModelState>;

  }

}

const WalletModel: WalletStoreType = {
  namespace: "profileWallet",

  state: {
    listTransactions: [],
    getTransactionsParam: {
      holder: "",
      limit: 10,
      page: 1,
    },

    balance: 0,

    totalTransaction: 0,
    transTableLoading: false,

    QRModal: {
      visible: false,
      isLoading: false,
    },

    depositModal: {
      isLoading: false,
      visible: false,
    },

    sendModal: {
      visible: false,
      isLoading: false,
    },

    refreshBalanceLoading: false,
  },

  effects: {
    *setListTransactions({ payload }, { call, put }) {
      
      const result = yield call(GetListTransactions, payload);
      console.log("Profile Wallet >>>>", result, result.data);
      
      yield put({
        type: "setListTransactionsReducer",
        payload: result.data.items.map((item: TransactionType) => {
          const now = moment();
          const date = moment(item.timestamp);
          
          const diff = diffTwoDate(now, date);
          return {
            key: item.blockNumber,
            ...item,
            timestamp: moment(item.timestamp).format("YYYY-MM-DD"),
            age: diff,
          }
        })
      })

      yield put({
        type: "setTotalTransaction",
        payload: result.data.total,
      })

      yield put({
        type: "setCallTransactionsParamReducer",
        payload
      })
    }
  },

  reducers: {
    setListTransactionsReducer(state, { payload }) {
      return {
        ...state,
        listTransactions: payload
      }
    },

    setCallTransactionsParamReducer(state, { payload }) {
      return {
        ...state,
        getTransactionsParam: payload
      }
    },

    setBalance(state, { payload }) {
      return {
        ...state,
        balance: payload
      }
    },

    setTotalTransaction(state, { payload }) {
      return {
        ...state,
        totalTransaction: payload
      }
    },

    setTransTableLoadingReducer(state, { payload }) {
      return {
        ...state,
        transTableLoading: payload
      }
    },

    setQRModalReducer(state, { payload }) {
      return {
        ...state,
        QRModal: payload
      }
    },

    setDepositModalReducer(state, { payload }) {
      return {
        ...state,
        depositModal: payload
      }
    },

    setSendModalReducer(state, { payload }) {
      return {
        ...state,
        sendModal: payload
      }
    },

    setRefreshBalanceLoadingReducer(state, { payload }) {
      return {
        ...state,
        refreshBalanceLoading: payload
      }
    }
  }
}

export default WalletModel;
