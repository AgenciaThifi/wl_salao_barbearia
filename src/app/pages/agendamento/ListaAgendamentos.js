"use client";
import { useState, useEffect } from "react";

export default function ListaAgendamentos({ agendamentos }) {  
  return (
    <div>
      <h2>Agendamentos</h2>
      {agendamentos.map((agendamento, index) => (
        <p key={index}>{agendamento.nome} - {agendamento.telefone} - {agendamento.horario}</p>
      ))}
    </div>
  );
}
