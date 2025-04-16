"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import CarrosselTime from "@/app/admin/CarrosselTime";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../stores.module.css";

export default function NewStore() {
  const router = useRouter();

  // Campos de identificação
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storePhone, setStorePhone] = useState("");

  // Novo campo para o ID do Calendar
  const [calendarId, setCalendarId] = useState("");

  // Horário de funcionamento
  const [storeOpenHour, setStoreOpenHour] = useState(8);
  const [storeOpenMinute, setStoreOpenMinute] = useState(0);
  const [storeCloseHour, setStoreCloseHour] = useState(22);
  const [storeCloseMinute, setStoreCloseMinute] = useState(0);

  // Horário de almoço
  const [lunchHourStart, setLunchHourStart] = useState(12);
  const [lunchMinuteStart, setLunchMinuteStart] = useState(0);
  const [lunchHourEnd, setLunchHourEnd] = useState(13);
  const [lunchMinuteEnd, setLunchMinuteEnd] = useState(0);

  // Outras configurações
  const [timeInterval, setTimeInterval] = useState(30);
  const [displayPeriod, setDisplayPeriod] = useState(30);
  const [nonWorkingDays, setNonWorkingDays] = useState<string[]>([]);
  const [newNonWorkingDay, setNewNonWorkingDay] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  // Campos de redes sociais (opcionais)
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");

  const handleAddNonWorkingDay = () => {
    if (newNonWorkingDay) {
      const dayStr = newNonWorkingDay.toISOString().split("T")[0];
      if (!nonWorkingDays.includes(dayStr)) {
        setNonWorkingDays((prev) => [...prev, dayStr]);
      }
      setNewNonWorkingDay(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storeOpenStr = `${String(storeOpenHour).padStart(2, "0")}:${String(storeOpenMinute).padStart(2, "0")}`;
      const storeCloseStr = `${String(storeCloseHour).padStart(2, "0")}:${String(storeCloseMinute).padStart(2, "0")}`;
      const lunchStartStr = `${String(lunchHourStart).padStart(2, "0")}:${String(lunchMinuteStart).padStart(2, "0")}`;
      const lunchEndStr = `${String(lunchHourEnd).padStart(2, "0")}:${String(lunchMinuteEnd).padStart(2, "0")}`;

      const newStore = {
        name: storeName,
        address: storeAddress,
        phone: storePhone,
        calendarId, // novo campo para identificar o calendário dessa loja
        storeOpen: storeOpenStr,
        storeClose: storeCloseStr,
        lunchStart: lunchStartStr,
        lunchEnd: lunchEndStr,
        timeInterval,
        displayPeriod,
        nonWorkingDays,
        socials: {
          instagram: instagram || null,
          facebook: facebook || null,
          tiktok: tiktok || null,
        },
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, "stores"), newStore);
      alert("Loja criada com sucesso!");
      router.push(`/admin/stores/${docRef.id}`);
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      alert("Erro ao criar loja.");
    }
    setSaving(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Voltar
        </button>
        <h1 className={styles.formTitle}>Nova Loja</h1>

        {/* Campos de Identificação */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Nome da Loja</label>
          <input
            type="text"
            className={styles.formInput}
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Nome da loja"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Endereço</label>
          <input
            type="text"
            className={styles.formInput}
            value={storeAddress}
            onChange={(e) => setStoreAddress(e.target.value)}
            placeholder="Endereço da loja"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Telefone</label>
          <input
            type="text"
            className={styles.formInput}
            value={storePhone}
            onChange={(e) => setStorePhone(e.target.value)}
            placeholder="Telefone da loja"
          />
        </div>

        {/* Novo campo: Calendar ID */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>ID do Calendar</label>
          <input
            type="text"
            className={styles.formInput}
            value={calendarId}
            onChange={(e) => setCalendarId(e.target.value)}
            placeholder="Ex.: abcdef123456@group.calendar.google.com"
          />
        </div>

        {/* Campos de Redes Sociais (opcionais) */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Instagram (opcional)</label>
          <input
            type="text"
            className={styles.formInput}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="URL do Instagram"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Facebook (opcional)</label>
          <input
            type="text"
            className={styles.formInput}
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="URL do Facebook"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>TikTok (opcional)</label>
          <input
            type="text"
            className={styles.formInput}
            value={tiktok}
            onChange={(e) => setTiktok(e.target.value)}
            placeholder="URL do TikTok"
          />
        </div>

        {/* Campos de Horário de Funcionamento */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Horário de Abertura</label>
          <CarrosselTime
            selectedHour={storeOpenHour}
            selectedMinute={storeOpenMinute}
            onChange={(hour, minute) => {
              setStoreOpenHour(hour);
              setStoreOpenMinute(minute);
            }}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Horário de Fechamento</label>
          <CarrosselTime
            selectedHour={storeCloseHour}
            selectedMinute={storeCloseMinute}
            onChange={(hour, minute) => {
              setStoreCloseHour(hour);
              setStoreCloseMinute(minute);
            }}
          />
        </div>

        {/* Horário de Almoço */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Horário de Almoço - Início</label>
          <CarrosselTime
            selectedHour={lunchHourStart}
            selectedMinute={lunchMinuteStart}
            onChange={(hour, minute) => {
              setLunchHourStart(hour);
              setLunchMinuteStart(minute);
            }}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Horário de Almoço - Término</label>
          <CarrosselTime
            selectedHour={lunchHourEnd}
            selectedMinute={lunchMinuteEnd}
            onChange={(hour, minute) => {
              setLunchHourEnd(hour);
              setLunchMinuteEnd(minute);
            }}
          />
        </div>

        {/* Outros campos */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Intervalo (minutos)</label>
          <select
            className={styles.formInput}
            value={timeInterval}
            onChange={(e) => setTimeInterval(parseInt(e.target.value, 10))}
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

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Período de Exibição (dias)</label>
          <select
            className={styles.formInput}
            value={displayPeriod}
            onChange={(e) => setDisplayPeriod(parseInt(e.target.value, 10))}
          >
            <option value={7}>1 semana</option>
            <option value={14}>2 semanas</option>
            <option value={30}>1 mês</option>
            <option value={60}>2 meses</option>
            <option value={90}>3 meses</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Adicionar Dia Indisponível</label>
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
            {nonWorkingDays.map((day) => (
              <div key={day} className={styles.dayCard}>
                <span>{day}</span>
                <button className={styles.removeDayButton} onClick={() => {
                  setNonWorkingDays((prev) => prev.filter((d) => d !== day));
                }}>
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
    </div>
  );
}
