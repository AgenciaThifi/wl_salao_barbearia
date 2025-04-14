import { db } from "../config/firebase";
import {
  collection, addDoc, getDocs, getDoc, setDoc, query, Timestamp, deleteDoc, doc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { where } from "firebase/firestore";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword  } from "firebase/auth";

/* ÁREA DE AGENDAMENTO DE HORÁRIOS */

export interface Agendamento {
  id: string;
  nome: string;
  telefone: string;
  horario: string;
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
    const q = query(collection(db, "agendamentos"));
    const querySnapshot = await getDocs(q);

    const horariosOcupados: string[] = querySnapshot.docs.map(doc => doc.data().horario as string);
    return horariosPadrao.filter((hora: string) => !horariosOcupados.includes(hora));
  } catch (error) {
    console.error("Erro ao obter horários disponíveis:", error);
    return horariosPadrao;
  }
};

export async function obterAgendamentos(): Promise<Agendamento[]> {
  try {
    const querySnapshot = await getDocs(collection(db, "agendamentos"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Agendamento, "id">),
    }));
  } catch (error) {
    console.error("Erro ao obter agendamentos:", error);
    return [];
  }
}

/* ÁREA DO CATÁLOGO DE SERVIÇOS */

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
    const querySnapshot = await getDocs(collection(db, "servicos"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Servico, "id">),
    }));
  } catch (error) {
    console.error("Erro ao obter serviços:", error);
    return [];
  }
};
export const atualizarServico = async (id: string, servicoAtualizado: Partial<Servico>) => {
  try {
    const servicoRef = doc(db, "servicos", id);
    await setDoc(servicoRef, servicoAtualizado, { merge: true });
    console.log("Serviço atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
  }
};

/* ÁREA DE GALERIA DE IMAGENS */

export interface Imagem {
  id: string;
  titulo?: string;
  descricao?: string;
  instagramUrl?: string;
  isActive: boolean;
  criadoEm: Timestamp;
}

export const uploadImagem = async (file: File, titulo: string, descricao: string, instagramUrl: string, isActive: boolean) => {
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
      criadoEm: Timestamp.now(),  // Certificando-se de usar o Timestamp correto
    });
    console.log("Imagem carregada e salva com sucesso!");
  } catch (error) {
    console.error("Erro ao carregar imagem:", error);
  }
};

export const obterGaleria = async (): Promise<Imagem[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "galeria"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      criadoEm: doc.data().criadoEm instanceof Timestamp ? doc.data().criadoEm : Timestamp.now(), // Validando o tipo de criadoEm
    })) as Imagem[];
  } catch (error) {
    console.error("Erro ao obter galeria:", error);
    return [];
  }
};

export const adicionarImagemManual = async (titulo: string, descricao: string, instagramUrl: string, isActive: boolean, criadoEm: Timestamp) => {
  try {
    await addDoc(collection(db, "galeria"), {
      titulo,
      descricao,
      instagramUrl,
      isActive,
      criadoEm: Timestamp.now(),
    });
    console.log("Imagem adicionada manualmente com sucesso!");
  } catch (error) {
    console.error("Erro ao adicionar imagem manualmente:", error);
  }
};

/* ÁREA DE LOGIN */

/**
 * Verifica se o usuário existe em usuariosAdm ou usuariosConsumidor
 * Retorna um objeto { email, role } se encontrar, ou null se não encontrar
 */
export async function loginUser(email: string, senha: string) {
  const adminRef = collection(db, "usuariosAdm");
  const qAdmin = query(adminRef, where("email", "==", email), where("senha", "==", senha));
  const adminSnapshot = await getDocs(qAdmin);

  if (!adminSnapshot.empty) {
    return { email, role: "admin" };
  }

  const consumerRef = collection(db, "usuariosConsumidor");
  const qConsumer = query(consumerRef, where("email", "==", email), where("senha", "==", senha));
  const consumerSnapshot = await getDocs(qConsumer);

  if (!consumerSnapshot.empty) {
    return { email, role: "cliente" };
  }

  return null;
}

export async function loginUserFirebaseAuth(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // userCredential.user -> tem o uid
    return userCredential.user;
  } catch (error) {
    throw new Error("Falha no login com Firebase Auth");
  }
}


// Retorna o telefone do administrador
export const getAdminPhoneNumber = async (): Promise<string> => {
  try {
    const snapshot = await getDocs(collection(db, "usuariosAdm"));
    const adminDoc = snapshot.docs.find(doc => !!doc.data().telefone);

    if (adminDoc) {
      return adminDoc.data().telefone;
    } else {
      throw new Error("Telefone do administrador não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao buscar telefone do administrador:", error);
    return "+5561999999999"; // Telefone padrão de fallback
  }
};


export async function registerConsumerUser(
  email: string,
  senha: string,
  nome: string,
  telefone: string,
  preferenciaEmail: boolean,
  preferenciaWhatsapp: boolean
) {
   // Cria o usuário no Firebase Auth
   const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
   const uid = userCredential.user.uid;
 
   // Cria o documento com ID = uid na coleção 'usuariosConsumidor'
   await setDoc(doc(db, "usuariosConsumidor", uid), {
     email,
     senha,  // cuidado: recomenda-se nunca salvar a senha em texto puro
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