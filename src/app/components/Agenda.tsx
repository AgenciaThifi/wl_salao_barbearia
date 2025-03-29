import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { sendWhatsAppMessage } from "./WhatsAppBot";
import { fetchAvailableSlots } from "./fetchAvailableSlots";

const SalonBooking: React.FC = () => {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Estado para bloquear o botão

  useEffect(() => {
    const fetchSlots = async () => {
      const token = process.env.NEXT_PUBLIC_API_TOKEN;
 // Substitua pelo token real

      if (token) {
        await fetchAvailableSlots(token, setAvailableSlots);
      } else {
        console.error("Token não disponível para buscar horários.");
      }
    };

    fetchSlots();
  }, []);

  const handleBooking = async () => {
    if (!date || !time || !customerName || !customerPhone) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true); // Desativa o botão enquanto processa

    try {
      // Chama a API do Google Calendar
      const response = await fetch("/api/google-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, clientName: customerName }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Envia mensagem para o WhatsApp
      await sendWhatsAppMessage(customerName, customerPhone, date, time);

      alert("Agendamento confirmado!");
    } catch (error) {
      console.error("Erro ao processar agendamento:", error);
      alert("Erro ao confirmar agendamento.");
    } finally {
      setLoading(false); // Reativa o botão após finalizar
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Agendar Horário</h2>

        <div className="mb-4">
          <Label className="block mb-2">Nome</Label>
          <Input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">Hora</Label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">WhatsApp do Cliente</Label>
          <Input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <Button
          className={`w-full p-2 rounded ${loading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600 text-white"}`}
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
