import * as firebase from 'firebase';


//Inisialisasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyApEjJtdg6Mrwnjd3Jes4G6vZiNjJSvA5k",
  authDomain: "cao-82eda.firebaseapp.com",
  databaseURL: "https://cao-82eda.firebaseio.com",
  projectId: "cao-82eda",
  storageBucket: "cao-82eda.appspot.com",
};

firebase.initializeApp(firebaseConfig);

export default firebase;