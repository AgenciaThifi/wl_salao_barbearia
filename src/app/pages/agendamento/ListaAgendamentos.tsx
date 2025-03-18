"use client";
import { Agendamento } from "../../services/firestoreService"; // Importa a tipagem caso esteja separada

type ListaAgendamentosProps = {
  agendamentos: Agendamento[];
};

export default function ListaAgendamentos({ agendamentos }: ListaAgendamentosProps) {  
  return (
    <div>
      <h2>Agendamentos</h2>
      {agendamentos.map((agendamento) => (
        <p key={agendamento.id}>
          {agendamento.nome} - {agendamento.telefone} - {agendamento.horario}
        </p>
      ))}
    </div>
  );
}
