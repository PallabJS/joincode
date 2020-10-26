// Import Firebase
import firebase from 'firebase';

// Firebase config for joincode project 
const firebaseConfig = {
    apiKey: "AIzaSyB2EyW-WJKBb_sqLADPzQXBQTjQmnD9yu8",
    authDomain: "joincode-d53d7.firebaseapp.com",
    databaseURL: "https://joincode-d53d7.firebaseio.com",
    projectId: "joincode-d53d7",
    storageBucket: "joincode-d53d7.appspot.com",
    messagingSenderId: "415948714083",
    appId: "1:415948714083:web:48a4f598ca33b85d1d8856"
};

// Initialise firebase functions
export const fb = firebase.initializeApp(firebaseConfig);
export const db = firebase.database();
export const auth = firebase.auth();