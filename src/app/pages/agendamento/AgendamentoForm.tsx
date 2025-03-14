"use client";
import { useState, useEffect } from "react";
import { criarAgendamento, obterHorariosDisponiveis } from "../../services/firestoreService";

const horariosPadrao = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

type Agendamento = {
  id: string;
  nome: string;
  telefone: string;
  horario: string;
};

type AgendamentoFormProps = {
  setAgendamentos: React.Dispatch<React.SetStateAction<Agendamento[]>>;
};

export default function AgendamentoForm({ setAgendamentos }: AgendamentoFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [horario, setHorario] = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    async function carregarHorarios() {
      const horarios = await obterHorariosDisponiveis(horariosPadrao);
      console.log("Horários carregados:", horarios);
      setHorariosDisponiveis(horarios);
    }
    carregarHorarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!nome || !telefone || !horario) return;
  
    const novoAgendamento: Agendamento = {
      id: crypto.randomUUID(),
      nome,
      telefone,
      horario,
    };

    setAgendamentos((prev: Agendamento[]) => [...prev, novoAgendamento]);

    console.log("Agendamento realizado:", novoAgendamento);
  
    // Limpar os campos após agendar
    setNome("");
    setTelefone("");
    setHorario("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl mb-4">Agendar Horário</h2>

      <label className="block mb-2">Nome:</label>
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <label className="block mt-2 mb-2">Telefone:</label>
      <input
        type="tel"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <label className="block mt-2 mb-2">Horário Disponível:</label>
      <select
        value={horario}
        onChange={(e) => {
          console.log("Novo horário selecionado:", e.target.value);
          setHorario(e.target.value);
        }}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione um horário</option>
        {horariosDisponiveis.map((hora, index) => (
          <option key={index} value={hora}>{hora}</option>
        ))}
      </select>

      <button
        type="submit"
        className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
      >
        Agendar
      </button>
    </form>
  );
}