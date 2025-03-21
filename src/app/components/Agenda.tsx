import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { sendWhatsAppMessage } from "./WhatsAppBot";
import { addEventToGoogleCalendar } from "./GoogleCalendarService";
import { fetchAvailableSlots } from "./fetchAvailableSlots"; // Substitua pelo caminho correto

const SalonBooking: React.FC = () => {
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);

  useEffect(() => {
    const fetchSlots = async () => {
      const token = "SEU_TOKEN_AQUI"; // Substitua pelo token real

      if (token) {
        await fetchAvailableSlots(token, setAvailableSlots);
      } else {
        console.error("Token não disponível para buscar horários.");
      }
    };

    fetchSlots();
  }, []);

  const handleBooking = async () => {
    if (!date || !time || !customerPhone) {
      alert("Preencha todos os campos!");
      return;
    }
  
    const clientName = "Cliente"; // Adapte para coletar o nome do cliente
    const booking = { date, time };
  
    try {
      // Adiciona ao Google Calendar
      const event = await addEventToGoogleCalendar(date, time, clientName);
      if (!event) {
        alert("Erro ao agendar no Google Calendar.");
        return;
      }
  
      // Envia mensagem para o WhatsApp (admin e cliente)
      await sendWhatsAppMessage(clientName, customerPhone, date, time);
  
      alert("Agendamento confirmado!");
    } catch (error) {
      console.error("Erro ao processar agendamento:", error);
      alert("Erro ao confirmar agendamento.");
    }
  };
  

  return (
    <Card className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Agendar Horário</h2>

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

        <Button className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600" onClick={handleBooking}>
          Confirmar Agendamento
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
