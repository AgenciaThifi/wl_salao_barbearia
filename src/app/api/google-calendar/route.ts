import { NextResponse } from "next/server";
import { google } from "googleapis";

const CALENDAR_ID = "59f41da4ab32c7e6d8b4f21fda0be22f17ef0466eb7d6e85ac595600d6098e39@group.calendar.google.com"; // Substitua pelo ID real do calendário

export async function POST(req: Request) {
  try {
    const { date, time, clientName } = await req.json();

    // Verifica se a variável de ambiente está definida
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error("A variável GOOGLE_APPLICATION_CREDENTIALS não está definida.");
    }

    // Autenticação com as credenciais do arquivo
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: "v3", auth });

    const startDateTime = `${date}T${time}:00`;
    const endTimeHour = (parseInt(time.split(":")[0]) + 1).toString().padStart(2, "0");
    const endDateTime = `${date}T${endTimeHour}:${time.split(":")[1]}:00`;

    const event = {
      summary: `Agendamento: ${clientName}`,
      description: `Agendamento feito por ${clientName} no salão.`,
      start: {
        dateTime: startDateTime,
        timeZone: "America/Sao_Paulo",
      },
      end: {
        dateTime: endDateTime,
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
