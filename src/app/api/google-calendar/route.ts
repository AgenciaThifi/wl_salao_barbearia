import { NextResponse } from "next/server";
import { google } from "googleapis";

const CALENDAR_ID = "thifi.contato.oficial@gmail.com";

export async function POST(req: Request) {
  try {
    const { date, time, clientName, serviceName, serviceDuration, serviceDescription } = await req.json();

    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error("A variável GOOGLE_APPLICATION_CREDENTIALS não está definida.");
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/calendar"],
    });

    const calendar = google.calendar({ version: "v3", auth });

    // Cria a data de início
    const startDateTime = `${date}T${time}:00`;
    const tempoEmMinutos = parseInt(serviceDuration, 10) || 60;
    const startDateObj = new Date(startDateTime);
    startDateObj.setMinutes(startDateObj.getMinutes() + tempoEmMinutos);
    const endDateTime = startDateObj.toISOString();

    const event = {
      summary: `Agendamento: ${clientName} - ${serviceName}`,
      description: `Agendamento feito por ${clientName} para o serviço: ${serviceName}.\nDescrição do serviço: ${serviceDescription}`,
      start: {
        dateTime: `${date}T${time}:00`,
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
