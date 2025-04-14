"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import CarrosselTime from "@/app/admin/CarrosselTime";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../stores.module.css";

export default function EditStorePage() {
  const { storeId } = useParams();
  const router = useRouter();

  // Se storeId não estiver definido, podemos exibir uma mensagem ou redirecionar:
  if (!storeId) {
    return <div>Loja não identificada.</div>;
  }

  const [storeData, setStoreData] = useState<any>({
    name: "",
    address: "",
    phone: "",
    // Novo campo para Calendar ID
    calendarId: "",
    storeOpen: "08:00",
    storeClose: "22:00",
    lunchStart: "12:00",
    lunchEnd: "13:00",
    timeInterval: 30,
    displayPeriod: 30,
    nonWorkingDays: [],
  });
  const [newNonWorkingDay, setNewNonWorkingDay] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStore() {
      try {
        const storeDocRef = doc(db, "stores", storeId);
        const snap = await getDoc(storeDocRef);
        if (snap.exists()) {
          setStoreData(snap.data());
        }
      } catch (error) {
        console.error("Erro ao buscar dados da loja:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStore();
  }, [storeId]);

  const updateField = (field: string, value: any) => {
    setStoreData((prev: any) => ({ ...prev, [field]: value }));
  };

  const updateTimeField = (field: string, hour: number, minute: number) => {
    const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    updateField(field, timeStr);
  };

  const handleAddNonWorkingDay = () => {
    if (newNonWorkingDay) {
      const dayStr = newNonWorkingDay.toISOString().split("T")[0];
      if (!storeData.nonWorkingDays.includes(dayStr)) {
        updateField("nonWorkingDays", [...storeData.nonWorkingDays, dayStr]);
      }
      setNewNonWorkingDay(null);
    }
  };

  const handleRemoveNonWorkingDay = (day: string) => {
    updateField("nonWorkingDays", storeData.nonWorkingDays.filter((d: string) => d !== day));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "stores", storeId), {
        ...storeData,
        updatedAt: Timestamp.now(),
      }, { merge: true });
      alert("Configurações salvas com sucesso!");
      router.back();
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações.");
    }
    setSaving(false);
  };

  if (loading) return <p>Carregando loja...</p>;

  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return { hour: h || 0, minute: m || 0 };
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>← Voltar</button>
      <h1 className={styles.title}>Editando Loja: {storeData.name}</h1>

      <div className={styles.section}>
        <label className={styles.label}>Nome da Loja:</label>
        <input
          type="text"
          className={styles.textInput}
          value={storeData.name || ""}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Nome da loja"
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Endereço:</label>
        <input
          type="text"
          className={styles.textInput}
          value={storeData.address || ""}
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="Endereço da loja"
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Telefone:</label>
        <input
          type="text"
          className={styles.textInput}
          value={storeData.phone || ""}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="Telefone da loja"
        />
      </div>

      {/* Novo Campo: ID do Calendar */}
      <div className={styles.section}>
        <label className={styles.label}>ID do Calendar</label>
        <input
          type="text"
          className={styles.textInput}
          value={storeData.calendarId || ""}
          onChange={(e) => updateField("calendarId", e.target.value)}
          placeholder="Ex.: abcdef123456@group.calendar.google.com"
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Horário de Abertura:</label>
        <CarrosselTime
          selectedHour={parseTime(storeData.storeOpen).hour}
          selectedMinute={parseTime(storeData.storeOpen).minute}
          onChange={(hour, minute) => updateTimeField("storeOpen", hour, minute)}
        />
      </div>
      <div className={styles.section}>
        <label className={styles.label}>Horário de Fechamento:</label>
        <CarrosselTime
          selectedHour={parseTime(storeData.storeClose).hour}
          selectedMinute={parseTime(storeData.storeClose).minute}
          onChange={(hour, minute) => updateTimeField("storeClose", hour, minute)}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Horário de Almoço - Início:</label>
        <CarrosselTime
          selectedHour={parseTime(storeData.lunchStart).hour}
          selectedMinute={parseTime(storeData.lunchStart).minute}
          onChange={(hour, minute) => updateTimeField("lunchStart", hour, minute)}
        />
      </div>
      <div className={styles.section}>
        <label className={styles.label}>Horário de Almoço - Término:</label>
        <CarrosselTime
          selectedHour={parseTime(storeData.lunchEnd).hour}
          selectedMinute={parseTime(storeData.lunchEnd).minute}
          onChange={(hour, minute) => updateTimeField("lunchEnd", hour, minute)}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Intervalo (minutos):</label>
        <select
          className={styles.textInput}
          value={storeData.timeInterval || 30}
          onChange={(e) => updateField("timeInterval", parseInt(e.target.value, 10))}
        >
          <option value={10}>10 min</option>
          <option value={15}>15 min</option>
          <option value={20}>20 min</option>
          <option value={25}>25 min</option>
          <option value={30}>30 min</option>
          <option value={35}>35 min</option>
          <option value={40}>40 min</option>
          <option value={45}>45 min</option>
          <option value={50}>50 min</option>
          <option value={55}>55 min</option>
          <option value={60}>60 min</option>
        </select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Período de Exibição (dias):</label>
        <select
          className={styles.textInput}
          value={storeData.displayPeriod || 30}
          onChange={(e) => updateField("displayPeriod", parseInt(e.target.value, 10))}
        >
          <option value={7}>1 semana</option>
          <option value={14}>2 semanas</option>
          <option value={30}>1 mês</option>
          <option value={60}>2 meses</option>
          <option value={90}>3 meses</option>
        </select>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Adicionar Dia Indisponível:</label>
        <div className={styles.flexRow}>
          <DatePicker
            selected={newNonWorkingDay}
            onChange={(date: Date | null) => setNewNonWorkingDay(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Selecione uma data"
            className={styles.datePicker}
          />
          <button className={styles.addButton} onClick={handleAddNonWorkingDay}>
            Adicionar
          </button>
        </div>
        <div className={styles.daysContainer}>
          {storeData.nonWorkingDays &&
            storeData.nonWorkingDays.map((day: string) => (
              <div key={day} className={styles.dayCard}>
                <span>{day}</span>
                <button
                  className={styles.removeDayButton}
                  onClick={() => handleRemoveNonWorkingDay(day)}
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      </div>

      <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
        {saving ? "Salvando..." : "Salvar Configurações"}
      </button>
    </div>
  );
}
