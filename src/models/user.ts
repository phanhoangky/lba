import jwt_decode from 'jwt-decode';
import { Effect, Reducer } from 'umi';
import { history } from 'umi';
import { GetAccountById } from '@/services/AccountService/Account';
import EtherService from '@/configs/Support';
import { getPageQuery } from '@/utils/utils';
import firebase from 'firebase';
import { CreateFolder, CreateMedia } from '@/services/PublitioService/PublitioService';
import { GoogleLogin, PostAuthentication } from '@/services/login';
import type { AuthenticationRequest } from '@/services/login';
import { isObject } from 'lodash';

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
  password?: string;
  providerId?: string;
  firebase?: any;
};

export type UserModelState = {
  currentUser?: CurrentUser;
  credential?: any;
  updateProfileParam?: {
    file?: any;
    name?: string;
  };

  changePasswordModal?: {
    visible: boolean;
    isLoading: boolean;
    currentStep: number;
  };

  registerModal?: {
    visible: boolean;
    isLoading: boolean;
  };
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
    redirectToHomePage: Effect;

    emailLogin: Effect;

    registerEmail: Effect;

    updateProfile: Effect;

    sendResetPassword: Effect;

    changePassword: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
    clearCurrentUser: Reducer<UserModelState>;

    setUpdateProfileParamReducer: Reducer<UserModelState>;

    setChangePasswordModalReducer: Reducer<UserModelState>;

    saveCredentialReducer: Reducer<UserModelState>;

    setRegisterModalReducer: Reducer<UserModelState>;
  };
};

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},

    changePasswordModal: {
      isLoading: false,
      currentStep: 0,
      visible: false,
    },
  },

  effects: {
    *getCurrentUser(_, { call, put }) {
      const { data } = yield call(GetAccountById);
      yield put({
        type: 'saveCurrentUser',
        payload: data.result,
      });

      return data.result;
    },

    *readJWT(_, { put }) {
      // const tokenFirebase = yield firebase.auth().currentUser?.getIdToken();
      // yield firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
      const tokenFirebase = yield localStorage.getItem('JWT');

      if (tokenFirebase && tokenFirebase !== 'undefined') {
        const decode = yield jwt_decode(tokenFirebase);
        console.log('====================================');
        console.log('Decode >>>', decode);
        console.log('====================================');

        if (Date.now() >= decode.exp * 1000) {
          history.replace('/account/login');
          return Promise.reject(new Error('Your session is expired'));
        }
        const abi = localStorage.getItem('ABI');
        const evn = localStorage.getItem('EVN');
        if (abi && abi !== 'undefined' && evn && evn !== 'undefined') {
          console.log('====================================');
          console.log('EtherService >>>>', JSON.parse(abi), JSON.parse(evn));
          console.log('====================================');
          const ether = new EtherService(JSON.parse(abi), JSON.parse(evn));
          if (decode.WalletKeyStore) {
            yield ether.readKeyStoreJson(decode.WalletKeyStore, decode.user_id);
            yield ether.initContracts();
            const balance = yield ether.getBalance();
            const user = {
              ...decode,
              id: decode.Id,
              name: decode.name,
              avatar: decode.picture,
              email: decode.email,
              userid: decode.user_id,
              balance,
              ether,
            };
            yield put({
              type: 'saveCurrentUser',
              payload: user,
            });
            return user;
          }
        }
        history.replace('account/login');
        return Promise.reject(new Error("Doesn't have wallet"));
      }
      history.replace('account/login');
      return Promise.reject(new Error('Fail to read token'));
    },

    redirectToHomePage() {
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
      console.log('====================================');
      console.log('FR >>>', firebaseResponse);
      console.log('====================================');
      const { credential } = firebaseResponse;
      yield EtherService.build();

      const abi = yield localStorage.getItem('ABI');
      const evn = yield localStorage.getItem('EVN');
      if (abi && !isObject(abi) && evn && !isObject(evn)) {
        const ether = new EtherService(JSON.parse(abi), JSON.parse(evn));

        const tokenFirebase = yield firebase.auth().currentUser?.getIdToken(); // Mac ke
        yield firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
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
            newUser: firebaseResponse.additionalUserInfo.isNewUser,
          };
          // console.log(param);

          const newToken = yield call(PostAuthentication, param);
          if (newToken && newToken.data) {
            yield localStorage.setItem('JWT', newToken.data.result);
            decoded = yield jwt_decode(newToken.data.result);
          } else {
            history.replace('/account');
            // throw new Error("Network Error");
          }
        } else {
          const param: AuthenticationRequest = {
            firebaseToken: tokenFirebase,
            uid: firebaseResponse.user.uid,
            // walletAddress: ether.wallet.address,
            newUser: firebaseResponse.additionalUserInfo.isNewUser,
          };
          const newToken = yield call(PostAuthentication, param);
          if (newToken && newToken.data) {
            decoded = yield jwt_decode(newToken.data.result);
            yield ether.readKeyStoreJson(decoded.claims.WalletKeyStore, firebaseResponse.user.uid);
            yield localStorage.setItem('JWT', newToken.data.result);
          } else {
            history.replace('/account');
            // throw new Error("Network Error");
          }
        }
        if (decoded) {
          yield ether.initContracts();
          const balance = yield ether.getBalance();
          // const newId = yield firebase.auth().currentUser?.reauthenticateWithCredential(credential);
          yield firebase.auth().currentUser?.reauthenticateWithCredential(credential);
          const newToken = yield firebase.auth().currentUser?.getIdToken();
          yield localStorage.setItem('JWT', newToken);

          if (newToken) {
            decoded = yield jwt_decode(newToken);
          }

          // const {data} = yield call(GetAccountById);
          yield put({
            type: 'saveCredentialReducer',
            payload: credential,
          });
          yield put({
            type: 'saveCurrentUser',
            payload: {
              ...firebaseResponse.user,
              id: decoded.Id,
              email: decoded.email,
              name: decoded.name,
              avatar: decoded.picture,
              uid: decoded.user_id,
              userid: decoded.user_id,
              balance,
              ether,
              providerId: firebaseResponse.additionalUserInfo.providerId,
              // ...data.result
            },
          });
        }
      }
      // return Promise.reject(new Error('Network error'));
    },

    *emailLogin({ payload }, { put }) {
      yield EtherService.build();

      const abi = yield localStorage.getItem('ABI');
      const evn = yield localStorage.getItem('EVN');
      if (abi && !isObject(abi) && evn && !isObject(evn)) {
        const ether = new EtherService(JSON.parse(abi), JSON.parse(evn));
        // const data: firebase.User = yield call(EmailLogin, payload.email, payload.password);
        // const { credential }: {credential: firebase.auth.AuthCredential} = payload;
        const { user }: { user: firebase.User } = payload;
        if (payload && user) {
          const tokenFirebase = yield user.getIdToken();
          yield firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

          // const param: AuthenticationRequest = {
          //   firebaseToken: tokenFirebase,
          //   uid: user.uid,
          //   // walletAddress: ether.wallet.address,
          // }
          // const newToken = yield call(PostAuthentication, param);
          // yield user.reauthenticateWithCredential(credential);

          // const refreshToken = yield user.getIdToken();
          const decoded = yield jwt_decode(tokenFirebase);
          yield ether.readKeyStoreJson(decoded.WalletKeyStore, user.uid);
          yield ether.initContracts();
          // yield ether.readKeyStoreJson(decoded.claims.WalletKeyStore, data.uid);

          yield localStorage.setItem('JWT', tokenFirebase);

          const balance = yield ether.getBalance();
          yield put({
            type: 'saveCurrentUser',
            payload: {
              ...user,
              id: decoded.Id,
              email: decoded.email,
              name: decoded.name,
              avatar: decoded.picture,
              uid: decoded.user_id,
              userid: decoded.user_id,
              balance,
              ether,
              password: payload.password,
              // ...data.result
            },
          });
        }
      }
    },

    *registerEmail({ payload }, { call }) {
      // const data: firebase.User = yield call(CreateUserWithEmailAndPasswordHandler, payload.email, payload.password);
      // const { credential }: {credential: firebase.auth.AuthCredential} = payload;
      const { user }: { user: firebase.User } = payload;
      if (payload && user) {
        yield user.sendEmailVerification();
        const res = yield call(CreateFolder, { name: user.uid });
        yield EtherService.build();
        const abi = yield localStorage.getItem('ABI');
        const evn = yield localStorage.getItem('EVN');
        if (abi && !isObject(abi) && evn && !isObject(evn)) {
          const tokenFirebase = yield user.getIdToken(true);
          const ether = new EtherService(JSON.parse(abi), JSON.parse(evn));
          yield ether.createAccount();
          const walletKeyStore: any = yield ether.createKeyStoreJson(user.uid);
          const param: AuthenticationRequest = {
            firebaseToken: tokenFirebase,
            uid: user.uid,
            walletKeyStore,
            walletAddress: ether.wallet.address,
            rootFolderId: res.id,
          };
          // console.log(param);

          yield call(PostAuthentication, param);
        }
      }
      history.push('/account/register-result');
    },

    *updateProfile({ payload }, { call, put }) {
      console.log('====================================');
      console.log(payload);
      console.log('====================================');
      const { currentUser }: { currentUser: firebase.User } = yield firebase.auth();

      if (payload.file) {
        const file = yield call(CreateMedia, {
          file: payload.file,
        });
        yield currentUser.updateProfile({
          displayName: payload.name,
          photoURL: file.url_preview,
        });

        yield put({
          type: 'saveCurrentUser',
          payload: {
            avatar: file.url_preview,
            name: payload.name,
          },
        });
      } else {
        yield currentUser.updateProfile({
          displayName: payload.name,
        });

        yield put({
          type: 'saveCurrentUser',
          payload: {
            name: payload.name,
          },
        });
      }
    },

    *sendResetPassword({ payload }) {
      yield firebase.auth().sendPasswordResetEmail(payload);
    },

    *changePassword({ payload }) {
      const user: firebase.User = yield firebase.auth().currentUser;

      yield user.updatePassword(payload);
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: {
          ...state?.currentUser,
          ...action.payload,
        },
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
          userid: undefined,
        },
      };
    },

    setUpdateProfileParamReducer(state, { payload }) {
      return {
        ...state,
        updateProfileParam: payload,
      };
    },

    setChangePasswordModalReducer(state, { payload }) {
      return {
        ...state,
        changePasswordModal: payload,
      };
    },

    saveCredentialReducer(state, { payload }) {
      return {
        ...state,
        credential: payload,
      };
    },

    setRegisterModalReducer(state, { payload }) {
      return {
        ...state,
        registerModal: payload,
      };
    },
  },
};

export default UserModel;
