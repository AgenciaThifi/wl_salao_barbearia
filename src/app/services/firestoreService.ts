import { db } from "../config/firebase";
import { collection, addDoc, getDocs, query } from "firebase/firestore"; //Para Agendamentos
import { deleteDoc, doc } from "firebase/firestore"; //Para catálogo de serviços
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; //Para Galeria de Imagens


/* ÁREA DE AGENDAMENTO DE HORÁRIOSs */

export interface Agendamento {
  id: string;
  nome: string;
  telefone: string;
  horario: string;
}

// Função para criar um agendamento
export const criarAgendamento = async (agendamento: Omit<Agendamento, "id">) => {
  try {
    await addDoc(collection(db, "agendamentos"), agendamento);
    console.log("Agendamento criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
  }
};


// Função para obter os horários disponíveis
export const obterHorariosDisponiveis = async (horariosPadrao: string[]): Promise<string[]> => {
  try {
    const q = query(collection(db, "agendamentos"));
    const querySnapshot = await getDocs(q);

    const horariosOcupados: string[] = querySnapshot.docs.map(doc => doc.data().horario as string);
    return horariosPadrao.filter((hora: string) => !horariosOcupados.includes(hora));
  } catch (error) {
    console.error("Erro ao obter horários disponíveis:", error);
    return horariosPadrao; // Retorna os horários padrões caso haja erro
  }
};


// Função para obter todos os agendamentos
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

// Função para adicionar um novo serviço
export const adicionarServico = async (servico: Omit<Servico, "id">) => {
  try {
    const docRef = await addDoc(collection(db, "servicos"), servico);
    console.log("Serviço adicionado com sucesso!", docRef.id);
  } catch (error) {
    console.error("Erro ao adicionar serviço:", error);
  }
};

// Função para excluir um serviço
export const excluirServico = async (id: string) => {
  try {
    await deleteDoc(doc(db, "servicos", id));
    console.log("Serviço excluído com sucesso!");
  } catch (error) {
    console.error("Erro ao excluir serviço:", error);
  }
};

// Função para obter todos os serviços
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



/* ÁREA DE GALERIA DE IMAGENS */

// Definindo a interface para a imagem
export interface Imagem {
  id: string;
  titulo: string;
  descricao: string;
  url: string;
}

// Função para fazer upload da imagem
export const uploadImagem = async (file: File, titulo: string, descricao: string) => {
  const storage = getStorage();
  const storageRef = ref(storage, `galeria/${file.name}`);

  try {
    // Fazendo o upload da imagem para o Firebase Storage
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef); // Pegando a URL da imagem

    // Salvando os dados no Firestore
    await addDoc(collection(db, "galeria"), {
      titulo,
      descricao,
      url,
    });
    console.log("Imagem carregada e salva com sucesso!");
  } catch (error) {
    console.error("Erro ao carregar imagem:", error);
  }
};

// Função para obter as imagens da galeria do Firestore
export const obterGaleria = async (): Promise<Imagem[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "galeria"));
    const galeria = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Imagem[];  // Assegurando que o tipo de retorno é um array de Imagem
    return galeria;
  } catch (error) {
    console.error("Erro ao obter galeria:", error);
    return [];
  }
};
