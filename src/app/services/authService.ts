// services/authService.ts
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase"; // Ajuste o caminho conforme necessário

/**
 * Faz login usando Firebase Auth e checa se o UID está em usuariosAdm ou usuariosConsumidor.
 * Retorna { email, role } ou lança erro se não encontrar.
 */
export const loginUserFirebaseAuth = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error("Erro no login do Firebase Auth");
  }
};
