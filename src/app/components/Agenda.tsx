// src/app/components/Agenda.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Servico } from "../services/firestoreService";
import { getAdminPhoneNumber } from "../services/firestoreService";
import { generateDailySlots, Slot } from "../services/slotGenerator";
import styles from "./styles/scheduling.module.css";
import { useUser } from "../context/UserContext";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export interface SalonBookingProps {
  servicos: Servico[];
  storeId?: string;
}

const SalonBooking: React.FC<SalonBookingProps> = ({ servicos, storeId: propStoreId }) => {
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [stores, setStores] = useState<Array<{ id: string; name: string; calendarId: string; address: string }>>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(propStoreId || "");
  const [storeServicesList, setStoreServicesList] = useState<string[]>([]);

  const { user } = useUser();

  useEffect(() => {
    async function fetchStores() {
      try {
        const snap = await getDocs(collection(db, "stores"));
        const storeList = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as { name: string; calendarId: string; address: string }),
        }));
        setStores(storeList);
      } catch (error) {
        console.error("Erro ao buscar lojas:", error);
      }
    }
    fetchStores();
  }, []);

  useEffect(() => {
    async function fetchLoggedUserPhone() {
      if (user?.email) {
        try {
          const qRef = query(collection(db, "usuariosConsumidor"), where("email", "==", user.email));
          const snap = await getDocs(qRef);
          if (!snap.empty) {
            const docData = snap.docs[0].data();
            if (docData.telefone) {
              setCustomerPhone(docData.telefone);
            }
          }
        } catch (err) {
          console.error("Erro ao buscar telefone do usuário logado:", err);
        }
      }
    }
    fetchLoggedUserPhone();
  }, [user]);

  useEffect(() => {
    if (!selectedStoreId) {
      setStoreServicesList([]);
      return;
    }
    async function fetchStoreServices() {
      try {
        const qRef = query(collection(db, "storeServices"), where("storeId", "==", selectedStoreId));
        const snap = await getDocs(qRef);
        const relations = snap.docs.map((doc) => doc.data() as { serviceId: string });
        setStoreServicesList(relations.map((r) => r.serviceId));
      } catch (error) {
        console.error("Erro ao buscar storeServices:", error);
      }
    }
    fetchStoreServices();
  }, [selectedStoreId]);

  const refreshSlots = async () => {
    if (!date || !selectedStoreId) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }
    setLoadingSlots(true);
    try {
      const generatedSlots = await generateDailySlots(date, selectedStoreId);
      setSlots(generatedSlots);
    } catch (error) {
      console.error("Erro ao gerar slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    refreshSlots();
  }, [date, selectedStoreId]);

  const handleBooking = async () => {
    if (!date || !selectedSlot || !customerName || !selectedServiceId || !selectedStoreId) {
      alert("Preencha todos os campos obrigatórios, selecione um horário e uma loja!");
      return;
    }
    if (!user && (!customerEmail || !customerPhone)) {
      alert("Preencha os campos de Email e WhatsApp.");
      return;
    }

    setBookingLoading(true);
    try {
      const servicoSelecionado = servicos.find((s) => s.id === selectedServiceId);
      if (!servicoSelecionado) throw new Error("Serviço não encontrado.");

      const slotHour = selectedSlot.start.getHours().toString().padStart(2, "0");
      const slotMinute = selectedSlot.start.getMinutes().toString().padStart(2, "0");
      const timeStr = `${slotHour}:${slotMinute}`;

      const selectedStore = stores.find((store) => store.id === selectedStoreId);
      const storeAddress = selectedStore?.address || "Endereço não definido";

      const adminPhone = await getAdminPhoneNumber();

      const calendarBody = {
        date,
        time: timeStr,
        clientName: customerName,
        clientEmail: user ? user.email : customerEmail,
        clientPhone: customerPhone,
        serviceName: servicoSelecionado.nome,
        serviceDuration: servicoSelecionado.tempo,
        serviceDescription: servicoSelecionado.descricao,
        storeId: selectedStoreId,
      };

      const response = await fetch("/api/google-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calendarBody),
      });

      const resData = await response.json();
      if (!resData.success) throw new Error(resData.error);

      const msg = `Novo agendamento!
Cliente: ${customerName}
Serviço: ${servicoSelecionado.nome}
Data: ${date}
Hora: ${timeStr}
Loja: ${selectedStore?.name}
Endereço: ${storeAddress}
Email: ${user ? user.email : customerEmail}
Telefone: ${customerPhone}`;

      const encodedMsg = encodeURIComponent(msg);
      const whatsappURL = `https://wa.me/${adminPhone}?text=${encodedMsg}`;
      window.open(whatsappURL, "_blank");

      const emailToSend = user ? user.email : customerEmail;
      if (emailToSend) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailToSend,
            clientName: customerName,
            date,
            time: timeStr,
            service: servicoSelecionado.nome,
            location: storeAddress,
            adminPhone,
          }),
        });
      }

      // ✅ Salvar agendamento no Firestore
      await addDoc(collection(db, "agendamentos"), {
        userId: user ? user.uid : null,
        userEmail: user ? user.email : customerEmail,
        customerName,
        customerPhone,
        serviceId: selectedServiceId,
        serviceName: servicoSelecionado.nome,
        serviceDuration: servicoSelecionado.tempo,
        storeId: selectedStoreId,
        storeName: selectedStore?.name || "",
        storeAddress,
        date,
        time: timeStr,
        createdAt: new Date(),
      });

      await refreshSlots();

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
          <Input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full" />
        </div>

        <div className="mb-4">
          <Label className="block mb-2">Loja</Label>
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          >
            <option value="">Selecione uma loja...</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
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
              <p className={styles.noSlots}>Carregando horários...</p>
            ) : slots.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {slots.map((slot, index) => {
                  const slotHour = slot.start.getHours().toString().padStart(2, "0");
                  const slotMinute = slot.start.getMinutes().toString().padStart(2, "0");
                  const slotTimeStr = `${slotHour}:${slotMinute}`;
                  const isSelected = selectedSlot && selectedSlot.start.getTime() === slot.start.getTime();

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
                        border: isSelected ? "2px solid #0070f3" : "1px solid #ccc",
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
              <p className={styles.noSlots}>Nenhum horário disponível.</p>
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
            {servicos
              .filter((servico) => storeServicesList.includes(servico.id))
              .map((servico) => (
                <option key={servico.id} value={servico.id}>
                  {servico.nome} - {servico.tempo}min - R${servico.preco}
                </option>
              ))}
          </select>
        </div>

        {!user ? (
          <div className="mb-4">
            <Label className="block mb-2">Email do Cliente</Label>
            <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full" />
          </div>
        ) : (
          <div className="mb-4">
            <Label className="block mb-2">Email do Cliente</Label>
            <Input type="email" value={user.email} readOnly className="w-full" />
          </div>
        )}

        <div className="mb-4">
          <Label className="block mb-2">WhatsApp do Cliente</Label>
          <Input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full" />
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
