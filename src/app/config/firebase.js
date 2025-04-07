import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configurações do Firebase (pegue no Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCId3SHkxs7Qy485D8H9IxIRbwRyOz0XXI",
  authDomain: "wlsalaobarbearia-b41d8.firebaseapp.com",
  projectId: "wlsalaobarbearia-b41d8",
  storageBucket: "gs://wlsalaobarbearia-b41d8.firebasestorage.app",
  messagingSenderId: "615008986829",
  appId: "1:615008986829:web:dd0f6e2e89dc8c96f5eb84",
  measurementId: "G-NMJ30NCJT7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ⬇️ AQUI: aumenta o tempo de retry para evitar timeouts
storage.maxUploadRetryTime = 10 * 60 * 1000; // 10 minutos
storage.maxDownloadRetryTime = 10 * 60 * 1000;
storage.maxOperationRetryTime = 10 * 60 * 1000;

export { db, storage };
