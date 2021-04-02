import  jwt_decode from 'jwt-decode';
import type { Effect, Reducer } from 'umi';
import { history } from 'umi';
import { GetAccountById } from '@/services/AccountService/Account';
import EtherService from '@/configs/Support';
import { getPageQuery } from '@/utils/utils';
import firebase from 'firebase';
import { CreateFolder } from '@/services/PublitioService/PublitioService';
import {  EmailLogin, GoogleLogin, PostAuthentication } from '@/services/login';
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
  isActive?: boolean;
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

    emailLogin: Effect;
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
      // const token = yield localStorage.getItem("JWT");
      // const res = yield call(CreateFolder, { name: token.user_id });
      const tokenFirebase = yield firebase.auth().currentUser?.getIdToken();
      if (tokenFirebase && tokenFirebase.includes(".")) {
        const decode = yield jwt_decode(tokenFirebase);
        if (decode.claims) {
          if (Date.now() >= decode.exp * 1000) {
            history.replace("/account/login");
          }
          const ether = yield EtherService.build();
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
              ether,
            }
          })
        } else {
          if (Date.now() >= decode.exp * 1000) {
            history.replace("/account/login");
          }
          const ether = yield EtherService.build();
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
      } else {
        history.replace("account/login");
      }
    },

    setToken() {
      
      const urlParams = new URL(window.location.href);
      const params = getPageQuery();
      let { redirect } = params as { redirect: string };
      if (redirect) {
        const redirectUrlParams = new URL(redirect);
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
      const {credential} = firebaseResponse;
      const ether = yield EtherService.build();
      const tokenFirebase = yield firebase.auth().currentUser?.getIdToken(); // Mac ke
      
      let decoded: any = null;
      if (firebaseResponse.additionalUserInfo.isNewUser) {
        const res = yield call(CreateFolder, { name: firebaseResponse.user.uid });
        yield ether.createAccount();
        const walletKeyStore: any = yield ether.createKeyStoreJson(firebaseResponse.user.uid);
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
        yield localStorage.setItem("JWT", newToken.data.result);
        decoded = yield jwt_decode(newToken.data.result);
      } else {
        const param: AuthenticationRequest = {
          firebaseToken: tokenFirebase,
          uid: firebaseResponse.user.uid,
          // walletAddress: ether.wallet.address,
          newUser: firebaseResponse.additionalUserInfo.isNewUser
        }
        const newToken = yield call(PostAuthentication, param); 
        
        
        decoded = yield jwt_decode(newToken.data.result);
        yield ether.readKeyStoreJson(decoded.claims.WalletKeyStore, firebaseResponse.user.uid);
        yield localStorage.setItem("JWT", newToken.data.result);
      }
      yield ether.initContracts();
      //
      const balance = yield ether.getBalance();
      // const newId = yield firebase.auth().currentUser?.reauthenticateWithCredential(credential);
      yield firebase.auth().currentUser?.reauthenticateWithCredential(credential);
      const newToken = yield firebase.auth().currentUser?.getIdToken();
      yield localStorage.setItem("JWT", newToken);

      // const {data} = yield call(GetAccountById);
      yield put({
        type: "saveCurrentUser",
        payload: {
          id: decoded.Id,
          email: decoded.email,
          name: decoded.name,
          avatar: decoded.picture,
          uid: decoded.user_id,
          userid: decoded.user_id,
          balance,
          ether,
          // ...data.result
        }
      });
    },

    *emailLogin(_, { call }) {
      yield call(EmailLogin);
      
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
