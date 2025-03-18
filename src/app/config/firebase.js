import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configurações do Firebase (pegue no Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyCId3SHkxs7Qy485D8H9IxIRbwRyOz0XXI",
  authDomain: "wlsalaobarbearia-b41d8.firebaseapp.com",
  projectId: "wlsalaobarbearia-b41d8",
  storageBucket: "wlsalaobarbearia-b41d8.firebasestorage.app",
  messagingSenderId: "615008986829",
  appId: "1:615008986829:web:dd0f6e2e89dc8c96f5eb84",
  measurementId: "G-NMJ30NCJT7"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
