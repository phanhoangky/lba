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
  newUser?: string;
}

export type UpdateProfileParam = {
  displayName: string;
  photoUrl: string;
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

export async function EmailLogin(email: string, password: string) {
  return firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in
    const {user} = userCredential;
    console.log('====================================');
    console.log("Login >>>", user);
    console.log('====================================');
    return userCredential;
    // ...
  }).catch((error) => {
    throw error
  })
}

export async function CreateUserWithEmailAndPasswordHandler(email: string, password: string) {
  return firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
     // Signed up
    const {user} = userCredential;
    console.log('====================================');
    console.log(user);
    console.log('====================================');
    return userCredential;
    // ...
  }).catch((error) => {
    throw error;
  })
}

export async function SendEmailLink(email: string) {
    const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: 'http://localhost:8000/account/login',
    // This must be true.
    handleCodeInApp: true,
    iOS: {
      bundleId: 'com.example.ios'
    },
    android: {
      packageName: 'com.example.android',
      installApp: true,
      minimumVersion: '12'
    },
    dynamicLinkDomain: 'example.page.link'
  };
  return firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings).then((userCredential) => {
    return userCredential;
  }).catch((error) => {
    throw error;
  })
}

export async function SignOut() {
  await firebase.auth().signOut();
}