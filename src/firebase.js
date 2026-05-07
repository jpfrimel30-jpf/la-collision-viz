// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyATwTcBwZrn2loB1ehXBffKX2EXaoHrmNg",
  authDomain: "la-collision-learning.firebaseapp.com",
  projectId: "la-collision-learning",
  storageBucket: "la-collision-learning.firebasestorage.app",
  messagingSenderId: "285812877776",
  appId: "1:285812877776:web:5863e004d397e8d6d731d5",
  measurementId: "G-89KCFEMEEG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);