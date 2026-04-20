import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBzDbGNSB1mAzdp9-s-Paq6pDDly4DD-eA",
  authDomain: "mgthant-myks-s034.firebaseapp.com",
  databaseURL: "https://mgthant-myks-s034-default-rtdb.firebaseio.com",
  projectId: "mgthant-myks-s034",
  storageBucket: "mgthant-myks-s034.firebasestorage.app",
  messagingSenderId: "930569720266",
  appId: "1:930569720266:web:9884027df5a143c154ff33",
  measurementId: "G-T1BKXZG0R1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
