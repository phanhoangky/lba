import firebase from "firebase/app";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDTVNL7iuE3ROMASBCgihA0X3q3OCTymC4",
  authDomain: "locationbasedadvertising-b770d.firebaseapp.com",
  databaseURL: "https://locationbasedadvertising-b770d-default-rtdb.firebaseio.com",
  projectId: "locationbasedadvertising-b770d",
  storageBucket: "locationbasedadvertising-b770d.appspot.com",
  messagingSenderId: "124495134608",
  appId: "1:124495134608:web:c844df416384a0f3493d15",
  measurementId: "G-MG29TNWK03"
};
firebase.initializeApp(firebaseConfig);
  // firebase.analytics();


export const firebaseRef = firebase.storage().ref();

export default firebase;