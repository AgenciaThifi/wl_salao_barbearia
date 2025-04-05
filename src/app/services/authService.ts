// services/authService.ts
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase"; // Ajuste o caminho conforme necessário

/**
 * Faz login usando Firebase Auth e checa se o UID está em usuariosAdm ou usuariosConsumidor.
 * Retorna { email, role } ou lança erro se não encontrar.
 */
export async function loginUserFirebaseAuth(email: string, password: string) {
  // 1) Faz login no Firebase Authentication
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (!user) {
    throw new Error("Falha na autenticação.");
  }

  // 2) Tenta achar doc em usuariosAdm com ID = user.uid
  const adminDocRef = doc(db, "usuariosAdm", user.uid);
  const adminDocSnap = await getDoc(adminDocRef);

  if (adminDocSnap.exists()) {
    // É admin
    return { email: user.email, role: "admin" };
  }

  // 3) Se não achou em usuariosAdm, tenta usuariosConsumidor
  const consumerDocRef = doc(db, "usuariosConsumidor", user.uid);
  const consumerDocSnap = await getDoc(consumerDocRef);

  if (consumerDocSnap.exists()) {
    // É cliente
    return { email: user.email, role: "cliente" };
  }

  // 4) Se não encontrou em nenhum lugar, erro
  throw new Error("Usuário não encontrado em usuariosAdm ou usuariosConsumidor");
}
