import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { fetchAvailableSlots } from "./fetchAvailableSlots";
import { Servico } from "../services/firestoreService";
import { getAdminPhoneNumber } from "../services/firestoreService";

interface SalonBookingProps {
  servicos: Servico[];
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
      const servicoSelecionado = servicos.find(s => s.id === selectedServiceId);
      if (!servicoSelecionado) throw new Error("Serviço não encontrado.");

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

      const adminPhone = await getAdminPhoneNumber();
      const msg = `Novo agendamento!\nCliente: ${customerName}\nServiço: ${servicoSelecionado.nome}\nData: ${date}\nHora: ${time}`;
      const encodedMsg = encodeURIComponent(msg);
      const whatsappURL = `https://wa.me/${adminPhone}?text=${encodedMsg}`;

      window.open(whatsappURL, "_blank");

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
          <Input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full" />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full" />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">Hora</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full" />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">Serviço</Label>
          <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white">
            <option value="">Selecione um serviço...</option>
            {servicos.map(servico => (
              <option key={servico.id} value={servico.id}>
                {servico.nome} - {servico.tempo}min - R${servico.preco}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <Label className="block mb-2">WhatsApp do Cliente</Label>
          <Input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full" />
        </div>

        <Button onClick={handleBooking} disabled={loading} className={`w-full ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600 text-white"}`}>
          {loading ? "Agendando..." : "Confirmar Agendamento"}
        </Button>

        <h3 className="text-lg font-semibold mt-6">Horários Disponíveis:</h3>
        <ul>
          {availableSlots.length > 0 ? (
            availableSlots.map((slot, index) => (
              <li key={index}>
                {new Date(slot.start).toLocaleTimeString()} - {new Date(slot.end).toLocaleTimeString()}
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
