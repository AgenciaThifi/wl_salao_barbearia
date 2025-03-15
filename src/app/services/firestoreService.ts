import { db } from "../config/firebase";
import { collection, addDoc, getDocs, query } from "firebase/firestore"; //Para Agendamentos
import { deleteDoc, doc } from "firebase/firestore"; //Para catálogo de serviços

/* ÁREA DE AGENDAMENTO DE HORÁRIOS */

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