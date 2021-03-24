import  jwt_decode from 'jwt-decode';
import type { Effect, Reducer } from 'umi';
import { history } from 'umi';
import { GetAccountById } from '@/services/AccountService/Account';
import EtherService from '@/configs/Support';
import { getPageQuery } from '@/utils/utils';
import firebase from 'firebase';
import { CreateFolder } from '@/services/PublitioService/PublitioService';
import {  GoogleLogin, PostAuthentication } from '@/services/login';
import type { AuthenticationRequest } from '@/services/login';

export type CurrentUser = {
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  userid?: string;
  ether?: EtherService;
  unreadCount?: number;
  id?: string;
  email?: string;
  balance?: number | string;
  rootFolderId?: string;
};

export type UserModelState = {
  currentUser?: CurrentUser;
};

export type UserModelType = {
  namespace: 'user';
  state: UserModelState;
  effects: {
    // fetch: Effect;
    // fetchCurrent: Effect;
    readJWT: Effect;
    getCurrentUser: Effect;
    googleLogin: Effect;
    setToken: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
    clearCurrentUser: Reducer<UserModelState>;
  };
};

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
  },

  effects: {

    
    *getCurrentUser(_, { call, put }) {
      const {data} = yield call(GetAccountById);
      yield put({
        type: "saveCurrentUser",
        payload: data.result
      })

      return data.result;
    },

    *readJWT(_, { put }) {
      const token = yield localStorage.getItem("JWT");
      // const res = yield call(CreateFolder, { name: token.user_id });

      if (token) {
        const decode = yield jwt_decode(token);
          console.log('====================================');
          console.log(decode);
          console.log('====================================');
        if (decode.claims) {
          
          const ether = yield EtherService.build();
          console.log("Token >>>>", token, decode);
          yield ether.readKeyStoreJson(decode.claims.WalletKeyStore, decode.claims.user_id)
          yield ether.initContracts();
          const balance = yield ether.getBalance();
          yield put({
            type: "saveCurrentUser",
            payload: {
              id: decode.claims.Id,
              name: decode.claims.name,
              avatar: decode.claims.picture,
              email: decode.claims.email,
              userid: decode.claims.user_id,
              balance,
              ether
            }
          })
        } else {
          const ether = yield EtherService.build();
          console.log("Token >>>>", token, decode);
          yield ether.readKeyStoreJson(decode.WalletKeyStore, decode.user_id)
          yield ether.initContracts();
          const balance = yield ether.getBalance();
          yield put({
            type: "saveCurrentUser",
            payload: {
              id: decode.Id,
              name: decode.name,
              avatar: decode.picture,
              email: decode.email,
              userid: decode.user_id,
              balance,
              ether
            }
          })
        }
      }
    },

    setToken() {
      
      const urlParams = new URL(window.location.href);
      const params = getPageQuery();
      let { redirect } = params as { redirect: string };
      if (redirect) {
        const redirectUrlParams = new URL(redirect);
        console.log('====================================');
        console.log(">>>>>", urlParams, redirect, params, redirectUrlParams);
        console.log('====================================');
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
      //
      history.replace(redirect || '/');
    },

    *googleLogin(_, { call, put }) {
      const firebaseResponse = yield call(GoogleLogin);
      console.log(firebaseResponse);
      const ether = yield EtherService.build();
      const tokenFirebase = yield firebase.auth().currentUser?.getIdToken(); // Mac ke
      console.log("tokenFirebase >>>>", tokenFirebase);
      
      let decoded: any = null;
      if (firebaseResponse.additionalUserInfo.isNewUser) {
        const res = yield call(CreateFolder, { name: firebaseResponse.user.uid });
        yield ether.createAccount();
        const walletKeyStore: any = yield ether.createKeyStoreJson(firebaseResponse.user.uid);
        console.log('====================================');
        console.log("Wallet Key Store >>>", walletKeyStore);
        console.log('====================================');
        const param: AuthenticationRequest = {
          firebaseToken: tokenFirebase,
          uid: firebaseResponse.user.uid,
          walletKeyStore,
          walletAddress: ether.wallet.address,
          rootFolderId: res.id,
          newUser: firebaseResponse.additionalUserInfo.isNewUser
        }
        // console.log(param);
        
        const newToken = yield call(PostAuthentication, param);
        console.log('====================================');
        console.log("New Token>>>>", newToken);
        console.log('====================================');
        yield localStorage.setItem("JWT", newToken.data.result);
        decoded = yield jwt_decode(newToken.data.result);
      } else {
        
        decoded = yield jwt_decode(tokenFirebase);
        yield localStorage.setItem("JWT", tokenFirebase);
        
        // .user_id
        // yield call(PostAuthentication, param);
        yield ether.readKeyStoreJson(decoded.WalletKeyStore, firebaseResponse.user.uid)
        // yield call(GetFolders, { parent_id: null });
        
      }
      console.log('====================================');
      console.log("EtherService >>>>", ether);
      console.log('====================================');
      yield ether.initContracts();
      //
      const balance = yield ether.getBalance();
      console.log('====================================');
      console.log("Decoded >>>", decoded);
      console.log("Balance >>>", balance);
      console.log('====================================');

      //
      yield put({
        type: "setCurrentUser",
        payload: {
          id: decoded.Id,
          email: decoded.email,
          name: decoded.name,
          avatar: decoded.picture,
          uid: decoded.user_id,
          userid: decoded.user_id,
          balance,
          ether
        }
      });
    }
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: {
          ...state?.currentUser,
          ...action.payload
        }
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },

    clearCurrentUser(state) {
      return {
        ...state,
        currentUser: {
          avatar: undefined,
          email: undefined,
          ether: undefined,
          id: undefined,
          name: undefined,
          rootFolderId: undefined,
          title: undefined,
          userid: undefined
        }
      }
    }
  },
};

export default UserModel;
