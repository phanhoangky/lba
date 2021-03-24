import  ApiHelper  from '@/apis/LBA_API';
import firebase from "./FirebaseService/firebase";

export type LoginParamsType = {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
};

export type LoginWithGoogleType = {
  userId: string;
  userName: string;
  token: string;
}

export type AuthenticationRequest = {
  firebaseToken?: string,
  walletKeyStore?: string,
  walletAddress?: string,
  uid?: string,
  rootFolderId?: string,
}

// export async function fakeAccountLogin(params: LoginParamsType) {
//   return request('/api/login/account', {
//     method: 'POST',
//     data: params,
//   });
// }

// export async function getFakeCaptcha(mobile: string) {
//   return request(`/api/login/captcha?mobile=${mobile}`);
// }

export async function GoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const res = await firebase
    .auth()
    .signInWithPopup(provider);
  return res;
}

export async function PostAuthentication(params: AuthenticationRequest) {
  const res = await  ApiHelper.post("accounts/authenticate", { ...params });
  return res
}