"use client";

import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Servico } from "../services/firestoreService";
import { getAdminPhoneNumber } from "../services/firestoreService";
import { generateDailySlots, Slot } from "../services/slotGenerator";

interface SalonBookingProps {
  servicos: Servico[];
}

const SalonBooking: React.FC<SalonBookingProps> = ({ servicos }) => {
  // Estados para agendamento
  const [date, setDate] = useState<string>(""); // Formato "YYYY-MM-DD"
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Quando a data muda, gera os slots para o dia selecionado
  useEffect(() => {
    async function fetchSlots() {
      if (!date) {
        setSlots([]);
        setSelectedSlot(null);
        return;
      }
      setLoadingSlots(true);
      try {
        // Gera os slots usando a data (formato "YYYY-MM-DD")
        const generatedSlots = await generateDailySlots(date);
        setSlots(generatedSlots);
      } catch (error) {
        console.error("Erro ao gerar slots:", error);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [date]);

  // Função para confirmar agendamento
  const handleBooking = async () => {
    if (!date || !selectedSlot || !customerName || !customerPhone || !selectedServiceId) {
      alert("Preencha todos os campos e selecione um horário!");
      return;
    }
    setBookingLoading(true);
    try {
      const servicoSelecionado = servicos.find((s) => s.id === selectedServiceId);
      if (!servicoSelecionado) {
        throw new Error("Serviço não encontrado.");
      }
      const slotHour = selectedSlot.start.getHours().toString().padStart(2, "0");
      const slotMinute = selectedSlot.start.getMinutes().toString().padStart(2, "0");
      const timeStr = `${slotHour}:${slotMinute}`;

      const body = {
        date,         // "YYYY-MM-DD"
        time: timeStr, // "HH:MM"
        clientName: customerName,
        serviceName: servicoSelecionado.nome,
        serviceDuration: servicoSelecionado.tempo,
        serviceDescription: servicoSelecionado.descricao,
      };

      const response = await fetch("/api/google-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const resData = await response.json();
      if (!resData.success) throw new Error(resData.error);

      const adminPhone = await getAdminPhoneNumber();
      const msg = `Novo agendamento!\nCliente: ${customerName}\nServiço: ${servicoSelecionado.nome}\nData: ${date}\nHora: ${timeStr}`;
      const encodedMsg = encodeURIComponent(msg);
      const whatsappURL = `https://wa.me/${adminPhone}?text=${encodedMsg}`;
      window.open(whatsappURL, "_blank");

      alert("Agendamento confirmado!");
    } catch (error) {
      console.error("Erro ao processar agendamento:", error);
      alert("Erro ao confirmar agendamento.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Agendar Horário</h2>
        
        <div className="mb-4">
          <Label className="block mb-2">Nome</Label>
          <Input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <Label className="block mb-2">Data</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedSlot(null);
            }}
            className="w-full"
          />
        </div>
        
        {date && (
          <div className="mb-4">
            <Label className="block mb-2">Horários Disponíveis:</Label>
            {loadingSlots ? (
              <p>Carregando horários...</p>
            ) : slots.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {slots.map((slot, index) => {
                  const slotHour = slot.start.getHours().toString().padStart(2, "0");
                  const slotMinute = slot.start.getMinutes().toString().padStart(2, "0");
                  const slotTimeStr = `${slotHour}:${slotMinute}`;
                  const isSelected =
                    selectedSlot && selectedSlot.start.getTime() === slot.start.getTime();
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (slot.available) setSelectedSlot(slot);
                      }}
                      disabled={!slot.available}
                      style={{
                        padding: "0.5rem 0.75rem",
                        borderRadius: "4px",
                        border: isSelected
                          ? "2px solid #0070f3"
                          : "1px solid #ccc",
                        backgroundColor: slot.available ? "#fff" : "#f0f0f0",
                        color: "#333",
                        cursor: slot.available ? "pointer" : "not-allowed",
                      }}
                    >
                      {slotTimeStr}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p>Nenhum horário disponível.</p>
            )}
          </div>
        )}
        
        <div className="mb-4">
          <Label className="block mb-2">Serviço</Label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          >
            <option value="">Selecione um serviço...</option>
            {servicos.map((servico) => (
              <option key={servico.id} value={servico.id}>
                {servico.nome} - {servico.tempo}min - R${servico.preco}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <Label className="block mb-2">WhatsApp do Cliente</Label>
          <Input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Button
          onClick={handleBooking}
          disabled={bookingLoading}
          className={`w-full ${bookingLoading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600 text-white"}`}
        >
          {bookingLoading ? "Agendando..." : "Confirmar Agendamento"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SalonBooking;
