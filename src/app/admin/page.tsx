"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/app/config/firebase";
import { useUser } from "@/app/context/UserContext";
import CarrosselTime from "@/app/admin/CarrosselTime"; // Componente de seleção de hora e minuto
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./styles/admimConfig.module.css";

export default function AdminConfigPage() {
  const { role, loading } = useUser();
  const router = useRouter();

  // Redireciona se o usuário não for admin
  useEffect(() => {
    if (!loading && role !== "admin") {
      router.push("/");
    }
  }, [loading, role, router]);

  // ===== Horário de Almoço =====
  const [lunchHourStart, setLunchHourStart] = useState(12);
  const [lunchMinuteStart, setLunchMinuteStart] = useState(0);
  const [lunchHourEnd, setLunchHourEnd] = useState(13);
  const [lunchMinuteEnd, setLunchMinuteEnd] = useState(0);

  // ===== Horário de Funcionamento da Loja =====
  const [storeOpenHour, setStoreOpenHour] = useState(8);
  const [storeOpenMinute, setStoreOpenMinute] = useState(0);
  const [storeCloseHour, setStoreCloseHour] = useState(22);
  const [storeCloseMinute, setStoreCloseMinute] = useState(0);

  // ===== Outras Configurações =====
  const [timeInterval, setTimeInterval] = useState(30);
  const [displayPeriod, setDisplayPeriod] = useState(30);
  const [nonWorkingDaysArr, setNonWorkingDaysArr] = useState<string[]>([]);
  const [newNonWorkingDay, setNewNonWorkingDay] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  // Carrega a configuração atual do Firestore
  useEffect(() => {
    async function fetchConfig() {
      try {
        const configDocRef = doc(db, "config", "lunchBreak");
        const docSnap = await getDoc(configDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Horário de almoço
          if (data.lunchStart) {
            const [h, m] = data.lunchStart.split(":");
            setLunchHourStart(parseInt(h, 10) || 12);
            setLunchMinuteStart(parseInt(m, 10) || 0);
          }
          if (data.lunchEnd) {
            const [h, m] = data.lunchEnd.split(":");
            setLunchHourEnd(parseInt(h, 10) || 13);
            setLunchMinuteEnd(parseInt(m, 10) || 0);
          }
          // Horário de funcionamento da loja
          if (data.storeOpen) {
            const [h, m] = data.storeOpen.split(":");
            setStoreOpenHour(parseInt(h, 10) || 8);
            setStoreOpenMinute(parseInt(m, 10) || 0);
          }
          if (data.storeClose) {
            const [h, m] = data.storeClose.split(":");
            setStoreCloseHour(parseInt(h, 10) || 22);
            setStoreCloseMinute(parseInt(m, 10) || 0);
          }
          // Intervalo e período
          if (data.timeInterval !== undefined) {
            setTimeInterval(data.timeInterval);
          }
          if (data.displayPeriod !== undefined) {
            setDisplayPeriod(data.displayPeriod);
          }
          // Dias indisponíveis
          if (data.nonWorkingDays) {
            setNonWorkingDaysArr(data.nonWorkingDays);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    }
    fetchConfig();
  }, []);

  // Função para adicionar novo dia indisponível
  const handleAddNonWorkingDay = () => {
    if (newNonWorkingDay) {
      const dateStr = newNonWorkingDay.toISOString().split("T")[0];
      if (!nonWorkingDaysArr.includes(dateStr)) {
        setNonWorkingDaysArr((prev) => [...prev, dateStr]);
      }
      setNewNonWorkingDay(null);
    }
  };

  // Remove um dia da lista de indisponíveis
  const handleRemoveNonWorkingDay = (day: string) => {
    setNonWorkingDaysArr((prev) => prev.filter((d) => d !== day));
  };

  // Função para salvar as configurações no Firestore
  const handleSave = async () => {
    setSaving(true);
    try {
      // Formata as horas para strings "HH:MM"
      const lunchStartStr = `${String(lunchHourStart).padStart(2, "0")}:${String(lunchMinuteStart).padStart(2, "0")}`;
      const lunchEndStr = `${String(lunchHourEnd).padStart(2, "0")}:${String(lunchMinuteEnd).padStart(2, "0")}`;
      const storeOpenStr = `${String(storeOpenHour).padStart(2, "0")}:${String(storeOpenMinute).padStart(2, "0")}`;
      const storeCloseStr = `${String(storeCloseHour).padStart(2, "0")}:${String(storeCloseMinute).padStart(2, "0")}`;

      await setDoc(doc(db, "config", "lunchBreak"), {
        lunchStart: lunchStartStr,
        lunchEnd: lunchEndStr,
        storeOpen: storeOpenStr,
        storeClose: storeCloseStr,
        timeInterval,
        displayPeriod,
        nonWorkingDays: nonWorkingDaysArr,
        updatedAt: Timestamp.now(),
      });
      alert("Configurações salvas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações.");
    }
    setSaving(false);
  };

  if (loading) return <p className={styles.loading}>Carregando configurações...</p>;

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => router.back()}>
        ← Voltar
      </button>

      <h1 className={styles.title}>Painel Administrativo</h1>

      {/* Horário de Funcionamento da Loja */}
      <div className={styles.section}>
        <label className={styles.label}>Horário de Abertura da Loja:</label>
        <CarrosselTime
          selectedHour={storeOpenHour}
          selectedMinute={storeOpenMinute}
          onChange={(hour, minute) => {
            setStoreOpenHour(hour);
            setStoreOpenMinute(minute);
          }}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Horário de Fechamento da Loja:</label>
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
      <div className={styles.section}>
        <label className={styles.label}>Horário de Almoço - Início:</label>
        <CarrosselTime
          selectedHour={lunchHourStart}
          selectedMinute={lunchMinuteStart}
          onChange={(hour, minute) => {
            setLunchHourStart(hour);
            setLunchMinuteStart(minute);
          }}
        />
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Horário de Almoço - Término:</label>
        <CarrosselTime
          selectedHour={lunchHourEnd}
          selectedMinute={lunchMinuteEnd}
          onChange={(hour, minute) => {
            setLunchHourEnd(hour);
            setLunchMinuteEnd(minute);
          }}
        />
      </div>

      {/* Intervalo de Horários */}
      <div className={styles.section}>
        <label className={styles.label}>Intervalo de Horários (minutos):</label>
        <select
          className={styles.textInput}
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

      {/* Período de Exibição */}
      <div className={styles.section}>
        <label className={styles.label}>Período de Exibição dos Horários (em dias):</label>
        <select
          className={styles.textInput}
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

      {/* Seleção de Dias Indisponíveis */}
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
          {nonWorkingDaysArr.map((day) => (
            <div key={day} className={styles.dayCard}>
              <span>{day}</span>
              <button className={styles.removeDayButton} onClick={() => handleRemoveNonWorkingDay(day)}>
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
