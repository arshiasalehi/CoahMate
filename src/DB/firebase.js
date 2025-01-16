import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getFirestore, doc, getDoc, setDoc,} from "firebase/firestore";
import { getStorage, ref, getDownloadURL} from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCxw0eha5bRESeJp0Ucw1jX5LXBNo-J9q4",
  authDomain: "coachmate-cd46e.firebaseapp.com",
  projectId: "coachmate-cd46e",
  storageBucket: "coachmate-cd46e.appspot.com",
  messagingSenderId: "790591381053",
  appId: "1:790591381053:web:441e6c929f9eef67955454",
  measurementId: "G-FJMXKFVM6R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);
const  storage = getStorage(app);
const rdb = getDatabase(app);

export { app, rdb , storage ,ref, getDownloadURL, getAuth, getFirestore,auth , db, doc, setDoc , getDoc };
 