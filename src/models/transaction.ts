import { GetListTransactions } from "@/services/TransactionService";
import type { GetListTransactionParam } from "@/services/TransactionService";
import type { Effect, Reducer } from "umi";
import moment from "moment";
import { diffTwoDate } from "@/utils/utils";

export type TransactionType = {
  id: number,
  sender: string;
  receiver: string;
  value: number;
  type: number;
  time: string;
  txHash: string;
  campaignId: string;
  mediaSrcId: string;
  receiverNavigation: any;
  campaignCreateByNavigations: any;
  campaignModifyByNavigations: any;

}

export type TransactionModelState = {
  listTransactions?: TransactionType[],
  totalItem?: number;
  transTableLoading?: boolean;
  getListTransactionsParam?: GetListTransactionParam;
  refreshBalanceLoading?: boolean;
}

export type TransactionStoreModel = {
  namespace: string;

  state: TransactionModelState;

  effects: {
    getListTransactions: Effect;
  },

  reducers: {
    setListTransactionsReducer: Reducer<TransactionModelState>;
    setGetListTransactionParamReducer: Reducer<TransactionModelState>;
    setTransTableLoadingReducer: Reducer<TransactionModelState>;
    setTotalItemReducer: Reducer<TransactionModelState>;
    setRefreshBalanceLoadingReducer: Reducer<TransactionModelState>;

  }
}
const TransactionStore: TransactionStoreModel = {
  namespace: "transaction",

  state: {
    listTransactions: [],
    transTableLoading: false,
    getListTransactionsParam: {
      isDescending: false,
      isPaging: true,
      isSort: false,
      orderBy: "",
      pageLimitItem: 10,
      pageNumber: 0,
      searchValue: ""
    },
    
    refreshBalanceLoading: false,
  },


  effects: {
    *getListTransactions({ payload }, { call, put }) {
      const res = yield call(GetListTransactions, payload);

      yield put({
        type: "setListTransactionsReducer",
        payload: res.result.data.map((data: any) => {
          const now = moment();
          const date = moment(data.time);
          
          const diff = diffTwoDate(now, date);
          return {
            ...data,
            time: moment(data.time).format("YYYY-MM-DD"),
            age: diff
          }
        })
      })

      yield put({
        type: "setTotalItemReducer",
        payload: res.result.totalItem
      })

      yield put({
        type: "setGetListTransactionParamReducer",
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

    setTotalItemReducer(state, { payload }) {
      return {
        ...state,
        totalItem: payload
      }
    },

    setTransTableLoadingReducer(state, { payload }) {
      return {
        ...state,
        transTableLoading: payload
      }
    },

    setGetListTransactionParamReducer(state, { payload }) {
      return {
        ...state,
        getListTransactionsParam: payload
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

export default TransactionStore;