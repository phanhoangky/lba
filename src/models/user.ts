import  jwt_decode from 'jwt-decode';
import type { Effect, Reducer } from 'umi';
import { history } from 'umi';
import { GetAccountById } from '@/services/AccountService/Account';
import EtherService from '@/configs/Support';
import { getPageQuery } from '@/utils/utils';
import firebase from 'firebase';
import { CreateFolder, CreateMedia } from '@/services/PublitioService/PublitioService';
import { GoogleLogin, PostAuthentication } from '@/services/login';
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
  password?: string;
};

export type UserModelState = {
  currentUser?: CurrentUser;
  credential?: any;
  updateProfileParam?: {
    file?: any;
    name?: string;
  },

  changePasswordModal?: {
    visible: boolean;
    isLoading: boolean;
    currentStep: number;
  }
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
    
  };
};

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},

    changePasswordModal: {
      isLoading: false,
      currentStep: 0,
      visible: false
    }
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
      if (tokenFirebase) {
        const decode = yield jwt_decode(tokenFirebase);
        // console.log('====================================');
        // console.log(decode, Date.now() >= decode.exp * 1000);
        // console.log('====================================');
        if (decode.claims) {
          // if (Date.now() >= decode.exp * 1000) {
          //   history.replace("/account/login");
          // }
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
          // if (Date.now() >= decode.exp * 1000) {
          //   history.replace("/account/login");
          // }
          const ether = yield EtherService.build();
          if (decode.WalletKeyStore) {
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
          } else {
            history.replace("account/login");
            throw new Error("Doesn't have wallet");
          }
          
        }
      } else {
        history.replace("account/login");
      }
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
      const { credential } = firebaseResponse;
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
        if (newToken && newToken.data) {
          yield localStorage.setItem("JWT", newToken.data.result);
          decoded = yield jwt_decode(newToken.data.result);
        } else {
          history.replace("/account");
          // throw new Error("Network Error");
        }
        
        
      } else {
        const param: AuthenticationRequest = {
          firebaseToken: tokenFirebase,
          uid: firebaseResponse.user.uid,
          // walletAddress: ether.wallet.address,
          newUser: firebaseResponse.additionalUserInfo.isNewUser
        }
        const newToken = yield call(PostAuthentication, param); 
        if (newToken && newToken.data) {
          decoded = yield jwt_decode(newToken.data.result);
          yield ether.readKeyStoreJson(decoded.claims.WalletKeyStore, firebaseResponse.user.uid);
          yield localStorage.setItem("JWT", newToken.data.result);
        } else {
          history.replace("/account");
          // throw new Error("Network Error");
        }
        
      }
      if (decoded) {
        yield ether.initContracts();
        const balance = yield ether.getBalance();
         //
      
        // const newId = yield firebase.auth().currentUser?.reauthenticateWithCredential(credential);
        yield firebase.auth().currentUser?.reauthenticateWithCredential(credential);
        const newToken = yield firebase.auth().currentUser?.getIdToken();
        yield localStorage.setItem("JWT", newToken);

        if (newToken) {
          decoded = yield jwt_decode(newToken);
        }

        // const {data} = yield call(GetAccountById);
        yield put({
          type: "saveCurrentUser",
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
            // ...data.result
          }
        });
      }
     
    },

    *emailLogin({ payload }, { put }) {
      
      const ether = yield EtherService.build();
      // const data: firebase.User = yield call(EmailLogin, payload.email, payload.password);
      // const { credential }: {credential: firebase.auth.AuthCredential} = payload;
      const { user }: {user: firebase.User} = payload;
      if (payload && user) {

        const tokenFirebase = yield user.getIdToken();
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

        yield localStorage.setItem("JWT", tokenFirebase);

        const balance = yield ether.getBalance();
        yield put({
          type: "saveCurrentUser",
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
            // ...data.result
          }
        });
      }
    },

    *registerEmail({ payload }, { call }) {
      // const data: firebase.User = yield call(CreateUserWithEmailAndPasswordHandler, payload.email, payload.password);
      // const { credential }: {credential: firebase.auth.AuthCredential} = payload;
      const { user }: { user: firebase.User } = payload;
      if (payload && user) {
        yield user.sendEmailVerification();
        const res = yield call(CreateFolder, { name: user.uid });
        const ether = yield EtherService.build();
        const tokenFirebase = yield user.getIdToken(true);
        yield ether.createAccount();
        const walletKeyStore: any = yield ether.createKeyStoreJson(user.uid);
        const param: AuthenticationRequest = {
          firebaseToken: tokenFirebase,
          uid: user.uid,
          walletKeyStore,
          walletAddress: ether.wallet.address,
          rootFolderId: res.id,
        }
        // console.log(param);

        yield call(PostAuthentication, param);

        // yield user.reauthenticateWithCredential(credential);

        // const newToken = yield user.getIdToken(true);

        // console.log('====================================');
        // // console.log(credential);
        // console.log('====================================');
        // yield ether.initContracts();
        // yield localStorage.setItem("JWT", newToken);
        // const decoded = yield jwt_decode(newToken);
        // console.log('====================================');
        // console.log("Refresh Totken>>>", newToken, decoded);
        // console.log('====================================');
        // const balance = yield ether.getBalance();
        // yield put({
        //   type: "saveCurrentUser",
        //   payload: {
        //     ...user,
        //     id: decoded.Id,
        //     email: decoded.email,
        //     name: decoded.name,
        //     avatar: decoded.picture,
        //     uid: decoded.user_id,
        //     userid: decoded.user_id,
        //     balance,
        //     ether,
        //     // ...data.result
        //   }
        // });
      }
      history.push('/account/register-result')
    },

    *updateProfile({ payload }, { call }) {
      const { currentUser }: { currentUser: firebase.User } = yield firebase.auth();

      if (payload.file) {
        const file = yield call(CreateMedia, {
          file: payload.file
        })

        yield currentUser.updateProfile({
          displayName: payload.name,
          photoURL: file.url_preview,
        })
      } else {
        yield currentUser.updateProfile({
          displayName: payload.name,
        })
      }
    },

    *sendResetPassword({ payload }, { call }) {
      yield firebase.auth().sendPasswordResetEmail(payload);
    },

    *changePassword({ payload }, { put }) {
      const user: firebase.User = yield firebase.auth().currentUser;
      
      yield user.updatePassword(payload);

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
    },

    setUpdateProfileParamReducer(state, { payload }) {
      return {
        ...state,
        updateProfileParam: payload
      }
    },

      setChangePasswordModalReducer(state, { payload }) {
      return {
        ...state,
        changePasswordModal: payload
      }
    }
  },
};

export default UserModel;
