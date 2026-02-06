import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCFgXuTJwn1yCsWzSTCPboEHNxykcx3dG4",
  authDomain: "samy-website.firebaseapp.com",
  databaseURL: "https://samy-website-default-rtdb.firebaseio.com",
  projectId: "samy-website",
  storageBucket: "samy-website.firebasestorage.app",
  messagingSenderId: "891624235364",
  appId: "1:891624235364:web:e67c2aea6029b1e1651a71",
  measurementId: "G-8HP7ME6FGR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export default app;
