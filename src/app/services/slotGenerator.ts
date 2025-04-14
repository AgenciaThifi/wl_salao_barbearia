// src/app/services/slotGenerator.ts

export interface Slot {
    start: Date;
    end: Date;
    available: boolean;
  }
  
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "../config/firebase";
  
  /**
   * Converte uma string "YYYY-MM-DD" para um objeto Date local (às 00:00 local).
   */
  function parseLocalDate(yyyyMMdd: string): Date {
    const [year, month, day] = yyyyMMdd.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  
  /**
   * Busca as configurações de agendamento no Firestore para a loja identificada por `storeId`.
   * Lê o documento na coleção "stores".
   */
  export async function getSchedulingConfig(storeId: string): Promise<{
    lunchStart: string;
    lunchEnd: string;
    nonWorkingDays: string[];
    timeInterval: number;
    storeOpen: string;
    storeClose: string;
  }> {
    try {
      const configDocRef = doc(db, "stores", storeId);
      const docSnap = await getDoc(configDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          lunchStart: data.lunchStart || "12:00",
          lunchEnd: data.lunchEnd || "13:00",
          nonWorkingDays: data.nonWorkingDays || [],
          timeInterval: data.timeInterval || 30,
          storeOpen: data.storeOpen || "08:00",
          storeClose: data.storeClose || "22:00",
        };
      }
    } catch (error) {
      console.error("Erro ao buscar configuração da loja:", error);
    }
    // Valores padrão caso não encontre o documento ou ocorra erro
    return {
      lunchStart: "12:00",
      lunchEnd: "13:00",
      nonWorkingDays: [],
      timeInterval: 30,
      storeOpen: "08:00",
      storeClose: "22:00",
    };
  }
  
  /**
   * Consulta a rota /api/google-calendar para obter os eventos do dia, passando também o storeId.
   * Assim, o endpoint usará o 'calendarId' correto armazenado no documento da loja.
   */
  async function getCalendarEventsReal(date: Date, storeId: string): Promise<{ start: Date; end: Date }[]> {
    // Formata a data no formato "YYYY-MM-DD"
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;
  
    // Monta a URL com os parâmetros date e storeId
    const url = `/api/google-calendar?date=${dateStr}&storeId=${storeId}`;
  
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      console.error("Erro ao buscar eventos do dia:", await res.text());
      return [];
    }
    const data = await res.json();
    if (!data.events) return [];
  
    // Converte os campos start/end de string para Date
    return data.events.map((evt: any) => ({
      start: new Date(evt.start),
      end: new Date(evt.end),
    }));
  }
  
  /**
   * Gera os slots para o dia selecionado com base nas configurações da loja identificada por `storeId`.
   *
   * Parâmetros:
   *  - inputDateStr: data no formato "YYYY-MM-DD"
   *  - storeId: ID da loja, para buscar a configuração específica + calendarId
   *
   * Lógica:
   *  1. Lê a configuração da loja no Firestore (horários de abertura/fechamento, lunchStart, etc).
   *  2. Se a data estiver em nonWorkingDays, retorna um array vazio.
   *  3. Gera os slots conforme o timeInterval; bloqueia o período de almoço.
   *  4. Chama getCalendarEventsReal(date, storeId) para buscar eventos do dia e marcar slots ocupados.
   *  5. Se a data é hoje, filtra apenas slots futuros.
   */
  export async function generateDailySlots(inputDateStr: string, storeId: string): Promise<Slot[]> {
    const selectedDate = parseLocalDate(inputDateStr);
    const dateStr = inputDateStr; // "YYYY-MM-DD"
  
    // Obtém a configuração da loja
    const config = await getSchedulingConfig(storeId);
  
    // Se dia estiver nos nonWorkingDays, retorna vazio
    if (config.nonWorkingDays.includes(dateStr)) {
      return [];
    }
  
    // Extrai horários de funcionamento e intervalo
    const [openHour, openMinute] = config.storeOpen.split(":").map(Number);
    const [closeHour, closeMinute] = config.storeClose.split(":").map(Number);
    const intervalMinutes = config.timeInterval;
  
    const slots: Slot[] = [];
    let currentSlot = new Date(selectedDate);
    const todayStr = new Date().toISOString().split("T")[0];
  
    // Se for hoje, começa do máximo entre o horário atual e o horário de abertura;
    // e arredonda para o próximo múltiplo do intervalo
    if (dateStr === todayStr) {
      const now = new Date();
      const storeOpenTime = new Date(selectedDate);
      storeOpenTime.setHours(openHour, openMinute, 0, 0);
      currentSlot = now > storeOpenTime ? now : storeOpenTime;
  
      const minutes = currentSlot.getMinutes();
      const remainder = minutes % intervalMinutes;
      if (remainder !== 0) {
        currentSlot.setMinutes(minutes + (intervalMinutes - remainder));
      }
    } else {
      currentSlot.setHours(openHour, openMinute, 0, 0);
    }
  
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(closeHour, closeMinute, 0, 0);
  
    // Gera os slots
    while (currentSlot < endOfDay) {
      const slotStart = new Date(currentSlot);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + intervalMinutes);
  
      let available = true;
  
      // Horário de almoço
      const [lunchStartHour, lunchStartMinute] = config.lunchStart.split(":").map(Number);
      const [lunchEndHour, lunchEndMinute] = config.lunchEnd.split(":").map(Number);
      const lunchStartTime = new Date(selectedDate);
      lunchStartTime.setHours(lunchStartHour, lunchStartMinute, 0, 0);
      const lunchEndTime = new Date(selectedDate);
      lunchEndTime.setHours(lunchEndHour, lunchEndMinute, 0, 0);
  
      // Bloqueia slot se houver sobreposição com almoço
      if (slotStart < lunchEndTime && slotEnd > lunchStartTime) {
        available = false;
      }
  
      slots.push({ start: slotStart, end: slotEnd, available });
      currentSlot.setMinutes(currentSlot.getMinutes() + intervalMinutes);
    }
  
    // Desabilita slots que colidem com eventos retornados do Google Calendar
    const events = await getCalendarEventsReal(selectedDate, storeId);
    events.forEach((event) => {
      slots.forEach((slot) => {
        if (slot.start < event.end && slot.end > event.start) {
          slot.available = false;
        }
      });
    });
  
    // Se for hoje, retorna apenas slots futuros
    if (dateStr === todayStr) {
      const now = new Date();
      return slots.filter((slot) => slot.start.getTime() >= now.getTime());
    }
  
    return slots;
  }
  