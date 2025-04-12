// src/app/api/google-calendar/route.ts

import { NextResponse } from "next/server";
import { google } from "googleapis";

const CALENDAR_ID = "thifi.contato.oficial@gmail.com";

/**
 * GET: Lista os eventos do Google Calendar para um dia específico.
 * A rota deve ser chamada com o parâmetro "date=YYYY-MM-DD".
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // ex: "2025-04-14"
    if (!date) {
      return NextResponse.json(
        { error: "Parâmetro 'date' ausente." },
        { status: 400 }
      );
    }

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

    // Define o início e o final do dia em questão
    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    if (!res.data.items) {
      return NextResponse.json({ events: [] });
    }

    // Mapeia os eventos para { start: Date, end: Date }
    const events = res.data.items
      .filter((evt) => evt.start?.dateTime || evt.start?.date)
      .map((evt) => {
        const start = new Date(evt.start?.dateTime || evt.start?.date || "");
        const end = new Date(evt.end?.dateTime || evt.end?.date || "");
        return { start, end };
      });

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
    } = await req.json();

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

    // Cria a data de início usando date e time (formato "YYYY-MM-DD" e "HH:MM")
    const startDateTime = new Date(`${date}T${time}`);
    // Calcula o término com base na duração (em minutos)
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
      calendarId: CALENDAR_ID,
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
