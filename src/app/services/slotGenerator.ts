// src/app/services/slotGenerator.ts

export interface Slot {
    start: Date;
    end: Date;
    available: boolean;
}

import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Converte uma string "YYYY-MM-DD" para um objeto Date local (configurado à meia-noite local).
 */
function parseLocalDate(yyyyMMdd: string): Date {
    const [year, month, day] = yyyyMMdd.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Busca as configurações de agendamento no Firestore.
 * Assume que o documento está em "config/lunchBreak".
 */
export async function getSchedulingConfig(): Promise<{
    lunchStart: string;         // Formato "HH:MM"
    lunchEnd: string;           // Formato "HH:MM"
    nonWorkingDays: string[];   // ["YYYY-MM-DD", ...]
    timeInterval: number;       // Intervalo, em minutos
    storeOpen: string;          // "HH:MM"
    storeClose: string;         // "HH:MM"
}> {
    const configDocRef = doc(db, "config", "lunchBreak");
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
    return {
        lunchStart: "12:00",
        lunchEnd: "13:00",
        nonWorkingDays: [],
        timeInterval: 30,
        storeOpen: "08:00",
        storeClose: "22:00",
    };
}

async function getCalendarEventsReal(date: Date): Promise<{ start: Date; end: Date }[]> {
    // Formata a data no formato "YYYY-MM-DD"
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const res = await fetch(`/api/google-calendar?date=${dateStr}`, { method: "GET" });
    if (!res.ok) {
        console.error("Erro ao buscar eventos do dia:", await res.text());
        return [];
    }
    const data = await res.json();
    if (!data.events) return [];
    return data.events.map((evt: any) => ({
        start: new Date(evt.start),
        end: new Date(evt.end),
    }));
}


/**
 * Gera os slots para o dia selecionado com base nas configurações obtidas do Firestore.
 * O parâmetro `inputDateStr` deve estar no formato "YYYY-MM-DD". São consideradas:
 *  - Configurações de horário de abertura/fechamento;
 *  - Intervalo entre slots (em minutos);
 *  - Bloqueio do horário de almoço (qualquer sobreposição: se slotStart < lunchEnd e slotEnd > lunchStart);
 *  - Se a data selecionada for o dia atual, elimina os slots que já passaram.
 */
export async function generateDailySlots(inputDateStr: string): Promise<Slot[]> {
    // Converte o input em data local
    const selectedDate = parseLocalDate(inputDateStr);
    const dateStr = inputDateStr; // formato "YYYY-MM-DD"

    // Obtém as configurações
    const config = await getSchedulingConfig();

    // Se o dia estiver na lista de dias indisponíveis, retorna array vazio.
    if (config.nonWorkingDays.includes(dateStr)) {
        return [];
    }

    // Define os horários de funcionamento com base na configuração da loja
    const [openHour, openMinute] = config.storeOpen.split(":").map(Number);
    const [closeHour, closeMinute] = config.storeClose.split(":").map(Number);
    const intervalMinutes = config.timeInterval;

    const slots: Slot[] = [];
    let currentSlot = new Date(selectedDate);
    const todayStr = new Date().toISOString().split("T")[0];

    // Se a data selecionada for hoje, inicia a partir do maior entre o horário de abertura e o horário atual,
    // e arredonda para o próximo múltiplo do intervalo.
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
        // Para datas futuras, inicia no horário de abertura configurado
        currentSlot.setHours(openHour, openMinute, 0, 0);
    }

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(closeHour, closeMinute, 0, 0);

    // Loop para gerar os slots de horário
    while (currentSlot < endOfDay) {
        const slotStart = new Date(currentSlot);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + intervalMinutes);

        // Inicialmente, assume que o slot está disponível
        let available = true;

        // Calcula o horário de almoço a partir da configuração
        const [lunchStartHour, lunchStartMinute] = config.lunchStart.split(":").map(Number);
        const [lunchEndHour, lunchEndMinute] = config.lunchEnd.split(":").map(Number);
        const lunchStartTime = new Date(selectedDate);
        lunchStartTime.setHours(lunchStartHour, lunchStartMinute, 0, 0);
        const lunchEndTime = new Date(selectedDate);
        lunchEndTime.setHours(lunchEndHour, lunchEndMinute, 0, 0);

        // Se o slot tiver qualquer sobreposição com o horário de almoço, torna-o indisponível.
        // Ou seja: se o slot inicia antes do fim do almoço e termina depois do início do almoço.
        if (slotStart < lunchEndTime && slotEnd > lunchStartTime) {
            available = false;
        }

        slots.push({ start: slotStart, end: slotEnd, available });
        currentSlot.setMinutes(currentSlot.getMinutes() + intervalMinutes);
    }

    // Integração com Google Calendar: desabilita os slots que colidem com eventos marcados
    const events = await getCalendarEventsReal(selectedDate);
    events.forEach((event) => {
        slots.forEach((slot) => {
            if (slot.start < event.end && slot.end > event.start) {
                slot.available = false;
            }
        });
    });

    // Se a data for hoje, filtra apenas os slots que começam no futuro (ou exatamente agora)
    if (dateStr === todayStr) {
        const now = new Date();
        return slots.filter((slot) => slot.start.getTime() >= now.getTime());
    }

    return slots;
}
