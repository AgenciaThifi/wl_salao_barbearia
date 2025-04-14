"use client";

import React from "react";
import SalonBooking from "@/app/components/Agenda";
import { useSearchParams } from "next/navigation";

export default function AgendamentoPage() {
  // Obtém o storeId da query string; se não existir, passa undefined
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") || undefined;

  return (
    <div style={{ padding: "2rem", backgroundColor: "#f0f0f0", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem", color: "#333" }}>
        Agendamento
      </h1>
      {/* Renderiza o componente de agendamento, passando apenas storeId */}
      <SalonBooking storeId={storeId} />
    </div>
  );
}
