import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { sendWhatsAppMessage } from "./WhatsAppBot";
import { fetchAvailableSlots } from "./fetchAvailableSlots";
import { Servico } from "../services/firestoreService";

interface SalonBookingProps {
  servicos: Servico[]; // Recebe a lista de serviços
}

const SalonBooking: React.FC<SalonBookingProps> = ({ servicos }) => {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>(""); 
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSlots = async () => {
      const token = process.env.NEXT_PUBLIC_API_TOKEN;
      if (token) {
        await fetchAvailableSlots(token, setAvailableSlots);
      } else {
        console.error("Token não disponível para buscar horários.");
      }
    };

    fetchSlots();
  }, []);

  const handleBooking = async () => {
    if (!date || !time || !customerName || !customerPhone || !selectedServiceId) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      // Acha o serviço selecionado (para pegar nome e tempo)
      const servicoSelecionado = servicos.find(s => s.id === selectedServiceId);
      if (!servicoSelecionado) {
        throw new Error("Serviço não encontrado.");
      }

      // Monta o corpo da requisição
      // Vamos incluir o nome do serviço e o tempo na requisição
      const body = {
        date,
        time,
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

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Envia mensagem para o WhatsApp (incluindo nome do serviço se quiser)
      await sendWhatsAppMessage(
        customerName,
        customerPhone,
        date,
        time,
        servicoSelecionado.nome // Passa o nome do serviço para a mensagem
      );

      alert("Agendamento confirmado!");
    } catch (error) {
      console.error("Erro ao processar agendamento:", error);
      alert("Erro ao confirmar agendamento.");
    } finally {
      setLoading(false);
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
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">Data</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">Hora</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* NOVO CAMPO: Serviço */}
        <div className="mb-4">
          <Label className="block mb-2">Serviço</Label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full p-2 border rounded"
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
            className="w-full p-2 border rounded"
          />
        </div>

        <Button
          className={`w-full p-2 rounded ${
            loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600 text-white"
          }`}
          onClick={handleBooking}
          disabled={loading}
        >
          {loading ? "Agendando..." : "Confirmar Agendamento"}
        </Button>

        <h3 className="text-lg font-semibold mt-6">Horários Disponíveis:</h3>
        <ul>
          {availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <li key={index}>
                {new Date(slot.start).toLocaleTimeString()} -{" "}
                {new Date(slot.end).toLocaleTimeString()}
              </li>
            ))
          ) : (
            <p>Nenhum horário disponível.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SalonBooking;
