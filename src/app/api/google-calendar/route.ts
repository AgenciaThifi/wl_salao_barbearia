// src/app/api/google-calendar/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/config/firebase";

const DEFAULT_CALENDAR_ID = "thifi.contato.oficial@gmail.com"; // Valor padrão caso não seja passado storeId

/**
 * Helper para obter o Calendar ID a partir do storeId (se fornecido)
 */
async function getCalendarIdFromStore(storeId: string | null): Promise<string> {
  if (!storeId) return DEFAULT_CALENDAR_ID;

  try {
    const storeDocRef = doc(db, "stores", storeId);
    const storeSnap = await getDoc(storeDocRef);
    if (storeSnap.exists()) {
      const data = storeSnap.data();
      if (data.calendarId) {
        return data.calendarId as string;
      }
    }
  } catch (error) {
    console.error("Erro ao buscar Calendar ID da loja:", error);
  }
  return DEFAULT_CALENDAR_ID;
}

/**
 * GET: Lista os eventos do Google Calendar para um dia específico.
 * A rota deve ser chamada com os parâmetros "date=YYYY-MM-DD" (obrigatório) e opcionalmente "storeId".
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // ex: "2025-04-14"
    const storeId = searchParams.get("storeId");

    if (!date) {
      return NextResponse.json(
        { error: "Parâmetro 'date' ausente." },
        { status: 400 }
      );
    }

    const calendarId = await getCalendarIdFromStore(storeId);

    const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!rawCredentials) {
      throw new Error("A variável GOOGLE_SERVICE_ACCOUNT_JSON não está definida.");
    }
    const credentials = JSON.parse(rawCredentials);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar.readonly"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Define o início e o final do dia
    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    const res = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items
      ?.filter((evt) => evt.start?.dateTime || evt.start?.date)
      .map((evt) => {
        const start = new Date(evt.start?.dateTime || evt.start?.date || "");
        const end = new Date(evt.end?.dateTime || evt.end?.date || "");
        return { start, end };
      }) || [];

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Erro ao listar eventos do Google Calendar:", error);
    return NextResponse.json(
      { error: error.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}

/**
 * POST: Cria um evento no Google Calendar com base nos dados enviados.
 * Além dos dados anteriores, espera no body um campo "storeId" opcional para determinar o calendário.
 */
export async function POST(req: Request) {
  try {
    const {
      date,
      time,
      clientName,
      serviceName,
      serviceDuration,
      serviceDescription,
      storeId,
    } = await req.json();

    const calendarId = await getCalendarIdFromStore(storeId);
    
    const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!rawCredentials) {
      throw new Error("A variável GOOGLE_SERVICE_ACCOUNT_JSON não está definida.");
    }
    const credentials = JSON.parse(rawCredentials);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Cria a data de início a partir de "date" e "time"
    const startDateTime = new Date(`${date}T${time}`);
    const duration = parseInt(serviceDuration, 10) || 60;
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const event = {
      summary: `Agendamento: ${clientName} - ${serviceName}`,
      description: `Agendamento feito por ${clientName} para o serviço: ${serviceName}.\nDescrição: ${serviceDescription}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "America/Sao_Paulo",
      },
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: event,
    });

    return NextResponse.json({ success: true, event: response.data });
  } catch (error: any) {
    console.error("Erro ao adicionar evento no Google Calendar:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}
