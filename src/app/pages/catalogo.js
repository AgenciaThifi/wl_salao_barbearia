"use client";
import { useState, useEffect } from "react";
import ServiceCard from "../components/ServiceCard"; // Importando o componente do card

function Catalogo({ servicos }) { // Recebendo a propriedade servicos
  return (
    <div>
      <h1>Catálogo de Serviços</h1>
      <div>
        {servicos.map((servico) => (
          <ServiceCard key={servico.id} servico={servico} />
        ))}
      </div>
    </div>
  );
}

export default Catalogo;
