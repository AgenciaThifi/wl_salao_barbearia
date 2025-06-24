import { db, auth } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  query,
  Timestamp,
  deleteDoc,
  doc,
  where,
  orderBy,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

/* ============================ AGENDAMENTOS ============================ */
export interface Agendamento {
  id: string;
  nome: string;
  telefone: string;
  horario: string;
  userId?: string;
}

export const criarAgendamento = async (agendamento: Omit<Agendamento, "id">) => {
  try {
    await addDoc(collection(db, "agendamentos"), agendamento);
    console.log("Agendamento criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
  }
};

export const obterHorariosDisponiveis = async (horariosPadrao: string[]): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "agendamentos"));
    const horariosOcupados: string[] = querySnapshot.docs.map(doc => doc.data().horario as string);
    return horariosPadrao.filter(h => !horariosOcupados.includes(h));
  } catch (error) {
    console.error("Erro ao obter horários disponíveis:", error);
    return horariosPadrao;
  }
};

export async function obterAgendamentos(): Promise<Agendamento[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "agendamentos"));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Agendamento, "id">),
    }));
  } catch (error) {
    console.error("Erro ao obter agendamentos:", error);
    return [];
  }
}

export const getClienteAgendamentos = async (userId: string): Promise<Agendamento[]> => {
  try {
    const q = query(collection(db, "agendamentos"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Agendamento, "id">)
    }));
  } catch (error) {
    console.error("Erro ao buscar agendamentos do cliente:", error);
    return [];
  }
};

/* ============================ CATÁLOGO DE SERVIÇOS ============================ */
export interface Servico {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  tempo: string;
}

export const adicionarServico = async (servico: Omit<Servico, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "servicos"), servico);
    console.log("Serviço adicionado com sucesso!", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Erro ao adicionar serviço:", error);
  }
};

export const excluirServico = async (id: string) => {
  try {
    await deleteDoc(doc(db, "servicos", id));
    console.log("Serviço excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
  }
};

export const obterServicos = async (): Promise<Servico[]> => {
  try {
    const snapshot = await getDocs(collection(db, "servicos"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Servico, "id">)
    }));
  } catch (error) {
    console.error("Erro ao obter serviços:", error);
    return [];
  }
};

export const atualizarServico = async (id: string, servicoAtualizado: Partial<Servico>) => {
  try {
    await setDoc(doc(db, "servicos", id), servicoAtualizado, { merge: true });
    console.log("Serviço atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
  }
};

/* ============================ GALERIA DE IMAGENS ============================ */
export interface Imagem {
  id: string;
  titulo?: string;
  descricao?: string;
  instagramUrl?: string;
  isActive: boolean;
  criadoEm: Timestamp;
}

export const uploadImagem = async (
  file: File,
  titulo: string,
  descricao: string,
  instagramUrl: string,
  isActive: boolean
) => {
  const storage = getStorage();
  const storageRef = ref(storage, `galeria/${file.name}`);

  try {
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "galeria"), {
      titulo,
      descricao,
      instagramUrl,
      isActive,
      criadoEm: Timestamp.now(),
    });
    console.log("Imagem carregada e salva com sucesso!");
  } catch (error) {
    console.error("Erro ao carregar imagem:", error);
  }
};

export const obterGaleria = async (): Promise<Imagem[]> => {
  try {
    const snapshot = await getDocs(collection(db, "galeria"));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      criadoEm: doc.data().criadoEm instanceof Timestamp
        ? doc.data().criadoEm
        : Timestamp.now(),
    })) as Imagem[];
  } catch (error) {
    console.error("Erro ao obter galeria:", error);
    return [];
  }
};

export const adicionarImagemManual = async (
  titulo: string,
  descricao: string,
  instagramUrl: string,
  isActive: boolean,
  criadoEm: Timestamp
) => {
  try {
    await addDoc(collection(db, "galeria"), {
      titulo,
      descricao,
      instagramUrl,
      isActive,
      criadoEm,
    });
    console.log("Imagem adicionada manualmente com sucesso!");
  } catch (error) {
    console.error("Erro ao adicionar imagem manualmente:", error);
  }
};

/* ============================ LOGIN E PERFIL CLIENTE ============================ */
export async function loginUser(email: string, senha: string) {
  const adminRef = collection(db, "usuariosAdm");
  const qAdmin = query(adminRef, where("email", "==", email), where("senha", "==", senha));
  const adminSnapshot = await getDocs(qAdmin);

  if (!adminSnapshot.empty) return { email, role: "admin" };

  const consumerRef = collection(db, "usuariosConsumidor");
  const qConsumer = query(consumerRef, where("email", "==", email), where("senha", "==", senha));
  const consumerSnapshot = await getDocs(qConsumer);

  if (!consumerSnapshot.empty) return { email, role: "cliente" };

  return null;
}

export async function loginUserFirebaseAuth(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export const logoutUserFirebaseAuth = async () => {
  await signOut(auth);
  console.log("Usuário deslogado com sucesso.");
};

export const getAdminPhoneNumber = async (): Promise<string> => {
  try {
    const snapshot = await getDocs(collection(db, "usuariosAdm"));
    const adminDoc = snapshot.docs.find(doc => !!doc.data().telefone);
    return adminDoc?.data().telefone || "+5561999999999";
  } catch (error) {
    console.error("Erro ao buscar telefone do administrador:", error);
    return "+5561999999999";
  }
};

export const getCurrentUserData = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não está autenticado.");

  const userDocSnap = await getDoc(doc(db, "usuariosConsumidor", user.uid));
  if (!userDocSnap.exists()) throw new Error("Dados do usuário não encontrados.");

  return {
    id: user.uid,
    ...(userDocSnap.data() as {
      nome: string;
      telefone: string;
      preferencias_notificacao?: {
        email: boolean;
        whatsapp: boolean;
      };
    }),
  };
};

export const updateConsumerUserData = async (
  userId: string,
  novosDados: Partial<{
    nome: string;
    telefone: string;
    preferencias_notificacao: {
      email: boolean;
      whatsapp: boolean;
    };
  }>
) => {
  const userRef = doc(db, "usuariosConsumidor", userId);
  await setDoc(userRef, novosDados, { merge: true });
};

export async function registerConsumerUser(
  email: string,
  senha: string,
  nome: string,
  telefone: string,
  preferenciaEmail: boolean,
  preferenciaWhatsapp: boolean
) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
  const uid = userCredential.user.uid;

  await setDoc(doc(db, "usuariosConsumidor", uid), {
    email,
    senha, // ⚠️ Não recomendado armazenar senha em texto puro
    nome,
    telefone,
    preferencias_notificacao: {
      email: preferenciaEmail,
      whatsapp: preferenciaWhatsapp,
    },
    criadoEm: Timestamp.now(),
  });

  return uid;
}

/* ============================ COMPRAS DO CLIENTE ============================ */
export interface Compra {
  id: string;
  userId: string;
  produtoId: string;
  nomeProduto: string;
  quantidade: number;
  valorTotal: number;
  data: Timestamp;
}

export const getClienteCompras = async (userId: string): Promise<Compra[]> => {
  try {
    const q = query(
      collection(db, "compras"),
      where("userId", "==", userId),
      orderBy("data", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Compra, "id">),
    }));
  } catch (error) {
    console.error("Erro ao buscar compras do cliente:", error);
    return [];
  }
};
