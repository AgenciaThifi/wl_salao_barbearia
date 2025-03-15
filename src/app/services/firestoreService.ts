import { db } from "../config/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

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