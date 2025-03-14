import { db } from "../config/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Função para criar um agendamento
export const criarAgendamento = async (agendamento) => {
  try {
    // Log para verificação
    console.log("Tentando criar agendamento:", agendamento);
    await addDoc(collection(db, "agendamentos"), agendamento);
    console.log("Agendamento criado com sucesso!");
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
  }
};

// Função para obter os horários disponíveis
export const obterHorariosDisponiveis = async (horariosPadrao) => {
  try {
    const q = query(collection(db, "agendamentos"));
    const querySnapshot = await getDocs(q);
    
    const horariosOcupados = querySnapshot.docs.map(doc => doc.data().horario);
    return horariosPadrao.filter(hora => !horariosOcupados.includes(hora));
  } catch (error) {
    console.error("Erro ao obter horários disponíveis:", error);
    return horariosPadrao; // Retorna os horários padrões caso haja erro
  }
};

// Função para obter todos os agendamentos
export async function obterAgendamentos() {
  const snapshot = await firestore.collection("agendamentos").get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(), // 🔹 Verifique se todos os campos existem no banco de dados!
  }));
}