import  jwt_decode from 'jwt-decode';
import type { Effect, Reducer } from 'umi';
import { history } from 'umi';
import { GetAccountById } from '@/services/AccountService/Account';
import EtherService from '@/configs/Support';
import { getPageQuery } from '@/utils/utils';
import firebase from 'firebase';
import { CreateFolder, GetFolders } from '@/services/PublitioService/PublitioService';
import { AuthenticationRequest, GoogleLogin, PostAuthentication } from '@/services/login';

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
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
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
      // console.log("Create Folder >>>>", res);
      if (token) {
        const decode = yield jwt_decode(token);
        const ether = yield EtherService.build();
        yield ether.readKeyStoreJson(decode.WalletKeyStore, decode.user_id)
        yield ether.initContracts();
        console.log(decode);
        yield put({
          type: "saveCurrentUser",
          payload: {
            id: decode.Id,
            name: decode.name,
            avatar: decode.picture,
            email: decode.email,
            userid: decode.user_id,
            ether
          }
        })
      }
    },

    *googleLogin(_, { call, put }) {
      const firebaseResponse = yield call(GoogleLogin);
      console.log(firebaseResponse);
      const ether = yield EtherService.build();
      const tokenFirebase = yield firebase.auth().currentUser?.getIdToken(); // Mac ke
      // console.log(tokenFirebase);
      if (firebaseResponse.additionalUserInfo.isNewUser) {
        const res = yield call(CreateFolder, { name: firebaseResponse.user.uid });
        yield ether.createAccount();
        const walletKeyStore: any = yield ether.createKeyStoreJson(firebaseResponse.user.uid);
        const param: AuthenticationRequest = {
          firebaseToken: tokenFirebase,
          uid: firebaseResponse.user.uid,
          walletKeyStore,
          walletAddress: ether.wallet.address,
          rootFolderId: res.id
        }
        // console.log(param);
        
        yield call(PostAuthentication, param);
        
      } else {
        
        const decoded: any = jwt_decode(tokenFirebase);
        
        console.log(decoded);
        // .user_id
        // yield call(PostAuthentication, param);
        yield ether.readKeyStoreJson(decoded.WalletKeyStore, firebaseResponse.user.uid)
        const res = yield call(GetFolders, { parent_id: null });
        console.log(res);
        
      }
      console.log('====================================');
      console.log("EtherService >>>>", ether);
      console.log('====================================');
      yield ether.initContracts();
      
      const again = yield firebase.auth().currentUser?.getIdToken();
      console.log(jwt_decode(again));
      const decoded: any = jwt_decode(again);
      localStorage.setItem("JWT", again);
      //
      yield put({
        type: "setCurrentUser",
        payload: {
          id: decoded.Id,
          email: decoded.email,
          name: decoded.name,
          avatar: decoded.picture,
          uid: decoded.user_id,
          ether
        }
      });
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
              console.log('====================================');
              console.log("redirect.match(/^/.*#/) >>>>", redirect);
              console.log('====================================');
            }
          } else {
            window.location.href = '/';
            return;
          }
        }
      //
      history.replace(redirect || '/');
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
  },
};

export default UserModel;
